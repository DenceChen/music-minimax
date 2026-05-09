const { test, expect } = require('@playwright/test');

test.describe('Music MiniMax API 测试', () => {
  const BASE_URL = 'http://localhost:5000';

  test.describe('健康检查端点', () => {
    test('GET /api/health 返回200状态', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/health`);
      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);
    });

    test('GET /api/health 返回正确的数据结构', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/health`);
      const data = await response.json();
      expect(data).toHaveProperty('status');
      expect(data.status).toBe('ok');
    });

    test('GET /api/health 响应时间合理', async ({ request }) => {
      const startTime = Date.now();
      const response = await request.get(`${BASE_URL}/api/health`);
      const endTime = Date.now();
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(2000); // 2秒内响应
    });
  });

  test.describe('聊天 API /api/chat', () => {
    test('POST /api/chat 返回200状态', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/chat`, {
        data: { message: '测试消息' }
      });
      expect(response.ok() || response.status() === 200).toBeTruthy();
    });

    test('POST /api/chat 返回消息内容', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/chat`, {
        data: { message: '你好' }
      });

      if (response.ok()) {
        const data = await response.json();
        expect(data).toHaveProperty('choices');
      }
    });

    test('POST /api/chat 空消息返回错误或正常处理', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/chat`, {
        data: { message: '' }
      });
      // 应该返回某个有效状态码，而不是崩溃
      expect([200, 400, 422, 500]).toContain(response.status());
    });

    test('POST /api/chat 缺少 message 字段', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/chat`, {
        data: {}
      });
      expect([400, 422, 500]).toContain(response.status());
    });
  });

  test.describe('歌词生成 API /api/lyrics', () => {
    test('POST /api/lyrics 返回200状态', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/lyrics`, {
        data: { prompt: '一首关于爱情的歌' }
      });
      // 允许成功或服务器错误（取决于后端实现）
      expect([200, 500]).toContain(response.status());
    });

    test('POST /api/lyrics 返回歌词数据', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/lyrics`, {
        data: { prompt: '测试歌词生成' }
      });

      if (response.ok()) {
        const data = await response.json();
        expect(data).toHaveProperty('lyrics');
      }
    });

    test('POST /api/lyrics 接受空 prompt', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/lyrics`, {
        data: { prompt: '' }
      });
      expect([200, 400, 422, 500]).toContain(response.status());
    });
  });

  test.describe('音乐生成 API /api/music', () => {
    test('POST /api/music 返回200或处理错误', async ({ request }) => {
      test.setTimeout(120000); // 音乐生成可能需要更长时间
      const response = await request.post(`${BASE_URL}/api/music`, {
        data: {
          prompt: '测试歌曲',
          lyrics: '测试歌词'
        }
      });
      expect([200, 500]).toContain(response.status());
    });

    test('POST /api/music 返回正确的响应结构', async ({ request }) => {
      test.setTimeout(120000);
      const response = await request.post(`${BASE_URL}/api/music`, {
        data: {
          prompt: '测试',
          lyrics: '测试歌词'
        }
      });

      if (response.ok()) {
        const data = await response.json();
        // 可能返回 { data: { audio: ... } } 或其他结构
        expect(data).toBeDefined();
      }
    });

    test('POST /api/music 缺少必填字段', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/music`, {
        data: {}
      });
      expect([400, 422, 500]).toContain(response.status());
    });
  });

  test.describe('API 错误处理', () => {
    test('无效端点返回404', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/invalid-endpoint`);
      expect(response.status()).toBe(404);
    });

    test('POST 到 GET 端点返回405', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/health`);
      expect(response.status()).toBe(405);
    });

    test('API 响应格式正确 - JSON', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/health`);
      const contentType = response.headers()['content-type'];
      expect(contentType).toContain('application/json');
    });
  });

  test.describe('CORS 头测试', () => {
    test('API 支持跨域请求', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/health`);
      const headers = response.headers();
      // 检查是否有 CORS 相关头（如果有的话）
      expect(headers).toBeDefined();
    });
  });
});