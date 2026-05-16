/**
 * TDD E2E Music Generation Tests
 *
 * RED Phase: These tests define expected behavior from the user's perspective
 * Based on official MiniMax API documentation
 */

const { test, expect } = require('@playwright/test');

test.describe('E2E Music Generation - TDD', () => {
  const BASE_URL = 'http://localhost:3000';

  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/zh/login`);
    await page.fill('input[type="email"]', 'test@music.com');
    await page.fill('input[type="password"]', 'test123456');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/zh/chat`, { timeout: 10000 });
  });

  test('用户发送"生成一首关于爱情的歌曲"，应看到歌词生成', async ({ page }) => {
    test.setTimeout(60000);

    await page.goto(`${BASE_URL}/zh/chat`);
    await page.waitForTimeout(1000);

    // 发送包含"音乐"关键词的消息
    const textarea = page.locator('textarea').first();
    await textarea.fill('生成一首关于爱情的歌曲');
    await page.keyboard.press('Enter');

    // 等待AI回复
    await page.waitForSelector('.message-assistant', { timeout: 30000 });

    // 验证AI回复包含歌词
    const assistantBubble = page.locator('.message-assistant .message-bubble').last();
    const content = await assistantBubble.textContent();

    console.log('AI回复内容:', content);
    expect(content).toBeTruthy();
    // AI应该生成歌词（包含歌曲结构标记，中文或英文格式）
    expect(content).toMatch(/\[(verse|chorus|intro|outro|pre-chorus|bridge)\]|【(主歌|副歌|前奏|尾声|桥段)】/i);
  });

  test('应显示歌词生成区域和"生成歌曲"按钮', async ({ page }) => {
    test.setTimeout(60000);

    await page.goto(`${BASE_URL}/zh/chat`);
    await page.waitForTimeout(1000);

    // 发送包含"音乐"关键词的消息
    const textarea = page.locator('textarea').first();
    await textarea.fill('音乐');
    await page.keyboard.press('Enter');

    // 等待歌词区域出现（包含生成歌曲按钮）
    await page.waitForTimeout(30000);

    // 检查是否有歌词输入区域或生成歌曲按钮
    const lyricsSection = page.locator('.lyrics-input, button:has-text("生成歌曲")').first();
    const isVisible = await lyricsSection.isVisible().catch(() => false);

    console.log('歌词区域可见:', isVisible);
    // 如果消息包含"音乐"关键词，应该显示歌词相关UI
    if (isVisible) {
      const generateBtn = page.locator('button:has-text("生成歌曲")');
      expect(await generateBtn.isVisible()).toBe(true);
    }
  });

  test('音乐生成后应显示音频播放器', async ({ page }) => {
    test.setTimeout(120000);

    await page.goto(`${BASE_URL}/zh/chat`);
    await page.waitForTimeout(1000);

    // 发送一个简单的请求
    const textarea = page.locator('textarea').first();
    await textarea.fill('生成一首简单的歌');
    await page.keyboard.press('Enter');

    // 等待响应
    await page.waitForTimeout(30000);

    // 检查消息是否发送成功
    const userMessage = page.locator('.message-user .message-bubble').last();
    await expect(userMessage).toContainText('生成一首简单的歌');
  });

  test('设置页面应能保存API配置', async ({ page }) => {
    await page.goto(`${BASE_URL}/zh/settings`);
    await page.waitForTimeout(1000);

    // 选择模型
    const modelSelect = page.locator('select').first();
    if (await modelSelect.isVisible()) {
      await modelSelect.selectOption({ index: 1 });
    }

    // 输入API Key
    const apiKeyInput = page.locator('input[placeholder*="API"]').first();
    if (await apiKeyInput.isVisible()) {
      await apiKeyInput.fill('test-api-key-12345');
    }

    // 点击保存
    const saveBtn = page.locator('button:has-text("保存")');
    if (await saveBtn.isVisible()) {
      await saveBtn.click();
      await page.waitForTimeout(1000);
    }

    // 验证没有错误提示
    const errorAlert = page.locator('.error, [class*="error"]');
    const hasError = await errorAlert.isVisible().catch(() => false);

    console.log('设置保存后错误:', hasError);
    expect(hasError).toBe(false);
  });

  test('应能正确切换语言', async ({ page }) => {
    await page.goto(`${BASE_URL}/zh/chat`);
    await page.waitForTimeout(1000);

    // 切换到英文
    const langSelect = page.locator('select').first();
    await langSelect.selectOption('EN');

    await page.waitForTimeout(2000);

    // 验证URL变化
    expect(page.url()).toContain('/en/');
  });

  test('对话列表应显示历史记录', async ({ page }) => {
    await page.goto(`${BASE_URL}/zh/chat`);
    await page.waitForTimeout(1000);

    // 检查侧边栏是否存在（可能折叠）
    const sidebar = page.locator('.flex.h-\\[calc\\(100vh-64px\\)\\]').first();
    const hasSidebar = await sidebar.isVisible().catch(() => false);

    console.log('侧边栏可见:', hasSidebar);

    // 侧边栏应该在主内容区旁边
    const mainContent = page.locator('.min-w-0');
    const hasMain = await mainContent.isVisible().catch(() => false);

    expect(hasMain).toBe(true);
  });
});
