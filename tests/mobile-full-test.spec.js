const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:3009';
const RESULTS_DIR = path.join(__dirname, '..', 'test-results', 'mobile');

if (!fs.existsSync(RESULTS_DIR)) {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
}

async function runFullMobileTests() {
  const browser = await chromium.launch({ headless: true });
  const results = [];

  console.log('========================================');
  console.log('移动端完整测试用例执行');
  console.log('========================================\n');

  // ========================================
  // iPhone 测试 (375x667)
  // ========================================
  console.log('【iPhone 测试 (375x667)】');

  const iphoneContext = await browser.newContext({
    viewport: { width: 375, height: 667 },
    deviceScaleFactor: 2,
    isMobile: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15'
  });
  const iphonePage = await iphoneContext.newPage();

  // Test 1: 首页加载截图
  console.log('\n[Test 1] 首页加载截图');
  try {
    await iphonePage.goto(BASE_URL + '/zh', { waitUntil: 'networkidle', timeout: 30000 });
    await iphonePage.waitForTimeout(1500);
    const homepagePath = path.join(RESULTS_DIR, 'iphone-homepage.png');
    await iphonePage.screenshot({ path: homepagePath });
    console.log('PASS: iphone-homepage.png 已保存');
    results.push({ test: 1, name: '首页加载截图', status: 'PASS' });
  } catch (e) {
    console.log('FAIL: ' + e.message);
    results.push({ test: 1, name: '首页加载截图', status: 'FAIL', error: e.message });
  }

  // Test 2: 侧边栏溢出检查
  console.log('\n[Test 2] 侧边栏溢出检查');
  try {
    const bodyWidth = await iphonePage.evaluate(function() { return document.body.scrollWidth; });
    const viewportWidth = 375;
    const hasOverflow = bodyWidth > viewportWidth;
    console.log('  页面内容宽度: ' + bodyWidth + 'px, 视口宽度: ' + viewportWidth + 'px');
    console.log('  横向滚动: ' + (hasOverflow ? '是 (有问题)' : '否 (正常)'));
    if (hasOverflow) {
      const overflowPath = path.join(RESULTS_DIR, 'iphone-sidebar-overflow.png');
      await iphonePage.screenshot({ path: overflowPath });
      console.log('FAIL: 发现侧边栏溢出，截图已保存');
      results.push({ test: 2, name: '侧边栏溢出检查', status: 'FAIL', bug: 'Bug #2 - 移动端布局错乱' });
    } else {
      console.log('PASS: 无溢出问题');
      results.push({ test: 2, name: '侧边栏溢出检查', status: 'PASS' });
    }
  } catch (e) {
    console.log('FAIL: ' + e.message);
    results.push({ test: 2, name: '侧边栏溢出检查', status: 'FAIL', error: e.message });
  }

  // Test 3: 聊天消息气泡
  console.log('\n[Test 3] 聊天消息气泡 - 前往聊天页');
  try {
    await iphonePage.goto(BASE_URL + '/zh/chat', { waitUntil: 'networkidle', timeout: 30000 });
    await iphonePage.waitForTimeout(2000);

    const messages = await iphonePage.$$('[class*="message"], [class*="bubble"], [class*="chat"]');
    console.log('  找到消息元素数量: ' + messages.length);

    const hasMessageOverflow = await iphonePage.evaluate(function() {
      var msgs = document.querySelectorAll('[class*="message"], [class*="bubble"]');
      for (var i = 0; i < msgs.length; i++) {
        var rect = msgs[i].getBoundingClientRect();
        if (rect.right > window.innerWidth) return true;
      }
      return false;
    });

    if (hasMessageOverflow) {
      var bubblePath = path.join(RESULTS_DIR, 'iphone-message-overflow.png');
      await iphonePage.screenshot({ path: bubblePath });
      console.log('FAIL: 消息气泡溢出');
      results.push({ test: 3, name: '聊天消息气泡', status: 'FAIL' });
    } else {
      console.log('PASS: 消息气泡换行正常');
      results.push({ test: 3, name: '聊天消息气泡', status: 'PASS' });
    }
  } catch (e) {
    console.log('FAIL: ' + e.message);
    results.push({ test: 3, name: '聊天消息气泡', status: 'FAIL', error: e.message });
  }

  // Test 4: 输入框位置
  console.log('\n[Test 4] 输入框位置 - 是否在可视范围内');
  try {
    var input = await iphonePage.$('input[type="text"], input[placeholder*="想"], textarea');
    if (input) {
      var inputBox = await input.boundingBox();
      console.log('  输入框位置: x=' + inputBox.x + ', y=' + inputBox.y + ', width=' + inputBox.width);
      var isVisible = inputBox.y >= 0 && inputBox.y < 667 && inputBox.x >= 0;
      if (isVisible) {
        console.log('PASS: 输入框在可视范围内');
        results.push({ test: 4, name: '输入框位置', status: 'PASS' });
      } else {
        console.log('FAIL: 输入框位置异常');
        results.push({ test: 4, name: '输入框位置', status: 'FAIL' });
      }
    } else {
      console.log('WARN: 未找到输入框');
      results.push({ test: 4, name: '输入框位置', status: 'WARN' });
    }
  } catch (e) {
    console.log('FAIL: ' + e.message);
    results.push({ test: 4, name: '输入框位置', status: 'FAIL', error: e.message });
  }

  // Test 5: 快捷按钮
  console.log('\n[Test 5] 快捷按钮 - 是否全部显示');
  try {
    var quickButtons = await iphonePage.$$('[class*="quick"], [class*="prompt"], [class*="suggestion"]');
    console.log('  找到快捷按钮数量: ' + quickButtons.length);

    var allVisible = await iphonePage.evaluate(function() {
      var btns = document.querySelectorAll('[class*="quick"], [class*="prompt"], [class*="suggestion"]');
      for (var i = 0; i < btns.length; i++) {
        var rect = btns[i].getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return false;
        if (rect.right > window.innerWidth || rect.bottom > window.innerHeight) return false;
      }
      return true;
    });

    if (quickButtons.length > 0 && allVisible) {
      console.log('PASS: 快捷按钮正常显示');
      results.push({ test: 5, name: '快捷按钮', status: 'PASS' });
    } else if (quickButtons.length === 0) {
      console.log('WARN: 页面未显示快捷按钮');
      results.push({ test: 5, name: '快捷按钮', status: 'WARN' });
    } else {
      console.log('FAIL: 部分快捷按钮不可见');
      results.push({ test: 5, name: '快捷按钮', status: 'FAIL' });
    }
  } catch (e) {
    console.log('FAIL: ' + e.message);
    results.push({ test: 5, name: '快捷按钮', status: 'FAIL', error: e.message });
  }

  await iphoneContext.close();

  // ========================================
  // iPad 测试 (768x1024)
  // ========================================
  console.log('\n\n【iPad 测试 (768x1024)】');

  var ipadContext = await browser.newContext({
    viewport: { width: 768, height: 1024 },
    deviceScaleFactor: 2,
    isMobile: false,
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15'
  });
  var ipadPage = await ipadContext.newPage();

  // Test 6: 首页加载截图
  console.log('\n[Test 6] 首页加载截图');
  try {
    await ipadPage.goto(BASE_URL + '/zh', { waitUntil: 'networkidle', timeout: 30000 });
    await ipadPage.waitForTimeout(1500);
    var homepagePath = path.join(RESULTS_DIR, 'ipad-homepage.png');
    await ipadPage.screenshot({ path: homepagePath });
    console.log('PASS: ipad-homepage.png 已保存');
    results.push({ test: 6, name: '首页加载截图', status: 'PASS' });
  } catch (e) {
    console.log('FAIL: ' + e.message);
    results.push({ test: 6, name: '首页加载截图', status: 'FAIL', error: e.message });
  }

  // Test 7: 侧边栏显示检查
  console.log('\n[Test 7] 侧边栏显示检查');
  try {
    var sidebar = await ipadPage.$('[class*="sidebar"], aside, nav, [class*="side"]');
    if (sidebar) {
      var sidebarBox = await sidebar.boundingBox();
      console.log('  侧边栏: x=' + sidebarBox.x + ', y=' + sidebarBox.y + ', width=' + sidebarBox.width + ', height=' + sidebarBox.height);
      if (sidebarBox && sidebarBox.width <= 768) {
        console.log('PASS: 侧边栏显示正常');
        results.push({ test: 7, name: '侧边栏显示检查', status: 'PASS' });
      } else {
        console.log('FAIL: 侧边栏超出视口');
        results.push({ test: 7, name: '侧边栏显示检查', status: 'FAIL' });
      }
    } else {
      console.log('WARN: 未找到侧边栏');
      results.push({ test: 7, name: '侧边栏显示检查', status: 'WARN' });
    }
  } catch (e) {
    console.log('FAIL: ' + e.message);
    results.push({ test: 7, name: '侧边栏显示检查', status: 'FAIL', error: e.message });
  }

  // Test 8: 输入框按钮位置
  console.log('\n[Test 8] 输入框按钮位置 - 是否分离 (Bug #3 回归)');
  try {
    await ipadPage.goto(BASE_URL + '/zh/chat', { waitUntil: 'networkidle', timeout: 30000 });
    await ipadPage.waitForTimeout(2000);

    var inp = await ipadPage.$('input[type="text"], input[placeholder*="想"], textarea');
    var btn = await ipadPage.$('button[aria-label*="发送"], button[type="submit"]');

    if (inp && btn) {
      var inputBox = await inp.boundingBox();
      var buttonBox = await btn.boundingBox();

      console.log('  输入框: x=' + inputBox.x + ', y=' + inputBox.y);
      console.log('  按钮: x=' + buttonBox.x + ', y=' + buttonBox.y);

      var isClose = Math.abs(inputBox.x - buttonBox.x) < 300 && Math.abs(inputBox.y - buttonBox.y) < 100;
      if (isClose) {
        console.log('PASS: 输入框和按钮位置正常');
        results.push({ test: 8, name: '输入框按钮位置', status: 'PASS' });
      } else {
        console.log('FAIL: 输入框和按钮位置分离太远');
        var sepPath = path.join(RESULTS_DIR, 'ipad-input-button-separation.png');
        await ipadPage.screenshot({ path: sepPath });
        results.push({ test: 8, name: '输入框按钮位置', status: 'FAIL', bug: 'Bug #3 - iPad 输入框/按钮位置错乱' });
      }
    } else {
      console.log('WARN: 未找到输入框或按钮');
      results.push({ test: 8, name: '输入框按钮位置', status: 'WARN' });
    }
  } catch (e) {
    console.log('FAIL: ' + e.message);
    results.push({ test: 8, name: '输入框按钮位置', status: 'FAIL', error: e.message });
  }

  // Test 9: AI 响应区域 - 负定位检查
  console.log('\n[Test 9] AI 响应区域 - y 坐标检查 (Bug #4 回归)');
  try {
    var aiArea = await ipadPage.$('[class*="response"], [class*="message"], [class*="chat"], main');
    if (aiArea) {
      var areaBox = await aiArea.boundingBox();
      console.log('  AI 响应区域: x=' + areaBox.x + ', y=' + areaBox.y + ', width=' + areaBox.width + ', height=' + areaBox.height);

      if (areaBox.y < -100) {
        console.log('FAIL: AI 响应区域 y=' + areaBox.y + ' 为负值 (Bug #4)');
        var negPath = path.join(RESULTS_DIR, 'ipad-ai-negative-position.png');
        await ipadPage.screenshot({ path: negPath });
        results.push({ test: 9, name: 'AI 响应区域', status: 'FAIL', bug: 'Bug #4 - AI 响应内容 y=-1284 定位错误' });
      } else {
        console.log('PASS: AI 响应区域 y 坐标正常');
        results.push({ test: 9, name: 'AI 响应区域', status: 'PASS' });
      }
    } else {
      console.log('WARN: 未找到 AI 响应区域');
      results.push({ test: 9, name: 'AI 响应区域', status: 'WARN' });
    }
  } catch (e) {
    console.log('FAIL: ' + e.message);
    results.push({ test: 9, name: 'AI 响应区域', status: 'FAIL', error: e.message });
  }

  await ipadContext.close();

  // ========================================
  // 语言切换测试
  // ========================================
  console.log('\n\n【语言切换测试】');

  var langContext = await browser.newContext({
    viewport: { width: 375, height: 667 },
    isMobile: true
  });
  var langPage = await langContext.newPage();

  // Test 10: 中文界面
  console.log('\n[Test 10] 中文界面截图');
  try {
    await langPage.goto(BASE_URL + '/zh/chat', { waitUntil: 'networkidle', timeout: 15000 });
    await langPage.waitForTimeout(1500);
    var zhPath = path.join(RESULTS_DIR, 'mobile-zh.png');
    await langPage.screenshot({ path: zhPath });

    var bodyText = await langPage.textContent('body');
    var hasUntranslated = bodyText.includes('chat.') || bodyText.includes('{');
    console.log('  截图保存: mobile-zh.png');
    console.log('  未翻译文本: ' + (hasUntranslated ? '是 (有问题)' : '否 (正常)'));
    results.push({ test: 10, name: '中文界面截图', status: hasUntranslated ? 'FAIL' : 'PASS' });
  } catch (e) {
    console.log('FAIL: ' + e.message);
    results.push({ test: 10, name: '中文界面截图', status: 'FAIL', error: e.message });
  }

  // Test 11: 英文界面
  console.log('\n[Test 11] 英文界面截图');
  try {
    await langPage.goto(BASE_URL + '/en/chat', { waitUntil: 'networkidle', timeout: 15000 });
    await langPage.waitForTimeout(1500);
    var enPath = path.join(RESULTS_DIR, 'mobile-en.png');
    await langPage.screenshot({ path: enPath });

    bodyText = await langPage.textContent('body');
    hasUntranslated = bodyText.includes('chat.') || bodyText.includes('{');
    console.log('  截图保存: mobile-en.png');
    console.log('  未翻译文本: ' + (hasUntranslated ? '是 (有问题)' : '否 (正常)'));
    results.push({ test: 11, name: '英文界面截图', status: hasUntranslated ? 'FAIL' : 'PASS' });
  } catch (e) {
    console.log('FAIL: ' + e.message);
    results.push({ test: 11, name: '英文界面截图', status: 'FAIL', error: e.message });
  }

  // Test 12: 日文界面
  console.log('\n[Test 12] 日文界面截图');
  try {
    await langPage.goto(BASE_URL + '/ja/chat', { waitUntil: 'networkidle', timeout: 15000 });
    await langPage.waitForTimeout(1500);
    var jaPath = path.join(RESULTS_DIR, 'mobile-ja.png');
    await langPage.screenshot({ path: jaPath });

    bodyText = await langPage.textContent('body');
    hasUntranslated = bodyText.includes('chat.') || bodyText.includes('{');
    console.log('  截图保存: mobile-ja.png');
    console.log('  未翻译文本: ' + (hasUntranslated ? '是 (有问题)' : '否 (正常)'));
    results.push({ test: 12, name: '日文界面截图', status: hasUntranslated ? 'FAIL' : 'PASS' });
  } catch (e) {
    console.log('FAIL: ' + e.message);
    results.push({ test: 12, name: '日文界面截图', status: 'FAIL', error: e.message });
  }

  // Test 13: 语言切换后内容更新
  console.log('\n[Test 13] 语言切换后内容是否正确更新');
  try {
    await langPage.goto(BASE_URL + '/zh/chat', { waitUntil: 'networkidle', timeout: 15000 });
    await langPage.waitForTimeout(1000);
    var zhText1 = await langPage.textContent('body');

    await langPage.goto(BASE_URL + '/en/chat', { waitUntil: 'networkidle', timeout: 15000 });
    await langPage.waitForTimeout(1000);
    var enText = await langPage.textContent('body');

    await langPage.goto(BASE_URL + '/ja/chat', { waitUntil: 'networkidle', timeout: 15000 });
    await langPage.waitForTimeout(1000);
    var jaText = await langPage.textContent('body');

    var enHasEnglish = enText.includes('Generate') || enText.includes('Chat') || enText.includes('Send');
    var jaHasJapanese = jaText.includes('生成') || jaText.includes('チャット') || jaText.includes('送信');

    console.log('  英文界面包含英文: ' + (enHasEnglish ? '是' : '否'));
    console.log('  日文界面包含日文: ' + (jaHasJapanese ? '是' : '否'));

    if (enHasEnglish && jaHasJapanese) {
      console.log('PASS: 语言切换内容正确');
      results.push({ test: 13, name: '语言切换内容更新', status: 'PASS' });
    } else {
      console.log('FAIL: 语言切换内容不正确');
      results.push({ test: 13, name: '语言切换内容更新', status: 'FAIL' });
    }
  } catch (e) {
    console.log('FAIL: ' + e.message);
    results.push({ test: 13, name: '语言切换内容更新', status: 'FAIL', error: e.message });
  }

  await langContext.close();

  // ========================================
  // 已修复 Bug 回归测试
  // ========================================
  console.log('\n\n【已修复 Bug 回归测试】');

  // Test 14: Bug #2 - 移动端布局
  console.log('\n[Test 14] Bug #2 回归 - 移动端布局不再错乱');
  var bug2Context = await browser.newContext({ viewport: { width: 375, height: 667 }, isMobile: true });
  var bug2Page = await bug2Context.newPage();
  try {
    await bug2Page.goto(BASE_URL + '/zh/chat', { waitUntil: 'networkidle', timeout: 30000 });
    await bug2Page.waitForTimeout(2000);

    bodyWidth = await bug2Page.evaluate(function() { return document.body.scrollWidth; });
    var overflow = bodyWidth > 375;

    if (overflow) {
      console.log('FAIL: Bug #2 仍存在 - 布局溢出 (宽度 ' + bodyWidth + 'px > 375px)');
      results.push({ test: 14, name: 'Bug #2 回归', status: 'FAIL', bug: 'Bug #2 - 移动端布局错乱' });
    } else {
      console.log('PASS: Bug #2 已修复，无布局溢出');
      results.push({ test: 14, name: 'Bug #2 回归', status: 'PASS' });
    }
  } catch (e) {
    console.log('FAIL: ' + e.message);
    results.push({ test: 14, name: 'Bug #2 回归', status: 'FAIL', error: e.message });
  }
  await bug2Context.close();

  // Test 15: Bug #3 - iPad 输入框/按钮
  console.log('\n[Test 15] Bug #3 回归 - iPad 输入框/按钮位置正常');
  var bug3Context = await browser.newContext({ viewport: { width: 768, height: 1024 } });
  var bug3Page = await bug3Context.newPage();
  try {
    await bug3Page.goto(BASE_URL + '/zh/chat', { waitUntil: 'networkidle', timeout: 30000 });
    await bug3Page.waitForTimeout(2000);

    inp = await bug3Page.$('input[type="text"], textarea');
    btn = await bug3Page.$('button');

    if (inp && btn) {
      inputBox = await inp.boundingBox();
      buttonBox = await btn.boundingBox();
      var distance = Math.sqrt(Math.pow(inputBox.x + inputBox.width - buttonBox.x, 2) + Math.pow(inputBox.y - buttonBox.y, 2));

      console.log('  输入框和按钮距离: ' + distance.toFixed(0) + 'px');
      if (distance < 500) {
        console.log('PASS: Bug #3 已修复');
        results.push({ test: 15, name: 'Bug #3 回归', status: 'PASS' });
      } else {
        console.log('FAIL: Bug #3 仍存在 - 距离过大');
        results.push({ test: 15, name: 'Bug #3 回归', status: 'FAIL', bug: 'Bug #3 - iPad 输入框/按钮位置分离' });
      }
    }
  } catch (e) {
    console.log('FAIL: ' + e.message);
    results.push({ test: 15, name: 'Bug #3 回归', status: 'FAIL', error: e.message });
  }
  await bug3Context.close();

  // Test 16: Bug #4 - AI 响应区域
  console.log('\n[Test 16] Bug #4 回归 - AI 响应内容 y 坐标正常');
  var bug4Context = await browser.newContext({ viewport: { width: 768, height: 1024 } });
  var bug4Page = await bug4Context.newPage();
  try {
    await bug4Page.goto(BASE_URL + '/zh/chat', { waitUntil: 'networkidle', timeout: 30000 });
    await bug4Page.waitForTimeout(2000);

    aiArea = await bug4Page.$('main, [class*="response"], [class*="chat"]');
    if (aiArea) {
      areaBox = await aiArea.boundingBox();
      console.log('  AI 响应区域 y 坐标: ' + areaBox.y);

      if (areaBox.y < -100) {
        console.log('FAIL: Bug #4 仍存在 - y=' + areaBox.y);
        results.push({ test: 16, name: 'Bug #4 回归', status: 'FAIL', bug: 'Bug #4 - AI 响应区域 y=-1284' });
      } else {
        console.log('PASS: Bug #4 已修复');
        results.push({ test: 16, name: 'Bug #4 回归', status: 'PASS' });
      }
    }
  } catch (e) {
    console.log('FAIL: ' + e.message);
    results.push({ test: 16, name: 'Bug #4 回归', status: 'FAIL', error: e.message });
  }
  await bug4Context.close();

  await browser.close();

  // ========================================
  // 输出汇总
  // ========================================
  console.log('\n\n========================================');
  console.log('测试结果汇总');
  console.log('========================================');

  var passed = results.filter(function(r) { return r.status === 'PASS'; }).length;
  var failed = results.filter(function(r) { return r.status === 'FAIL'; }).length;
  var warnings = results.filter(function(r) { return r.status === 'WARN'; }).length;

  console.log('\n通过: ' + passed + '/16');
  console.log('失败: ' + failed + '/16');
  console.log('警告: ' + warnings + '/16');

  console.log('\n详细结果:');
  results.forEach(function(r) {
    var icon = r.status === 'PASS' ? 'PASS' : r.status === 'FAIL' ? 'FAIL' : 'WARN';
    console.log('  [' + icon + '] Test ' + r.test + ': ' + r.name);
    if (r.bug) console.log('         -> ' + r.bug);
    if (r.error) console.log('         -> Error: ' + r.error);
  });

  if (failed > 0) {
    console.log('\n发现的 Bug:');
    results.filter(function(r) { return r.status === 'FAIL' && r.bug; }).forEach(function(r) {
      console.log('  - ' + r.bug);
    });
  }

  return results;
}

runFullMobileTests()
  .then(function() { process.exit(0); })
  .catch(function(e) {
    console.error('测试失败:', e);
    process.exit(1);
  });