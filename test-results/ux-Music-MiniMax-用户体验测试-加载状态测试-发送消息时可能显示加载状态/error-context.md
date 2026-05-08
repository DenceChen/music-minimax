# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ux.spec.js >> Music MiniMax 用户体验测试 >> 加载状态测试 >> 发送消息时可能显示加载状态
- Location: tests/ux.spec.js:15:5

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: locator.fill: Test timeout of 60000ms exceeded.
Call log:
  - waiting for locator('input[placeholder*="描述"]')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - heading "AI 歌曲生成器" [level=1] [ref=e5]
  - generic [ref=e7]:
    - paragraph [ref=e8]: 欢迎使用 AI 歌曲生成器
    - paragraph [ref=e9]: 描述你想要什么样的歌曲，我会帮你创作歌词并生成音乐
  - generic [ref=e10]:
    - textbox "描述你想要什么样的歌曲..." [ref=e11]
    - button "发送" [disabled] [ref=e12]
```

# Test source

```ts
  1   | const { test, expect } = require('@playwright/test');
  2   | 
  3   | test.describe('Music MiniMax 用户体验测试', () => {
  4   |   test.beforeEach(async ({ page }) => {
  5   |     await page.goto('http://localhost:3000');
  6   |   });
  7   | 
  8   |   test.describe('加载状态测试', () => {
  9   |     test('初始状态加载指示器不可见', async ({ page }) => {
  10  |       // 初始状态下不应显示加载中
  11  |       await expect(page.locator('text=加载中')).not.toBeVisible();
  12  |       await expect(page.locator('text=生成中')).not.toBeVisible();
  13  |     });
  14  | 
  15  |     test('发送消息时可能显示加载状态', async ({ page }) => {
  16  |       const input = page.locator('input[placeholder*="描述"]');
> 17  |       await input.fill('测试加载状态');
      |                   ^ Error: locator.fill: Test timeout of 60000ms exceeded.
  18  |       await page.locator('button:has-text("发送")').click();
  19  | 
  20  |       // 按钮在加载时应该被禁用
  21  |       const sendButton = page.locator('button:has-text("发送")');
  22  |       // 加载状态后按钮应该重新可用
  23  |       await expect(sendButton).toBeEnabled({ timeout: 10000 });
  24  |     });
  25  |   });
  26  | 
  27  |   test.describe('按钮状态测试', () => {
  28  |     test('发送按钮初始状态启用', async ({ page }) => {
  29  |       const sendButton = page.locator('button:has-text("发送")');
  30  |       await expect(sendButton).toBeEnabled();
  31  |     });
  32  | 
  33  |     test('输入框为空时发送按钮仍然可用', async ({ page }) => {
  34  |       // 即使没有输入，按钮也应该可用（可能什么都不做）
  35  |       const sendButton = page.locator('button:has-text("发送")');
  36  |       await expect(sendButton).toBeEnabled();
  37  |     });
  38  | 
  39  |     test('生成歌词按钮初始状态隐藏', async ({ page }) => {
  40  |       // 初始状态下不应显示生成歌词按钮
  41  |       const generateButton = page.locator('button:has-text("开始生成歌词")');
  42  |       await expect(generateButton).not.toBeVisible();
  43  |     });
  44  | 
  45  |     test('生成歌词按钮在对话后出现', async ({ page }) => {
  46  |       const input = page.locator('input[placeholder*="描述"]');
  47  |       await input.fill('测试');
  48  |       await page.locator('button:has-text("发送")').click();
  49  | 
  50  |       // 按钮应该在对话后出现
  51  |       await expect(page.locator('button:has-text("开始生成歌词")')).toBeVisible({ timeout: 5000 });
  52  |     });
  53  | 
  54  |     test('生成歌曲按钮在歌词输入后启用', async ({ page }) => {
  55  |       test.setTimeout(30000);
  56  |       const input = page.locator('input[placeholder*="描述"]');
  57  |       await input.fill('测试');
  58  |       await page.locator('button:has-text("发送")').click();
  59  | 
  60  |       // 等待发送完成
  61  |       await page.waitForTimeout(3000);
  62  | 
  63  |       await page.locator('button:has-text("开始生成歌词")').click();
  64  | 
  65  |       // 生成歌曲按钮应该可见 (增加超时)
  66  |       const generateMusicBtn = page.locator('button:has-text("生成歌曲")');
  67  |       await expect(generateMusicBtn).toBeVisible({ timeout: 20000 });
  68  |     });
  69  |   });
  70  | 
  71  |   test.describe('错误提示测试', () => {
  72  |     test('网络错误时页面不崩溃', async ({ page }) => {
  73  |       // 让页面加载完成
  74  |       await page.goto('http://localhost:3000');
  75  | 
  76  |       // 页面应该保持可用
  77  |       await expect(page.locator('h1')).toBeVisible();
  78  |     });
  79  | 
  80  |     test('错误后用户可以继续交互', async ({ page }) => {
  81  |       const input = page.locator('input[placeholder*="描述"]');
  82  |       await input.fill('测试错误恢复');
  83  | 
  84  |       // 页面应该保持响应
  85  |       await expect(page.locator('button:has-text("发送")')).toBeEnabled();
  86  |     });
  87  |   });
  88  | 
  89  |   test.describe('可访问性测试', () => {
  90  |     test('页面有标题元素', async ({ page }) => {
  91  |       await expect(page.locator('h1')).toBeVisible();
  92  |     });
  93  | 
  94  |     test('输入框有 placeholder', async ({ page }) => {
  95  |       const input = page.locator('input[placeholder*="描述"]');
  96  |       const placeholder = await input.getAttribute('placeholder');
  97  |       expect(placeholder).toBeTruthy();
  98  |     });
  99  | 
  100 |     test('按钮可被聚焦', async ({ page }) => {
  101 |       const button = page.locator('button:has-text("发送")');
  102 |       await button.focus();
  103 |       await expect(button).toBeFocused();
  104 |     });
  105 | 
  106 |     test('输入框可被聚焦', async ({ page }) => {
  107 |       const input = page.locator('input[placeholder*="描述"]');
  108 |       await input.focus();
  109 |       await expect(input).toBeFocused();
  110 |     });
  111 | 
  112 |     test('回车键可触发表单提交', async ({ page }) => {
  113 |       const input = page.locator('input[placeholder*="描述"]');
  114 |       await input.focus();
  115 |       await input.press('Enter');
  116 | 
  117 |       // 应该触发某些变化
```