const { test, expect } = require('@playwright/test');

test.describe('Music MiniMax 应用 - E2E测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    // 等待页面完全加载
    await page.waitForLoadState('networkidle');
  });

  test.afterEach(async ({ page }) => {
    await page.waitForTimeout(500);
  });

  test('页面标题正确', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('AI 歌曲生成器');
  });

  test('页面加载成功 - 验证所有核心元素存在', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('textarea.chat-input')).toBeVisible();
    await expect(page.locator('button.send-btn')).toBeVisible();
  });

  test('输入框可编辑', async ({ page }) => {
    const input = page.locator('textarea.chat-input');
    await expect(input).toBeVisible();
    await input.fill('测试消息');
    const value = await input.inputValue();
    expect(value).toBe('测试消息');
  });

  test('发送按钮初始禁用（无输入）', async ({ page }) => {
    const sendButton = page.locator('button.send-btn');
    await expect(sendButton).toBeDisabled();
  });

  test('输入后发送按钮启用', async ({ page }) => {
    const input = page.locator('textarea.chat-input');
    const sendButton = page.locator('button.send-btn');

    await input.fill('测试消息');
    await expect(sendButton).toBeEnabled();
  });

  test('歌词区域初始不显示', async ({ page }) => {
    // 歌词区域的textarea有不同的class
    await expect(page.locator('textarea.lyrics-input')).not.toBeVisible();
  });

  test('移动端布局正常', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('textarea.chat-input')).toBeVisible();
    await expect(page.locator('button.send-btn')).toBeVisible();
  });

  test('平板端布局正常', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('textarea.chat-input')).toBeVisible();
  });

  test('刷新页面后状态重置', async ({ page }) => {
    const input = page.locator('textarea.chat-input');
    await input.fill('测试消息');
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('textarea.chat-input')).toHaveValue('');
  });

  test('对话流程 - 发送消息', async ({ page }) => {
    test.setTimeout(30000);
    const input = page.locator('textarea.chat-input');
    await input.fill('我想听一首关于大海的歌');

    const sendButton = page.locator('button.send-btn');
    await sendButton.click();

    // 等待消息显示
    await expect(page.locator('.message.user-message')).toBeVisible({ timeout: 10000 });
  });

  test('对话流程 - 发送后AI回复', async ({ page }) => {
    test.setTimeout(30000);
    const input = page.locator('textarea.chat-input');
    await input.fill('测试消息');

    const sendButton = page.locator('button.send-btn');
    await sendButton.click();

    // 等待AI回复出现
    await expect(page.locator('.message.assistant-message')).toBeVisible({ timeout: 15000 });
  });

  test('对话后出现生成歌词按钮', async ({ page }) => {
    test.setTimeout(30000);
    const input = page.locator('textarea.chat-input');
    await input.fill('一首情歌');

    const sendButton = page.locator('button.send-btn');
    await sendButton.click();

    // 等待按钮出现 (conversation.length > 0 && !lyrics && step === "chat")
    await expect(page.locator('button.generate-btn')).toBeVisible({ timeout: 10000 });
  });

  test('点击生成歌词后显示歌词编辑区', async ({ page }) => {
    test.setTimeout(120000);
    const input = page.locator('textarea.chat-input');
    await input.fill('一首情歌');

    const sendButton = page.locator('button.send-btn');
    await sendButton.click();

    // 等待生成歌词按钮
    await expect(page.locator('button.generate-btn')).toBeVisible({ timeout: 15000 });

    // 等待按钮变为可点击（loading状态结束）- 可能需要等待API完成
    await expect(page.locator('button.generate-btn')).toBeEnabled({ timeout: 60000 });

    // 点击生成歌词
    await page.locator('button.generate-btn').click();

    // 等待歌词编辑区出现
    await expect(page.locator('textarea.lyrics-input')).toBeVisible({ timeout: 60000 });
  });

  test('生成歌词后出现生成歌曲按钮', async ({ page }) => {
    test.setTimeout(120000);
    const input = page.locator('textarea.chat-input');
    await input.fill('测试');

    const sendButton = page.locator('button.send-btn');
    await sendButton.click();

    // 等待生成歌词按钮
    await expect(page.locator('button.generate-btn')).toBeVisible({ timeout: 15000 });

    // 等待按钮变为可点击（loading状态结束）
    await expect(page.locator('button.generate-btn')).toBeEnabled({ timeout: 60000 });

    await page.locator('button.generate-btn').click();

    // 等待生成歌曲按钮出现
    await expect(page.locator('button.generate-btn')).toBeVisible({ timeout: 20000 });
  });
});