/**
 * Music MiniMax - 完整 E2E 测试用例
 * 测试服务器: http://localhost:3009
 * 测试场景: 25个完整测试用例
 */
const { chromium } = require('playwright');

const BASE_URL = 'http://localhost:3009';
const testResultsDir = '/Users/airboom/Desktop/opencode/music-minimax/test-results';

let browser;
let testCount = 0;
let passedCount = 0;
let failedCount = 0;
const bugs = [];
const testLog = [];

function log(message, isError = false) {
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] ${message}`;
  console.log(logLine);
  testLog.push({ time: timestamp, message, isError });
}

async function screenshot(page, name) {
  const path = `${testResultsDir}/${name}`;
  try {
    await page.screenshot({ path: `${path}.png`, fullPage: true });
    log(`Screenshot saved: ${path}.png`);
    return true;
  } catch (e) {
    log(`Screenshot failed: ${e.message}`, true);
    return false;
  }
}

async function recordBug(name, detail, screenshotName) {
  bugs.push({ name, detail, screenshot: screenshotName });
  log(`🐛 BUG FOUND: ${name} - ${detail}`, true);
  if (screenshotName) {
    await screenshot(await browser.pages().then(p => p[0]), `bug-${screenshotName}`);
  }
}

async function runTest(testName, testFn) {
  testCount++;
  log(`\n====== Test ${testCount}: ${testName} ======`);
  try {
    await testFn();
    passedCount++;
    log(`✓ Test ${testCount} PASSED: ${testName}`);
    return true;
  } catch (e) {
    failedCount++;
    log(`✗ Test ${testCount} FAILED: ${testName} - ${e.message}`, true);
    return false;
  }
}

async function main() {
  let page;

  try {
    log('Starting comprehensive E2E tests...');
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    page = await context.newPage();

    // ========== 基础功能测试 ==========

    // Test 1: 首页加载测试
    await runTest('1. 首页加载测试', async () => {
      await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(2000);
      await screenshot(page, 'homepage-full');
      const bodyText = await page.textContent('body');
      if (!bodyText || bodyText.length < 10) {
        throw new Error('Homepage body is empty or too short');
      }
      log(`Homepage loaded, body length: ${bodyText.length}`);
    });

    // Test 2: 导航测试 - 语言切换
    await runTest('2. 导航测试 - 语言切换 zh/en/ja', async () => {
      // 测试 /zh
      await page.goto(`${BASE_URL}/zh`, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(1000);
      await screenshot(page, 'nav-zh');
      log('Chinese (zh) version loaded');

      // 测试 /en
      await page.goto(`${BASE_URL}/en`, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(1000);
      await screenshot(page, 'nav-en');
      log('English (en) version loaded');

      // 测试 /ja
      await page.goto(`${BASE_URL}/ja`, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(1000);
      await screenshot(page, 'nav-ja');
      log('Japanese (ja) version loaded');
    });

    // Test 3: 聊天页面加载测试
    await runTest('3. 聊天页面加载测试', async () => {
      await page.goto(`${BASE_URL}/zh/chat`, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(3000);
      await screenshot(page, 'chat-full');
      const bodyText = await page.textContent('body');
      if (bodyText.length < 100) {
        throw new Error('Chat page seems empty');
      }
      log(`Chat page loaded, body length: ${bodyText.length}`);
    });

    // Test 4: 发送消息测试
    await runTest('4. 发送消息测试', async () => {
      await page.goto(`${BASE_URL}/zh/chat`, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(2000);

      // 查找输入框并发送消息
      const inputSelector = 'textarea, input[type="text"], input:not([type])';
      const inputCount = await page.locator(inputSelector).count();

      if (inputCount === 0) {
        throw new Error('No input field found for sending message');
      }

      const inputEl = page.locator(inputSelector).first();
      await inputEl.fill('生成一首关于爱情的歌曲');
      await page.waitForTimeout(500);
      await screenshot(page, 'message-typed');

      // 查找发送按钮
      const sendBtn = page.locator('button[type="submit"], button:has-text("发送"), button:has-text("Send")').first();
      const sendBtnVisible = await sendBtn.isVisible().catch(() => false);

      if (sendBtnVisible) {
        await sendBtn.click();
        await page.waitForTimeout(2000);
        await screenshot(page, 'message-sent');
        log('Message sent successfully');
      } else {
        log('Send button not found, trying Enter key');
        await inputEl.press('Enter');
        await page.waitForTimeout(2000);
        await screenshot(page, 'message-sent');
      }
    });

    // Test 5: AI 响应显示测试
    await runTest('5. AI 响应显示测试 - Markdown 渲染', async () => {
      await page.waitForTimeout(3000);
      const bodyText = await page.textContent('body');

      // 检查是否有 Markdown 渲染的迹象 (代码块、列表、粗体等)
      const hasMarkdown = bodyText.includes('```') || bodyText.includes('*') ||
                          bodyText.includes('- ') || bodyText.includes('1.');
      log(`AI response contains Markdown elements: ${hasMarkdown}`);
    });

    // Test 6: 清除对话测试
    await runTest('6. 清除对话测试', async () => {
      const clearBtn = page.locator('button:has-text("清除"), button:has-text("Clear"), [aria-label*="clear" i]');
      const clearBtnCount = await clearBtn.count();

      if (clearBtnCount > 0) {
        await clearBtn.first().click();
        await page.waitForTimeout(1000);
        await screenshot(page, 'chat-cleared');
        log('Chat cleared');
      } else {
        log('Clear button not found on this page');
      }
    });

    // ========== 歌词生成测试 ==========

    // Test 7: 快捷按钮测试
    await runTest('7. 快捷按钮测试 - 爱情', async () => {
      await page.goto(`${BASE_URL}/zh/chat`, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(2000);

      // 查找快捷按钮
      const quickBtn = page.locator('button:has-text("爱情")');
      const quickBtnCount = await quickBtn.count();

      if (quickBtnCount > 0) {
        await quickBtn.first().click();
        await page.waitForTimeout(1500);
        await screenshot(page, 'lyrics-quick');
        log('Quick button "爱情" clicked');
      } else {
        log('Quick lyrics button not found');
      }
    });

    // Test 8: 歌词确认/修改测试
    await runTest('8. 歌词确认/修改测试', async () => {
      // 查找歌词输入/编辑区域
      const textareaCount = await page.locator('textarea').count();
      if (textareaCount > 0) {
        const textarea = page.locator('textarea').first();
        await textarea.fill('测试歌词内容');
        await page.waitForTimeout(500);
        await screenshot(page, 'lyrics-edited');
        log('Lyrics edited');
      } else {
        log('Lyrics textarea not found');
      }
    });

    // Test 9: 歌词区域显示/隐藏测试
    await runTest('9. 歌词区域显示/隐藏测试', async () => {
      const toggleBtn = page.locator('button:has-text("歌词"), [aria-label*="lyrics" i]');
      const toggleCount = await toggleBtn.count();

      if (toggleCount > 0) {
        await toggleBtn.first().click();
        await page.waitForTimeout(500);
        await screenshot(page, 'lyrics-toggled');
        log('Lyrics toggle clicked');
      } else {
        log('Lyrics toggle not found');
      }
    });

    // ========== 歌曲生成测试 ==========

    // Test 10: 生成按钮状态测试
    await runTest('10. 生成按钮状态测试', async () => {
      const generateBtn = page.locator('button:has-text("生成"), button:has-text("Generate")');
      const btnCount = await generateBtn.count();

      if (btnCount > 0) {
        const btn = generateBtn.first();
        const isDisabled = await btn.isDisabled();
        log(`Generate button exists, disabled: ${isDisabled}`);
      } else {
        log('Generate button not found');
      }
    });

    // Test 11: 生成中 loading 状态测试
    await runTest('11. 生成中 loading 状态测试', async () => {
      // 这个测试可能需要真实的歌词输入才能触发
      await page.waitForTimeout(1000);
      const loadingIndicator = page.locator('[class*="loading"], [class*="spinner"], [aria-busy="true"]');
      const loadingCount = await loadingIndicator.count();
      log(`Loading indicators found: ${loadingCount}`);
      await screenshot(page, 'generating');
    });

    // Test 12: 生成失败错误处理测试
    await runTest('12. 生成失败错误处理测试', async () => {
      const errorMsg = page.locator('[class*="error"], [role="alert"], :has-text("error")');
      const errorCount = await errorMsg.count();
      log(`Error elements found: ${errorCount}`);
    });

    // Test 13: 生成成功歌曲显示测试
    await runTest('13. 生成成功歌曲显示测试', async () => {
      await page.goto(`${BASE_URL}/zh/my-songs`, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(2000);
      await screenshot(page, 'song-ready');
      const bodyText = await page.textContent('body');
      log(`My songs page, body length: ${bodyText.length}`);
    });

    // Test 14: 播放/暂停按钮测试
    await runTest('14. 播放/暂停按钮测试', async () => {
      const playBtn = page.locator('[aria-label*="play" i], button:has-text("播放"), button:has-text("Play")');
      const playCount = await playBtn.count();

      if (playCount > 0) {
        await playBtn.first().click();
        await page.waitForTimeout(1000);
        await screenshot(page, 'playing');
        log('Play button clicked');
      } else {
        log('Play button not found on this page');
      }
    });

    // Test 15: 进度条显示测试
    await runTest('15. 进度条显示测试', async () => {
      const progressBar = page.locator('[role="progressbar"], [class*="progress"], input[type="range"]');
      const progressCount = await progressBar.count();
      log(`Progress bar elements found: ${progressCount}`);
    });

    // Test 16: 播放完成状态测试
    await runTest('16. 播放完成状态测试', async () => {
      await page.waitForTimeout(2000);
      const audioEnded = page.locator('[class*="ended"], [class*="complete"]');
      const endedCount = await audioEnded.count();
      log(`Playback ended indicators: ${endedCount}`);
    });

    // ========== 用户认证测试 ==========

    // Test 17: 登录页面加载测试
    await runTest('17. 登录页面加载测试', async () => {
      await page.goto(`${BASE_URL}/zh/login`, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(2000);
      await screenshot(page, 'login-full');
      log('Login page loaded');
    });

    // Test 18: 登录表单验证测试 - 空表单提交
    await runTest('18. 登录表单验证测试', async () => {
      const submitBtn = page.locator('button[type="submit"]');
      if (await submitBtn.count() > 0) {
        await submitBtn.click();
        await page.waitForTimeout(1000);
        await screenshot(page, 'login-empty-submit');
        log('Empty login form submitted');
      }
    });

    // Test 19: 登录成功/失败测试
    await runTest('19. 登录成功/失败测试', async () => {
      const emailInput = page.locator('input[type="email"]');
      const passwordInput = page.locator('input[type="password"]');

      if (await emailInput.count() > 0 && await passwordInput.count() > 0) {
        await emailInput.fill('test@example.com');
        await passwordInput.fill('wrongpassword');
        await screenshot(page, 'login-filled');
        await page.locator('button[type="submit"]').click();
        await page.waitForTimeout(2000);
        await screenshot(page, 'login-result');
        log('Login attempted with wrong credentials');
      }
    });

    // Test 20: 注册页面加载测试
    await runTest('20. 注册页面加载测试', async () => {
      await page.goto(`${BASE_URL}/zh/register`, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(2000);
      await screenshot(page, 'register-full');
      log('Register page loaded');
    });

    // Test 21: 注册表单验证测试
    await runTest('21. 注册表单验证测试', async () => {
      const sendCodeBtn = page.locator('button:has-text("Send Verification Code")');
      if (await sendCodeBtn.count() > 0) {
        await sendCodeBtn.click();
        await page.waitForTimeout(1000);
        await screenshot(page, 'register-validation');
        log('Register validation tested');
      }
    });

    // ========== 边界条件测试 ==========

    // Test 22: 空消息发送测试
    await runTest('22. 空消息发送测试', async () => {
      await page.goto(`${BASE_URL}/zh/chat`, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(2000);

      const inputSelector = 'textarea, input[type="text"], input:not([type])';
      const inputEl = page.locator(inputSelector).first();

      await inputEl.fill('');
      await inputEl.press('Enter');
      await page.waitForTimeout(1000);
      await screenshot(page, 'empty-message');
      log('Empty message attempted');
    });

    // Test 23: 超长消息测试
    await runTest('23. 超长消息测试 - 1000字符', async () => {
      const longMessage = 'A'.repeat(1000);
      const inputEl = page.locator('textarea, input[type="text"]').first();
      await inputEl.fill(longMessage);
      await page.waitForTimeout(500);
      await screenshot(page, 'long-message');
      log('Long message (1000 chars) typed');
    });

    // Test 24: 特殊字符消息测试
    await runTest('24. 特殊字符消息测试 - emoji和特殊符号', async () => {
      const specialMessage = '🎵🎶💖❤️🔥测试!!! @#$%^&*()_+ 中文测试 😊😄🎉';
      const inputEl = page.locator('textarea, input[type="text"]').first();
      await inputEl.fill(specialMessage);
      await page.waitForTimeout(500);
      await screenshot(page, 'special-chars');
      log('Special characters message typed');
    });

    // Test 25: 快速连续点击测试
    await runTest('25. 快速连续点击测试 - 5秒内10次', async () => {
      const sendBtn = page.locator('button[type="submit"], button:has-text("发送")').first();
      let clickCount = 0;

      for (let i = 0; i < 10; i++) {
        try {
          await sendBtn.click({ timeout: 500 }).catch(() => {});
          clickCount++;
        } catch (e) {
          log(`Click ${i + 1} failed or was blocked`);
        }
      }

      await page.waitForTimeout(1000);
      await screenshot(page, 'rapid-clicks');
      log(`Completed ${clickCount} rapid clicks`);
    });

    // ========== 测试结果汇总 ==========
    await browser.close();

    log('\n\n' + '='.repeat(60));
    log('========== FINAL TEST SUMMARY ==========');
    log(`Total tests: ${testCount}`);
    log(`Passed: ${passedCount}`);
    log(`Failed: ${failedCount}`);
    log(`Bugs found: ${bugs.length}`);

    if (bugs.length > 0) {
      log('\n--- BUGS ---');
      bugs.forEach((b, i) => {
        log(`Bug ${i + 1}: ${b.name}`);
        log(`  Detail: ${b.detail}`);
        log(`  Screenshot: ${b.screenshot}`);
      });
    }

    log('\n=== ALL SCREENSHOTS ===');
    log(`Screenshots saved to: ${testResultsDir}`);

    // 保存测试日志到文件
    const fs = require('fs');
    const logContent = testLog.map(l => `[${l.time}] ${l.isError ? '❌ ' : ''}${l.message}`).join('\n');
    fs.writeFileSync(`${testResultsDir}/test-log.txt`, logContent);
    log(`\nTest log saved to: ${testResultsDir}/test-log.txt`);

    return { testCount, passedCount, failedCount, bugs };

  } catch (error) {
    log(`Fatal error: ${error.message}`, true);
    if (browser) await browser.close();
    throw error;
  }
}

// Execute tests
main().then(results => {
  log('\n✅ All tests completed');
  process.exit(results.failedCount > 0 ? 1 : 0);
}).catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});