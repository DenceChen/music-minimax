const { test, expect } = require('@playwright/test');

test.describe('Music MiniMax 应用 - E2E测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test.afterEach(async ({ page }) => {
    await page.waitForTimeout(500);
  });

  test('页面标题正确', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('AI 歌曲生成器');
  });

  test('页面加载成功 - 验证所有核心元素存在', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('input[placeholder*="描述"]')).toBeVisible();
    await expect(page.locator('button:has-text("发送")')).toBeVisible();
  });

  test('完整对话流程 - 用户输入并发送', async ({ page }) => {
    const input = page.locator('input[placeholder*="描述"]');
    await input.fill('我想听一首关于大海的歌');
    await page.locator('button:has-text("发送")').click();

    // 等待对话出现
    await expect(page.locator('text=AI')).toBeVisible();
    await expect(page.locator('text=你')).toBeVisible();
  });

  test('对话显示用户和AI消息', async ({ page }) => {
    const input = page.locator('input[placeholder*="描述"]');
    await input.fill('测试消息');
    await page.locator('button:has-text("发送")').click();

    // 验证对话区域有内容
    await expect(page.locator('div:has-text("测试消息")')).toBeVisible();
  });

  test('发送按钮状态正常', async ({ page }) => {
    const sendButton = page.locator('button:has-text("发送")');
    await expect(sendButton).toBeEnabled();

    // 输入内容后按钮仍然可用
    const input = page.locator('input[placeholder*="描述"]');
    await input.fill('测试');
    await expect(sendButton).toBeEnabled();
  });

  test('输入框可清空并重新输入', async ({ page }) => {
    const input = page.locator('input[placeholder*="描述"]');

    await input.fill('第一次输入');
    await input.fill('第二次输入');

    const inputValue = await input.inputValue();
    expect(inputValue).toBe('第二次输入');
  });

  test('歌词区域初始不显示', async ({ page }) => {
    // 初始状态下歌词区域不应存在
    await expect(page.locator('textarea')).not.toBeVisible();
  });

  test('生成歌词按钮在对话后出现', async ({ page }) => {
    const input = page.locator('input[placeholder*="描述"]');
    await input.fill('一首情歌');
    await page.locator('button:has-text("发送")').click();

    // 等待按钮出现
    await expect(page.locator('button:has-text("开始生成歌词")')).toBeVisible({ timeout: 5000 });
  });

  test('点击生成歌词后显示歌词编辑区', async ({ page }) => {
    const input = page.locator('input[placeholder*="描述"]');
    await input.fill('一首情歌');
    await page.locator('button:has-text("发送")').click();

    // 点击生成歌词
    await page.locator('button:has-text("开始生成歌词")').click();

    // 等待歌词区域出现
    await expect(page.locator('textarea')).toBeVisible({ timeout: 5000 });
  });

  test('歌词编辑区显示在歌词阶段', async ({ page }) => {
    const input = page.locator('input[placeholder*="描述"]');
    await input.fill('测试歌词生成');
    await page.locator('button:has-text("发送")').click();

    // 点击生成歌词按钮
    await page.locator('button:has-text("开始生成歌词")').click();

    // 验证歌词文本框
    const textarea = page.locator('textarea');
    await expect(textarea).toBeVisible();
    await expect(textarea).toHaveAttribute('placeholder', /歌词/);
  });

  test('生成歌曲按钮在歌词阶段可用', async ({ page }) => {
    const input = page.locator('input[placeholder*="描述"]');
    await input.fill('测试');
    await page.locator('button:has-text("发送")').click();

    await page.locator('button:has-text("开始生成歌词")').click();

    // 在歌词阶段应该有生成歌曲按钮
    await expect(page.locator('button:has-text("生成歌曲")')).toBeVisible({ timeout: 5000 });
  });

  test('移动端布局正常', async ({ page }) => {
    // 设置移动端视口
    await page.setViewportSize({ width: 375, height: 667 });

    // 验证核心元素仍然可见
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('input[placeholder*="描述"]')).toBeVisible();
    await expect(page.locator('button:has-text("发送")')).toBeVisible();
  });

  test('移动端输入框适应小屏幕', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    const input = page.locator('input[placeholder*="描述"]');
    await expect(input).toBeVisible();

    // 输入应该正常工作
    await input.fill('移动端测试');
    const value = await input.inputValue();
    expect(value).toBe('移动端测试');
  });

  test('平板端布局正常', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });

    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('input[placeholder*="描述"]')).toBeVisible();
  });

  test('刷新页面后状态重置', async ({ page }) => {
    const input = page.locator('input[placeholder*="描述"]');
    await input.fill('测试消息');
    await page.locator('button:has-text("发送")').click();

    // 刷新页面
    await page.reload();

    // 验证状态已重置
    await expect(page.locator('input[placeholder*="描述"]')).toHaveValue('');
  });

  test('键盘回车键可提交', async ({ page }) => {
    const input = page.locator('input[placeholder*="描述"]');
    await input.fill('按回车发送');
    await input.press('Enter');

    // 等待AI响应出现
    await expect(page.locator('text=AI')).toBeVisible({ timeout: 5000 });
  });
});