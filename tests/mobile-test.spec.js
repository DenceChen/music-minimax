const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:3009';
const RESULTS_DIR = path.join(__dirname, '..', 'test-results', 'mobile');

if (!fs.existsSync(RESULTS_DIR)) {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
}

async function runMobileTests() {
  const browser = await chromium.launch({ headless: true });
  const results = { passed: 0, failed: 0, bugs: [] };

  const testCases = [
    {
      name: 'iPhone 模拟器 (375x667)',
      viewport: { width: 375, height: 667 },
      device: 'iPhone',
      path: '/zh/chat'
    },
    {
      name: 'iPad 模拟器 (768x1024)',
      viewport: { width: 768, height: 1024 },
      device: 'iPad',
      path: '/zh/chat'
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`测试: ${testCase.name}`);
    console.log(`视口: ${testCase.viewport.width}x${testCase.viewport.height}`);
    console.log('='.repeat(50));

    const context = await browser.newContext({
      viewport: testCase.viewport,
      deviceScaleFactor: 2,
      isMobile: true,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15'
    });

    const page = await context.newPage();

    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    try {
      console.log(`\n访问: ${BASE_URL}${testCase.path}`);
      await page.goto(`${BASE_URL}${testCase.path}`, { waitUntil: 'networkidle', timeout: 30000 });
      console.log('页面加载成功');

      await page.waitForTimeout(2000);

      const screenshotPath = path.join(RESULTS_DIR, `${testCase.device.toLowerCase()}-${Date.now()}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: false });
      console.log(`截图保存: ${screenshotPath}`);

      // 检查侧边栏
      const sidebar = await page.$('[class*="sidebar"], [class*="side-bar"], aside, nav');
      if (sidebar) {
        const sidebarBox = await sidebar.boundingBox();
        console.log(`侧边栏位置: x=${sidebarBox && sidebarBox.x}, y=${sidebarBox && sidebarBox.y}, width=${sidebarBox && sidebarBox.width}, height=${sidebarBox && sidebarBox.height}`);

        if (sidebarBox && (sidebarBox.x < 0 || sidebarBox.width > testCase.viewport.width)) {
          results.bugs.push({
            type: '布局溢出',
            device: testCase.name,
            description: `侧边栏宽度 ${sidebarBox.width}px 超出移动端视口 ${testCase.viewport.width}px`,
            screenshot: screenshotPath
          });
          results.failed++;
          console.log(`FAIL: 侧边栏溢出! 宽度 ${sidebarBox.width}px > 视口 ${testCase.viewport.width}px`);
        } else {
          results.passed++;
          console.log('PASS: 侧边栏布局正常');
        }
      }

      // 检查输入框位置
      const input = await page.$('input[type="text"], input[placeholder*="想"], textarea');
      if (input) {
        const inputBox = await input.boundingBox();
        console.log(`输入框位置: x=${inputBox && inputBox.x}, y=${inputBox && inputBox.y}`);

        if (inputBox && (inputBox.x < 0 || inputBox.y < 0 || inputBox.x + inputBox.width > testCase.viewport.width)) {
          results.bugs.push({
            type: '输入框位置错乱',
            device: testCase.name,
            description: `输入框位置异常: x=${inputBox.x}, y=${inputBox.y}`,
            screenshot: screenshotPath
          });
          results.failed++;
          console.log('FAIL: 输入框位置异常!');
        } else {
          results.passed++;
          console.log('PASS: 输入框位置正常');
        }
      }

      // 检查发送按钮
      const sendButton = await page.$('button[aria-label*="发送"], button[type="submit"], button:has-text("发送")');
      if (sendButton) {
        const buttonBox = await sendButton.boundingBox();
        console.log(`发送按钮位置: x=${buttonBox && buttonBox.x}, y=${buttonBox && buttonBox.y}`);
        if (buttonBox && buttonBox.x >= 0 && buttonBox.y >= 0) {
          results.passed++;
          console.log('PASS: 发送按钮位置正常');
        }
      }

      // 检查 AI 响应区域
      const aiResponseArea = await page.$('[class*="response"], [class*="message"], [class*="chat"]');
      if (aiResponseArea) {
        const areaBox = await aiResponseArea.boundingBox();
        console.log(`AI 响应区域: y=${areaBox && areaBox.y}`);

        if (areaBox && areaBox.y < -100) {
          results.bugs.push({
            type: 'AI 响应区域负定位',
            device: testCase.name,
            description: `AI 响应区域 y 坐标为负值: ${areaBox.y}`,
            screenshot: screenshotPath
          });
          results.failed++;
          console.log(`FAIL: AI 响应区域 y=${areaBox.y} 为负值!`);
        } else if (areaBox) {
          results.passed++;
          console.log('PASS: AI 响应区域位置正常');
        }
      }

      // 检查快捷按钮
      const quickButtons = await page.$$('[class*="quick"], [class*="prompt"], button[class*="bg-"]');
      console.log(`快捷按钮数量: ${quickButtons.length}`);
      if (quickButtons.length > 0) {
        results.passed++;
        console.log('PASS: 快捷按钮正常显示');
      }

    } catch (error) {
      console.error(`FAIL: 测试失败: ${error.message}`);
      results.failed++;

      const errorScreenshot = path.join(RESULTS_DIR, `${testCase.device.toLowerCase()}-error-${Date.now()}.png`);
      await page.screenshot({ path: errorScreenshot });
      results.bugs.push({
        type: '页面加载错误',
        device: testCase.name,
        description: error.message,
        screenshot: errorScreenshot
      });
    }

    if (consoleErrors.length > 0) {
      console.log('\n控制台错误:');
      consoleErrors.forEach(err => console.log(`  - ${err}`));
    }

    await context.close();
  }

  // 测试语言切换
  console.log(`\n${'='.repeat(50)}`);
  console.log('测试语言切换');
  console.log('='.repeat(50));

  const langContext = await browser.newContext({
    viewport: { width: 375, height: 667 },
    isMobile: true
  });
  const langPage = await langContext.newPage();

  const languages = ['zh', 'en', 'ja'];
  for (const lang of languages) {
    try {
      console.log(`\n测试语言: ${lang}`);
      await langPage.goto(`${BASE_URL}/${lang}/chat`, { waitUntil: 'networkidle', timeout: 15000 });
      await langPage.waitForTimeout(1000);

      const langScreenshot = path.join(RESULTS_DIR, `lang-${lang}-${Date.now()}.png`);
      await langPage.screenshot({ path: langScreenshot });

      // 检查页面是否有翻译错误
      const bodyText = await langPage.textContent('body');
      const hasUntranslatedText = bodyText.includes('chat.');

      if (hasUntranslatedText) {
        results.bugs.push({
          type: '语言切换 - 翻译不完整',
          device: 'iPhone',
          description: `语言 ${lang} 存在未翻译的文本`,
          screenshot: langScreenshot
        });
        results.failed++;
        console.log(`FAIL: 语言 ${lang} 翻译不完整`);
      } else {
        results.passed++;
        console.log(`PASS: 语言 ${lang} 切换正常`);
      }
    } catch (error) {
      console.error(`FAIL: 语言 ${lang} 测试失败: ${error.message}`);
      results.failed++;
    }
  }

  await langContext.close();
  await browser.close();

  console.log(`\n${'='.repeat(50)}`);
  console.log('测试结果汇总');
  console.log('='.repeat(50));
  console.log(`PASS: ${results.passed}`);
  console.log(`FAIL: ${results.failed}`);

  if (results.bugs.length > 0) {
    console.log(`\n发现 ${results.bugs.length} 个 Bug:`);
    results.bugs.forEach((bug, index) => {
      console.log(`\n${index + 1}. [${bug.type}] - ${bug.device}`);
      console.log(`   描述: ${bug.description}`);
      console.log(`   截图: ${bug.screenshot}`);
    });
  }

  return results;
}

runMobileTests()
  .then(results => {
    process.exit(results.failed > 0 ? 1 : 0);
  })
  .catch(error => {
    console.error('测试执行失败:', error);
    process.exit(1);
  });