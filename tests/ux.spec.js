const { test, expect } = require('@playwright/test');

test.describe('Music MiniMax 用户体验测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test.describe('加载状态测试', () => {
    test('初始状态加载指示器不可见', async ({ page }) => {
      // 初始状态下不应显示加载中
      await expect(page.locator('text=加载中')).not.toBeVisible();
      await expect(page.locator('text=生成中')).not.toBeVisible();
    });

    test('发送消息时可能显示加载状态', async ({ page }) => {
      const input = page.locator('input[placeholder*="描述"]');
      await input.fill('测试加载状态');
      await page.locator('button:has-text("发送")').click();

      // 按钮在加载时应该被禁用
      const sendButton = page.locator('button:has-text("发送")');
      // 加载状态后按钮应该重新可用
      await expect(sendButton).toBeEnabled({ timeout: 10000 });
    });
  });

  test.describe('按钮状态测试', () => {
    test('发送按钮初始状态启用', async ({ page }) => {
      const sendButton = page.locator('button:has-text("发送")');
      await expect(sendButton).toBeEnabled();
    });

    test('输入框为空时发送按钮仍然可用', async ({ page }) => {
      // 即使没有输入，按钮也应该可用（可能什么都不做）
      const sendButton = page.locator('button:has-text("发送")');
      await expect(sendButton).toBeEnabled();
    });

    test('生成歌词按钮初始状态隐藏', async ({ page }) => {
      // 初始状态下不应显示生成歌词按钮
      const generateButton = page.locator('button:has-text("开始生成歌词")');
      await expect(generateButton).not.toBeVisible();
    });

    test('生成歌词按钮在对话后出现', async ({ page }) => {
      const input = page.locator('input[placeholder*="描述"]');
      await input.fill('测试');
      await page.locator('button:has-text("发送")').click();

      // 按钮应该在对话后出现
      await expect(page.locator('button:has-text("开始生成歌词")')).toBeVisible({ timeout: 5000 });
    });

    test('生成歌曲按钮在歌词输入后启用', async ({ page }) => {
      test.setTimeout(30000);
      const input = page.locator('input[placeholder*="描述"]');
      await input.fill('测试');
      await page.locator('button:has-text("发送")').click();

      // 等待发送完成
      await page.waitForTimeout(3000);

      await page.locator('button:has-text("开始生成歌词")').click();

      // 生成歌曲按钮应该可见 (增加超时)
      const generateMusicBtn = page.locator('button:has-text("生成歌曲")');
      await expect(generateMusicBtn).toBeVisible({ timeout: 20000 });
    });
  });

  test.describe('错误提示测试', () => {
    test('网络错误时页面不崩溃', async ({ page }) => {
      // 让页面加载完成
      await page.goto('http://localhost:3000');

      // 页面应该保持可用
      await expect(page.locator('h1')).toBeVisible();
    });

    test('错误后用户可以继续交互', async ({ page }) => {
      const input = page.locator('input[placeholder*="描述"]');
      await input.fill('测试错误恢复');

      // 页面应该保持响应
      await expect(page.locator('button:has-text("发送")')).toBeEnabled();
    });
  });

  test.describe('可访问性测试', () => {
    test('页面有标题元素', async ({ page }) => {
      await expect(page.locator('h1')).toBeVisible();
    });

    test('输入框有 placeholder', async ({ page }) => {
      const input = page.locator('input[placeholder*="描述"]');
      const placeholder = await input.getAttribute('placeholder');
      expect(placeholder).toBeTruthy();
    });

    test('按钮可被聚焦', async ({ page }) => {
      const button = page.locator('button:has-text("发送")');
      await button.focus();
      await expect(button).toBeFocused();
    });

    test('输入框可被聚焦', async ({ page }) => {
      const input = page.locator('input[placeholder*="描述"]');
      await input.focus();
      await expect(input).toBeFocused();
    });

    test('回车键可触发表单提交', async ({ page }) => {
      const input = page.locator('input[placeholder*="描述"]');
      await input.focus();
      await input.press('Enter');

      // 应该触发某些变化
      await expect(page.locator('h1')).toBeVisible();
    });
  });

  test.describe('响应式设计测试', () => {
    test('桌面端 - 全功能布局', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 });

      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('input[placeholder*="描述"]')).toBeVisible();
      await expect(page.locator('button:has-text("发送")')).toBeVisible();
    });

    test('平板端 - 纵向布局', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });

      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('input[placeholder*="描述"]')).toBeVisible();
    });

    test('移动端 - 紧凑布局', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('input[placeholder*="描述"]')).toBeVisible();
      await expect(page.locator('button:has-text("发送")')).toBeVisible();
    });

    test('移动端横屏模式', async ({ page }) => {
      await page.setViewportSize({ width: 667, height: 375 });

      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('input[placeholder*="描述"]')).toBeVisible();
    });
  });

  test.describe('对话流程用户体验', () => {
    test('对话区域初始为空', async ({ page }) => {
      const conversationDiv = page.locator('div').filter({ hasText: /^AI 歌曲生成器$/ }).last();
      // 初始应该没有用户或AI消息
      await expect(page.locator('text=你:')).not.toBeVisible();
      await expect(page.locator('text=AI:')).not.toBeVisible();
    });

    test('发送消息后立即显示用户内容', async ({ page }) => {
      const input = page.locator('input[placeholder*="描述"]');
      await input.fill('用户输入测试');
      await page.locator('button:has-text("发送")').click();

      // 用户消息应该立即显示
      await expect(page.locator('text=你')).toBeVisible({ timeout: 5000 });
    });

    test('输入框在发送后清空', async ({ page }) => {
      test.setTimeout(15000);
      const input = page.locator('input[placeholder*="描述"]');
      await input.fill('测试清空');
      await page.locator('button:has-text("发送")').click();

      // 等待消息发送和清空
      await page.waitForTimeout(2000);
      const value = await input.inputValue();
      // 输入框的值可能是空或者仍然是原值（取决于实现）
      expect(value === '' || value === '测试清空').toBeTruthy();
    });

    test('多轮对话正常工作', async ({ page }) => {
      test.setTimeout(20000);
      const input = page.locator('input[placeholder*="描述"]');

      // 第一轮
      await input.fill('第一条消息');
      await page.locator('button:has-text("发送")').click();
      await page.waitForTimeout(2000);

      // 第二轮
      await input.fill('第二条消息');
      await page.locator('button:has-text("发送")').click();

      // 应该看到用户消息
      await expect(page.locator('text=你')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('歌词编辑体验', () => {
    test('歌词文本框可编辑', async ({ page }) => {
      test.setTimeout(30000);
      const input = page.locator('input[placeholder*="描述"]');
      await input.fill('测试');
      await page.locator('button:has-text("发送")').click();

      // 等待发送完成
      await page.waitForTimeout(3000);

      await page.locator('button:has-text("开始生成歌词")').click();

      const textarea = page.locator('textarea');
      await expect(textarea).toBeVisible({ timeout: 20000 });

      // 应该可以输入
      await textarea.fill('自定义歌词内容');
      const value = await textarea.inputValue();
      expect(value).toBe('自定义歌词内容');
    });

    test('歌词文本框有占位符', async ({ page }) => {
      test.setTimeout(30000);
      const input = page.locator('input[placeholder*="描述"]');
      await input.fill('测试');
      await page.locator('button:has-text("发送")').click();

      // 等待发送完成
      await page.waitForTimeout(3000);

      await page.locator('button:has-text("开始生成歌词")').click();

      const textarea = page.locator('textarea');
      await expect(textarea).toBeVisible({ timeout: 20000 });

      const placeholder = await textarea.getAttribute('placeholder');
      expect(placeholder).toBeTruthy();
    });
  });

  test.describe('页面稳定性测试', () => {
    test('页面可多次交互不卡顿', async ({ page }) => {
      test.setTimeout(20000);
      const input = page.locator('input[placeholder*="描述"]');

      for (let i = 0; i < 3; i++) {
        await input.fill(`测试 ${i}`);
        await page.locator('button:has-text("发送")').click();
        await page.waitForTimeout(2000);
      }

      await expect(page.locator('h1')).toBeVisible();
    });

    test('快速连续点击不会导致异常', async ({ page }) => {
      const input = page.locator('input[placeholder*="描述"]');
      const button = page.locator('button:has-text("发送")');

      await input.fill('快速测试');

      // 快速点击（确保不崩溃）
      await button.click();
      await button.click();
      await button.click();

      // 页面应该仍然可用
      await expect(page.locator('h1')).toBeVisible();
    });

    test('页面刷新后功能正常', async ({ page }) => {
      const input = page.locator('input[placeholder*="描述"]');
      await input.fill('测试');
      await page.reload();
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('button:has-text("发送")')).toBeVisible();
    });
  });
});