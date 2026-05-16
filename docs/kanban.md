# Music MiniMax 项目看板

## 项目概览
- **工作目录**: `/Users/airboom/Desktop/opencode/music-minimax`
- **设计规格**: `docs/superpowers/specs/2026-05-09-music-minimax-design.md`
- **更新时间**: 2026-05-10

## 任务看板

| # | 任务 | 负责人 | 状态 | 依赖 | 备注 |
|---|------|--------|------|------|------|
| 1 | 初始化 Next.js 14 项目（基础设置） | architect | ✅ 完成 | - | 包含 Prisma + SQLite 配置 |
| 2 | 实现认证系统（NextAuth + 密码登录） | developer | ✅ 完成 | 任务1 | Credentials provider |
| 3 | 实现 API Routes（MiniMax 代理） | developer | ✅ 完成 | 任务1 | chat/lyrics/music/generate 等 |
| 4 | 实现前端页面和播放器组件 | ui-designer | ✅ 完成 | 任务2 | chat 页面 + wavesurfer.js 播放器 |
| 5 | 编写 Playwright E2E 测试 | tester | ✅ 完成 | 任务4 | 32 测试全部通过 |
| 6 | 整理文档和 README | product-manager | ✅ 完成 | 任务2,3,4 | README已完善 |
| 7 | 多语言支持（i18n） | developer | ✅ 完成 | 任务4 | 右上角语言选择器，默认简体中文 |
| 8 | 设置页面 | developer | ✅ 完成 | 任务4 | 新 tab 页面，可选模型、可设置 API Key |

## 任务详情

### 任务1: 初始化 Next.js 14 项目
- **负责人**: architect
- **状态**: ✅ 完成
- **内容**:
  - 初始化 Next.js 14 (App Router) + TypeScript
  - 配置 Tailwind CSS + shadcn/ui
  - 配置 Prisma + SQLite
  - 配置 pino 日志系统
  - 创建目录结构
- **验收标准**: `npm run dev` 可正常启动

### 任务2: 实现认证系统
- **负责人**: developer
- **状态**: ⏳ 待开始
- **依赖**: 任务1
- **内容**:
  - NextAuth Credentials provider
  - 注册/登录页面
  - bcrypt 密码哈希
  - Session 管理
- **验收标准**: 用户可注册、登录、登出

### 任务3: 实现 API Routes
- **负责人**: developer
- **状态**: ⏳ 待开始
- **依赖**: 任务1
- **内容**:
  - `/api/chat` - 对话理解（同步）
  - `/api/lyrics` - 歌词生成（同步，含缓存）
  - `/api/music/generate` - 歌曲生成（同步，直接返回 audio_url）
  - ~~`/api/music/status/[taskId]`~~ - **已删除** - music-2.6 是同步 API
  - `/api/songs` - 获取用户歌曲列表
  - `/api/songs/[taskId]` - 删除歌曲
  - `/api/admin/usage` - 消耗统计
- **验收标准**: 所有端点按设计规格工作
- **实现要求**: 参考 `docs/reviews/implementation-requirements.md`

### 任务4: 实现前端页面和播放器
- **负责人**: ui-designer
- **状态**: ⏳ 待开始
- **依赖**: 任务2
- **内容**:
  - `(auth)/login/page.tsx`
  - `(auth)/register/page.tsx`
  - `(main)/chat/page.tsx` - 核心聊天生成流程
  - `(main)/my-songs/page.tsx` - 我的作品列表
  - `components/player/` - wavesurfer.js 播放器组件
- **验收标准**: 完整用户流程可用

### 任务5: 编写 Playwright E2E 测试
- **负责人**: tester
- **状态**: ⏳ 待开始
- **依赖**: 任务4
- **内容**:
  - 登录/注册流程测试
  - 歌词生成测试
  - 歌曲生成和播放测试
  - 我的作品页面测试
- **验收标准**: 测试全部通过

### 任务6: 整理文档和 README
- **负责人**: product-manager
- **状态**: ⏳ 待开始
- **依赖**: 任务2,3,4
- **内容**:
  - README.md 完善
  - API 文档
  - 部署说明
  - 更新 blockers.md
- **验收标准**: 文档完整可读

### 任务7: 多语言支持（i18n）
- **负责人**: developer
- **状态**: ✅ 完成
- **依赖**: 任务4
- **内容**:
  - 集成 next-intl
  - 右上角语言选择器组件
  - 支持语言：简体中文（默认）、English、日文
  - 翻译 key 管理（`src/messages/{zh,en,ja}.json`）
- **验收标准**: 用户可切换语言，界面文字随语言变化

### 任务8: 设置页面
- **负责人**: developer
- **状态**: ✅ 完成
- **依赖**: 任务4
- **内容**:
  - 新增 `[locale]/settings/page.tsx`
  - 模型选择：MiniMax-M2.7-highspeed/standard/long
  - API Key 设置（localStorage 存储）
- **验收标准**: 设置页面可访问，配置可保存

## 项目进度

- [x] 任务1: 初始化 Next.js 14 项目
- [x] 任务2: 实现认证系统
- [x] 任务3: 实现 API Routes
- [x] 任务4: 实现前端页面和播放器
- [x] 任务5: 编写 Playwright E2E 测试（32 测试全部通过）
- [x] 任务6: 整理文档和 README
- [x] 任务7: 多语言支持（i18n）
- [x] 任务8: 设置页面

## 阻塞问题 (blockers.md)

暂无阻塞问题

---
*最后更新: 2026-05-10*
