# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e.spec.js >> Music MiniMax 应用 - E2E测试 >> 点击生成歌词后显示歌词编辑区
- Location: tests/e2e.spec.js:107:3

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
    27 × locator resolved to <button disabled class="generate-btn lyrics-btn">生成歌词中...</button>
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
      - generic [ref=e11]: 一首情歌
    - generic [ref=e12]:
      - generic [ref=e13]: AI
      - generic [ref=e15]: "下面是一首我为您原创的中文情歌《星光下的誓言》。 （如果您想要别的曲风、英文版或只想听推荐歌曲，也可以告诉我，我会继续帮您完善！） --- ## 《星光下的誓言》 **（曲式：四拍子，流行抒情）** **（推荐和弦进行：C – G – Am – F）** ### 【前奏】 > *（轻柔的钢琴或吉他，渐入）* ### 【第一段 Verse】 微风轻拂夜色， 星辰点点洒在发梢， 你的笑容像月光， 悄悄照进我的心房。 ### 【预副歌 Pre‑Chorus】 每一次呼吸都像在写诗， 每一秒相视都让时间停住。 我想把这份温柔， 全部写进这首歌里。 ### 【副歌 Chorus】 在星光下许下誓言， 把爱写进风里让它飘远。 无论海角还是天边， 只要有你，我的世界永不孤单。 ### 【第二段 Verse】 街灯映照雨滴， 倒影里映出我们的笑颜， 手心的温度， 是我这辈子最温暖的誓言。 ### 【Pre‑Chorus】 每一次呼吸都像在写诗， 每一秒相视都让时间停住。 我想把这份温柔， 全部写进这首歌里。 ### 【Chorus】 在星光下许下誓言， 把爱写进风里让它飘远。 无论海角还是天边， 只要有你，我的世界永不孤单。 ### 【桥段 Bridge】 当星辰黯淡， 我仍会握紧你的手， 在无尽的夜里， 为你点燃最亮的灯。 ### 【尾声 Outro】 *（柔和的钢琴或吉他，轻声渐远）* 爱，像星光，永不熄灭。 --- ## 🎵 推荐几首经典中文情歌（如果您想听别人的作品） | 歌曲 | 歌手 | 发行年份 | 备注 | |------|------|----------|------| | 《月亮代表我的心》 | 邓丽君 | 1977 | 经典的柔情倾诉 | | 《小幸运》 | 田馥甄 | 2015 | 清新温暖的校园情歌 | | 《往后余生》 | 马良 / 陈斐 | 2018 | 浪漫的对唱 | | 《爱情转移》 | 陈奕迅 | 2007 | 歌词深刻、旋律动人 | | 《那些年》 | 胡夏 | 2011 | 青春记忆中的甜蜜与遗憾 | 希望这首《星光下的誓言》能让您感受到满满的爱意，也希望这些推荐能帮您找到更多心动旋律！如果还有其他需求（比如配上和弦、编曲建议、英文版等），随时告诉我哦。祝您聆听愉快 🌟💖."
  - generic [ref=e16]:
    - textbox "描述你想要什么样的歌曲..." [ref=e17]: 一首情歌
    - button "发送" [ref=e18] [cursor=pointer]
```

# Test source

```ts
  19  |     await expect(page.locator('h1')).toBeVisible();
  20  |     await expect(page.locator('textarea.chat-input')).toBeVisible();
  21  |     await expect(page.locator('button.send-btn')).toBeVisible();
  22  |   });
  23  | 
  24  |   test('输入框可编辑', async ({ page }) => {
  25  |     const input = page.locator('textarea.chat-input');
  26  |     await expect(input).toBeVisible();
  27  |     await input.fill('测试消息');
  28  |     const value = await input.inputValue();
  29  |     expect(value).toBe('测试消息');
  30  |   });
  31  | 
  32  |   test('发送按钮初始禁用（无输入）', async ({ page }) => {
  33  |     const sendButton = page.locator('button.send-btn');
  34  |     await expect(sendButton).toBeDisabled();
  35  |   });
  36  | 
  37  |   test('输入后发送按钮启用', async ({ page }) => {
  38  |     const input = page.locator('textarea.chat-input');
  39  |     const sendButton = page.locator('button.send-btn');
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
> 119 |     await expect(page.locator('button.lyrics-btn')).toBeEnabled({ timeout: 30000 });
      |                                                     ^ Error: expect(locator).toBeEnabled() failed
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
  140 |     await expect(page.locator('button.lyrics-btn')).toBeEnabled({ timeout: 30000 });
  141 | 
  142 |     await page.locator('button.lyrics-btn').click();
  143 | 
  144 |     // 等待生成歌曲按钮出现
  145 |     await expect(page.locator('button.generate-btn')).toBeVisible({ timeout: 20000 });
  146 |   });
  147 | });
```