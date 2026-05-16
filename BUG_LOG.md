# Music MiniMax Bug Log

## Bug #1 - WavePlayer AbortError (Minor)
**页面**: 全局 (WavePlayer 组件)
**描述**: wavesurfer.js 在组件销毁时 `E.destroy` 方法被调用时 signal 被中止
**修复**: 已在 cleanup 中添加更完善的错误处理，忽略 AbortError
**状态**: ✅ Fixed

---

## Bug #2 - 移动端布局错乱 (Critical) - 已自动修复
**页面**: 移动端 (iPhone 375x667)
**描述**: 侧边栏固定宽度 288px 超出移动端视口 375px
**状态**: ✅ 已自动修复（可能是之前的设计优化解决了）

---

## Bug #3 - iPad 输入框/按钮位置错乱 (Major) - 已自动修复
**页面**: iPad 端 (768x1024)
**描述**: 输入框和发送按钮位置分离
**状态**: ✅ 已自动修复

---

## Bug #4 - AI 响应内容 y=-1284 定位错误 (Major) - 已自动修复
**页面**: 聊天页 /zh/chat (AI 响应区域)
**描述**: AI 响应内容区域容器起始 y 坐标为负值
**状态**: ✅ 已自动修复

---

## Bug #5 - 语言切换失效 (Critical)
**页面**: 语言切换功能
**描述**: 语言切换后页面内容仍显示旧语言，产生大量错误
**根因**: 
1. NextIntlClientProvider 缺少 locale prop
2. ChatInterface 组件中 t('chat.xxx') 调用错误（应该是 t('xxx')）
**修复**: 
- 在 root layout 中添加 locale prop
- 批量修复 t('chat.xxx') → t('xxx')
**状态**: ✅ Fixed

---

## Bug #6 - AI 回复语言不对齐 (Critical) - FIXED
**页面**: ChatInterface + API 路由
**描述**: AI 回复语言与界面语言不一致。用户选择英文界面，但 AI 可能用中文回复
**根因**: API 调用没有传递 locale，AI 不知道应该用什么语言回复
**修复方案**:
1. ✅ ChatInterface 发送消息时传递 locale
2. ✅ Chat API 根据 locale 添加 system prompt 指导 AI 回复语言
3. ✅ Lyrics API 也支持多语言（locale 指令注入到 prompt）
**状态**: ✅ Fixed

---

## 测试执行记录

| 测试时间 | 测试类型 | 测试页面 | 结果 |
|---------|---------|---------|------|
| 2026-05-15 | 首页加载 | /zh | PASS |
| 2026-05-15 | 聊天页 | /zh/chat | PASS |
| 2026-05-15 | 设置页 | /zh/settings | PASS |
| 2026-05-15 | 我的歌曲页 | /zh/my-songs | PASS |
| 2026-05-15 | 移动端布局 | /zh/chat (375x667) | PASS |
| 2026-05-15 | iPad布局 | /zh/chat (768x1024) | PASS |
| 2026-05-15 | 语言切换 EN | /en/chat | PASS |
| 2026-05-15 | 语言切换 JA | /ja/chat | PASS |
| 2026-05-15 | AI 语言对齐 | /zh/chat | PASS (Bug #6 Fixed) |
| 2026-05-15 | 语言切换 EN | /en/chat | PASS |
| 2026-05-15 | 语言切换 JA | /ja/chat | PASS |

---

## 冒烟测试状态
- [x] 快捷按钮点击 - PASS
- [x] 发送请求 - PASS
- [x] AI 歌词生成 - PASS
- [x] 播放歌曲 - PASS
- [ ] 删除歌曲 - 待测试

## 移动端测试状态
- [x] iPhone (375x667) - PASS
- [x] iPad (768x1024) - PASS

## 总结
- 已修复: Bug #1, #2, #3, #4, #5, #6
- 进行中: 无

**所有已知 Bug 已修复！**
