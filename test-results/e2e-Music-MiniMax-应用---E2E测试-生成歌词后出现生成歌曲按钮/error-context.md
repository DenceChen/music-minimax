# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e.spec.js >> Music MiniMax 应用 - E2E测试 >> 生成歌词后出现生成歌曲按钮
- Location: tests/e2e.spec.js:128:3

# Error details

```
Error: expect(locator).toBeEnabled() failed

Locator: locator('button.lyrics-btn')
Expected: enabled
Timeout: 30000ms
Error: element(s) not found

Call log:
  - Expect "toBeEnabled" with timeout 30000ms
  - waiting for locator('button.lyrics-btn')
    6 × locator resolved to <button disabled class="generate-btn lyrics-btn">生成歌词中...</button>
      - unexpected value "disabled"

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - heading "AI 歌曲生成器" [level=1] [ref=e5]
    - button "开始新对话" [ref=e6] [cursor=pointer]
  - generic [ref=e7]:
    - generic [ref=e8]:
      - generic [ref=e9]: U
      - generic [ref=e11]: 测试
    - generic [ref=e12]:
      - generic [ref=e13]: AI
      - generic [ref=e15]: 你好！我是 MiniMax-M2.7，很高兴为你服务！有什么我可以帮助你的吗？😊
  - generic [ref=e16]:
    - textbox "描述你想要什么样的歌曲..." [ref=e17]: 测试
    - button "发送" [ref=e18] [cursor=pointer]
```

# Test source

```ts
  40  | 
  41  |     await input.fill('测试消息');
  42  |     await expect(sendButton).toBeEnabled();
  43  |   });
  44  | 
  45  |   test('歌词区域初始不显示', async ({ page }) => {
  46  |     // 歌词区域的textarea有不同的class
  47  |     await expect(page.locator('textarea.lyrics-input')).not.toBeVisible();
  48  |   });
  49  | 
  50  |   test('移动端布局正常', async ({ page }) => {
  51  |     await page.setViewportSize({ width: 375, height: 667 });
  52  |     await expect(page.locator('h1')).toBeVisible();
  53  |     await expect(page.locator('textarea.chat-input')).toBeVisible();
  54  |     await expect(page.locator('button.send-btn')).toBeVisible();
  55  |   });
  56  | 
  57  |   test('平板端布局正常', async ({ page }) => {
  58  |     await page.setViewportSize({ width: 768, height: 1024 });
  59  |     await expect(page.locator('h1')).toBeVisible();
  60  |     await expect(page.locator('textarea.chat-input')).toBeVisible();
  61  |   });
  62  | 
  63  |   test('刷新页面后状态重置', async ({ page }) => {
  64  |     const input = page.locator('textarea.chat-input');
  65  |     await input.fill('测试消息');
  66  |     await page.reload();
  67  |     await page.waitForLoadState('networkidle');
  68  |     await expect(page.locator('textarea.chat-input')).toHaveValue('');
  69  |   });
  70  | 
  71  |   test('对话流程 - 发送消息', async ({ page }) => {
  72  |     test.setTimeout(30000);
  73  |     const input = page.locator('textarea.chat-input');
  74  |     await input.fill('我想听一首关于大海的歌');
  75  | 
  76  |     const sendButton = page.locator('button.send-btn');
  77  |     await sendButton.click();
  78  | 
  79  |     // 等待消息显示
  80  |     await expect(page.locator('.message.user-message')).toBeVisible({ timeout: 10000 });
  81  |   });
  82  | 
  83  |   test('对话流程 - 发送后AI回复', async ({ page }) => {
  84  |     test.setTimeout(30000);
  85  |     const input = page.locator('textarea.chat-input');
  86  |     await input.fill('测试消息');
  87  | 
  88  |     const sendButton = page.locator('button.send-btn');
  89  |     await sendButton.click();
  90  | 
  91  |     // 等待AI回复出现
  92  |     await expect(page.locator('.message.assistant-message')).toBeVisible({ timeout: 15000 });
  93  |   });
  94  | 
  95  |   test('对话后出现生成歌词按钮', async ({ page }) => {
  96  |     test.setTimeout(30000);
  97  |     const input = page.locator('textarea.chat-input');
  98  |     await input.fill('一首情歌');
  99  | 
  100 |     const sendButton = page.locator('button.send-btn');
  101 |     await sendButton.click();
  102 | 
  103 |     // 等待按钮出现 (conversation.length > 0 && !lyrics && step === "chat")
  104 |     await expect(page.locator('button.lyrics-btn')).toBeVisible({ timeout: 10000 });
  105 |   });
  106 | 
  107 |   test('点击生成歌词后显示歌词编辑区', async ({ page }) => {
  108 |     test.setTimeout(45000);
  109 |     const input = page.locator('textarea.chat-input');
  110 |     await input.fill('一首情歌');
  111 | 
  112 |     const sendButton = page.locator('button.send-btn');
  113 |     await sendButton.click();
  114 | 
  115 |     // 等待生成歌词按钮
  116 |     await expect(page.locator('button.lyrics-btn')).toBeVisible({ timeout: 10000 });
  117 | 
  118 |     // 等待按钮变为可点击（loading状态结束）
  119 |     await expect(page.locator('button.lyrics-btn')).toBeEnabled({ timeout: 30000 });
  120 | 
  121 |     // 点击生成歌词
  122 |     await page.locator('button.lyrics-btn').click();
  123 | 
  124 |     // 等待歌词编辑区出现
  125 |     await expect(page.locator('textarea.lyrics-input')).toBeVisible({ timeout: 20000 });
  126 |   });
  127 | 
  128 |   test('生成歌词后出现生成歌曲按钮', async ({ page }) => {
  129 |     test.setTimeout(45000);
  130 |     const input = page.locator('textarea.chat-input');
  131 |     await input.fill('测试');
  132 | 
  133 |     const sendButton = page.locator('button.send-btn');
  134 |     await sendButton.click();
  135 | 
  136 |     // 等待生成歌词按钮
  137 |     await expect(page.locator('button.lyrics-btn')).toBeVisible({ timeout: 10000 });
  138 | 
  139 |     // 等待按钮变为可点击（loading状态结束）
> 140 |     await expect(page.locator('button.lyrics-btn')).toBeEnabled({ timeout: 30000 });
      |                                                     ^ Error: expect(locator).toBeEnabled() failed
  141 | 
  142 |     await page.locator('button.lyrics-btn').click();
  143 | 
  144 |     // 等待生成歌曲按钮出现
  145 |     await expect(page.locator('button.generate-btn')).toBeVisible({ timeout: 20000 });
  146 |   });
  147 | });
```