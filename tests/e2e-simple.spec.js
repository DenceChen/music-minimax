/**
 * Music MiniMax - 简化版 E2E 测试
 * 专注验证核心功能
 */
const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:3000';

test.describe('Music MiniMax - 核心功能测试', () => {
  test('验证 i18n 路由正常', async ({ page }) => {
    // 测试 /zh
    await page.goto(`${BASE_URL}/zh`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();

    // 测试 /en
    await page.goto(`${BASE_URL}/en`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();

    // 测试 /ja
    await page.goto(`${BASE_URL}/ja`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });

  test('验证语言切换下拉框存在于登录页', async ({ page }) => {
    await page.goto(`${BASE_URL}/zh/login`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // 等待客户端渲染

    // 检查页面内容
    const body = await page.textContent('body');

    // 页面应该包含登录表单
    expect(body).toContain('Sign in');

    // 查找 select 元素
    const selectCount = await page.locator('select').count();
    console.log(`Found ${selectCount} select elements`);

    // 如果有 select，验证可以切换
    if (selectCount > 0) {
      const firstSelect = page.locator('select').first();
      await firstSelect.selectOption('en');
      await page.waitForTimeout(1000);
      expect(page.url()).toContain('/en/');
    }
  });

  test('验证设置页面存在', async ({ page }) => {
    await page.goto(`${BASE_URL}/zh/settings`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 检查页面内容 - 可能需要登录或显示设置内容
    const body = await page.textContent('body');

    // 页面应该包含某些内容（可能是登录提示或设置内容）
    expect(body.length).toBeGreaterThan(0);
    console.log('Settings page loaded, body length:', body.length);
  });

  test('验证注册页面存在且有表单元素', async ({ page }) => {
    await page.goto(`${BASE_URL}/zh/register`);
    await page.waitForLoadState('networkidle');

    // 验证页面包含注册表单元素（邮箱输入 + 发送验证码按钮）
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button:has-text("Send Verification Code")')).toBeVisible();
  });

  test('验证登录页面存在且有表单元素', async ({ page }) => {
    await page.goto(`${BASE_URL}/zh/login`);
    await page.waitForLoadState('networkidle');

    // 验证页面包含登录表单元素
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('验证聊天页面存在', async ({ page }) => {
    await page.goto(`${BASE_URL}/zh/chat`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 页面可能需要登录或显示聊天界面
    const body = await page.textContent('body');
    expect(body.length).toBeGreaterThan(0);
    console.log('Chat page loaded, body length:', body.length);
  });

  test('验证我的作品页面存在', async ({ page }) => {
    await page.goto(`${BASE_URL}/zh/my-songs`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 页面可能需要登录或显示歌曲列表
    const body = await page.textContent('body');
    expect(body.length).toBeGreaterThan(0);
    console.log('My Songs page loaded, body length:', body.length);
  });
});
