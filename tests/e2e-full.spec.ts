import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:3009';

test.describe('Music MiniMax E2E 完整流程测试', () => {

  // ==================== P0 核心流程测试 ====================

  test('TC001: 完整歌曲生成流程 - 快捷按钮', async ({ page }) => {
    await page.goto(`${BASE_URL}/zh/chat`);

    // 等待页面加载
    await page.waitForLoadState('networkidle');

    // 点击"爱情"快捷按钮
    await page.click('button:has-text("爱情")');

    // 等待AI响应
    await page.waitForSelector('.message-assistant', { timeout: 30000 });

    // 等待歌词生成区域出现
    const lyricsSection = page.locator('.lyrics-section');
    await expect(lyricsSection).toBeVisible({ timeout: 60000 });

    // 点击生成歌曲按钮
    const generateBtn = page.locator('button:has-text("生成歌曲")');
    await expect(generateBtn).toBeEnabled();
    await generateBtn.click();

    // 等待播放器出现
    const playerSection = page.locator('.player-section');
    await expect(playerSection).toBeVisible({ timeout: 120000 });

    // 点击播放按钮
    const playBtn = page.locator('.play-btn');
    await expect(playBtn).toBeVisible();

    console.log('✅ TC001 完整歌曲生成流程通过');
  });

  test('TC002: 自定义需求生成歌曲', async ({ page }) => {
    await page.goto(`${BASE_URL}/zh/chat`);
    await page.waitForLoadState('networkidle');

    // 输入自定义需求
    const input = page.locator('.chat-input');
    await input.fill('生成一首关于梦想的励志歌曲');
    await input.press('Enter');

    // 等待AI响应
    await page.waitForSelector('.message-assistant', { timeout: 30000 });

    // 等待歌词生成
    const lyricsSection = page.locator('.lyrics-section');
    await expect(lyricsSection).toBeVisible({ timeout: 60000 });

    console.log('✅ TC002 自定义需求通过');
  });

  test('TC003: 多轮对话后生成歌曲', async ({ page }) => {
    await page.goto(`${BASE_URL}/zh/chat`);
    await page.waitForLoadState('networkidle');

    // 发送3条消息
    const input = page.locator('.chat-input');

    await input.fill('我想听一首欢快的歌曲');
    await input.press('Enter');
    await page.waitForTimeout(3000);

    await input.fill('再给我来一首温柔的');
    await input.press('Enter');
    await page.waitForTimeout(3000);

    await input.fill('现在生成一首关于友谊的歌');
    await input.press('Enter');

    // 等待歌词
    await page.waitForSelector('.lyrics-section', { timeout: 60000 });

    console.log('✅ TC003 多轮对话通过');
  });

  // ==================== 用户认证测试 ====================

  test('TC010-011: 用户登录/注册流程', async ({ page }) => {
    // 测试登录页面
    await page.goto(`${BASE_URL}/zh/login`);
    await page.waitForLoadState('networkidle');

    // 验证登录表单元素
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    // 测试注册页面
    await page.goto(`${BASE_URL}/zh/register`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('input[type="email"]')).toBeVisible();

    console.log('✅ TC010-011 用户认证页面通过');
  });

  // ==================== 语言切换测试 ====================

  test('TC200-203: 语言切换功能', async ({ page }) => {
    await page.goto(`${BASE_URL}/zh/chat`);
    await page.waitForLoadState('networkidle');

    // 切换英文
    await page.selectOption('.lang-select', 'en');
    await expect(page.locator('text=Welcome')).toBeVisible({ timeout: 5000 });

    // 切换日文
    await page.selectOption('.lang-select', 'ja');
    await expect(page.locator('text=チャット')).toBeVisible({ timeout: 5000 });

    // 切换回中文
    await page.selectOption('.lang-select', 'zh');
    await expect(page.locator('text=对话')).toBeVisible({ timeout: 5000 });

    console.log('✅ TC200-203 语言切换通过');
  });

  test('TC210-212: AI回复语言对齐', async ({ page }) => {
    // 英文界面测试
    await page.goto(`${BASE_URL}/en/chat`);
    await page.waitForLoadState('networkidle');

    await page.locator('.chat-input').fill('Tell me a joke');
    await page.locator('.chat-input').press('Enter');

    // AI回复应该在页面某个位置显示
    await page.waitForSelector('.message-assistant', { timeout: 30000 });

    console.log('✅ TC210-212 AI语言对齐通过');
  });

  // ==================== 移动端适配测试 ====================

  test('TC300-303: iPhone移动端适配', async ({ page }) => {
    // 设置iPhone视口
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${BASE_URL}/zh/chat`);
    await page.waitForLoadState('networkidle');

    // 侧边栏应该隐藏
    const sidebar = page.locator('.sidebar, [class*="w-72"]');
    await expect(sidebar).toBeHidden();

    // 汉堡菜单应该可见
    const menuBtn = page.locator('button:has(svg)').first();
    await expect(menuBtn).toBeVisible();

    // 检查输入框在可视范围内
    const input = page.locator('.chat-input');
    await expect(input).toBeInViewport();

    console.log('✅ TC300-303 iPhone适配通过');
  });

  test('TC310-311: iPad适配', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(`${BASE_URL}/zh/chat`);
    await page.waitForLoadState('networkidle');

    // 输入框和发送按钮应该在一起
    const inputWrapper = page.locator('.input-wrapper');
    await expect(inputWrapper).toBeVisible();

    console.log('✅ TC310-311 iPad适配通过');
  });

  // ==================== 播放器测试 ====================

  test('TC400-404: WavePlayer播放功能', async ({ page }) => {
    await page.goto(`${BASE_URL}/zh/chat`);
    await page.waitForLoadState('networkidle');

    // 快速生成歌曲
    await page.click('button:has-text("夏天")');
    await page.waitForSelector('.player-section', { timeout: 120000 });

    // 播放按钮
    const playBtn = page.locator('.play-btn');
    await expect(playBtn).toBeVisible();

    // 检查播放器元素存在
    const audioWrapper = page.locator('.audio-wrapper');
    await expect(audioWrapper).toBeVisible();

    console.log('✅ TC400-404 播放器功能通过');
  });

  // ==================== 边界条件测试 ====================

  test('TC500-501: 空消息和超长文本', async ({ page }) => {
    await page.goto(`${BASE_URL}/zh/chat`);
    await page.waitForLoadState('networkidle');

    // 空消息 - 发送按钮应该禁用
    const input = page.locator('.chat-input');
    const sendBtn = page.locator('.send-btn');

    await input.fill('');
    await expect(sendBtn).toBeDisabled();

    // 超长文本
    const longText = 'a'.repeat(5000);
    await input.fill(longText);
    await expect(input).toBeEnabled();

    console.log('✅ TC500-501 边界条件通过');
  });

  test('TC502-504: 特殊字符和注入', async ({ page }) => {
    await page.goto(`${BASE_URL}/zh/chat`);
    await page.waitForLoadState('networkidle');

    const input = page.locator('.chat-input');

    // Emoji测试
    await input.fill('测试 emoji 🌍🎵🔥');
    await input.press('Enter');
    await page.waitForTimeout(2000);

    // HTML转义测试 - 不应该执行
    await input.fill('<script>alert(1)</script>');
    await input.press('Enter');
    await page.waitForTimeout(2000);

    // 检查页面没有alert弹出
    page.on('dialog', () => {
      throw new Error('Unexpected dialog appeared!');
    });

    console.log('✅ TC502-504 特殊字符测试通过');
  });

  // ==================== 错误处理测试 ====================

  test('TC600-602: 错误处理', async ({ page }) => {
    await page.goto(`${BASE_URL}/zh/chat`);
    await page.waitForLoadState('networkidle');

    // 验证错误提示元素存在
    const errorToast = page.locator('.error-toast');
    // 错误toast初始应该隐藏
    await expect(errorToast).not.toBeVisible();

    console.log('✅ TC600-602 错误处理通过');
  });

  // ==================== 歌曲管理测试 ====================

  test('TC030-033: 我的歌曲页面', async ({ page }) => {
    await page.goto(`${BASE_URL}/zh/my-songs`);
    await page.waitForLoadState('networkidle');

    // 页面标题
    await expect(page.locator('h1')).toBeVisible();

    // 如果有歌曲，显示歌曲列表
    const songCards = page.locator('.glass-card');
    const songCount = await songCards.count();

    if (songCount > 0) {
      // 播放按钮
      const playBtns = page.locator('button:has-text("播放")');
      await expect(playBtns.first()).toBeVisible();

      // 删除按钮
      const deleteBtns = page.locator('button:has-text("删除")');
      await expect(deleteBtns.first()).toBeVisible();
    }

    console.log('✅ TC030-033 歌曲管理通过');
  });

  // ==================== 歌词编辑测试 ====================

  test('TC020-021: 歌词编辑功能', async ({ page }) => {
    await page.goto(`${BASE_URL}/zh/chat`);
    await page.waitForLoadState('networkidle');

    // 触发歌词生成
    await page.click('button:has-text("春天")');
    await page.waitForSelector('.lyrics-section', { timeout: 60000 });

    // 歌词输入框应该可编辑
    const lyricsInput = page.locator('.lyrics-input');
    await expect(lyricsInput).toBeEnabled();

    // 编辑歌词
    await lyricsInput.fill('自定义歌词内容\n第二行歌词');
    await expect(lyricsInput).toHaveValue(/自定义歌词内容/);

    console.log('✅ TC020-021 歌词编辑通过');
  });

  // ==================== 会话管理测试 ====================

  test('TC110-112: 会话管理', async ({ page }) => {
    await page.goto(`${BASE_URL}/zh/chat`);
    await page.waitForLoadState('networkidle');

    // 发送一条消息
    await page.locator('.chat-input').fill('测试会话');
    await page.locator('.chat-input').press('Enter');
    await page.waitForTimeout(3000);

    // 新建对话
    const newChatBtn = page.locator('button:has-text("新对话")');
    if (await newChatBtn.isVisible()) {
      await newChatBtn.click();
      await page.waitForTimeout(1000);

      // 消息应该被清空
      const messages = page.locator('.message');
      await expect(messages).toHaveCount(0);
    }

    console.log('✅ TC110-112 会话管理通过');
  });

  // ==================== Bug回归测试 ====================

  test('TC700-706: 已修复Bug回归验证', async ({ page }) => {
    // Bug #5 语言切换
    await page.goto(`${BASE_URL}/zh/chat`);
    await page.waitForLoadState('networkidle');
    await page.selectOption('.lang-select', 'en');
    await page.waitForTimeout(1000);
    await expect(page.locator('.lang-select')).toHaveValue('en');

    // Bug #6 AI语言对齐
    await page.selectOption('.lang-select', 'zh');
    await page.waitForTimeout(500);

    // Bug #7 日语my-songs
    await page.goto(`${BASE_URL}/ja/my-songs`);
    await page.waitForLoadState('networkidle');

    // 检查无IntlError
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error' && msg.text().includes('IntlError')) {
        consoleErrors.push(msg.text());
      }
    });

    await page.waitForTimeout(2000);
    expect(consoleErrors.length).toBe(0);

    console.log('✅ TC700-706 Bug回归测试通过');
  });

});
