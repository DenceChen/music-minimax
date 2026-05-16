# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [1.0.0] - 2026-05-09

### Added

- **用户认证系统**
  - NextAuth Credentials Provider 注册/登录
  - bcrypt 密码哈希
  - Session 管理

- **对话式歌曲创作**
  - 自然语言输入歌曲需求
  - AI 对话理解意图
  - 上下文关联（多轮对话）

- **歌词生成**
  - MiniMax lyrics_generation API
  - MD5 缓存机制（相同 prompt 复用歌词）
  - 用户可编辑歌词

- **歌曲生成**
  - MiniMax music-2.6 API（异步）
  - 实时进度轮询
  - 本地 mp3 存储到 `/public/songs/`

- **播放器**
  - wavesurfer.js 集成
  - 在线播放/暂停/进度控制
  - 下载按钮

- **用户歌曲管理**
  - 我的作品页面
  - 删除歌曲（同步删除本地文件）
  - 重新生成（复用歌词）

- **每日生成限制**
  - 每用户每日最多 5 首歌曲
  - 凌晨自动重置配额

- **日志系统**
  - pino 结构化 JSON 日志
  - 按日期分文件（`logs/app-YYYY-MM-DD.log`）
  - 包含 requestId、userId、module、action、durationMs

### Technical

- Next.js 14 App Router + TypeScript
- Tailwind CSS + shadcn/ui
- SQLite + Prisma
- 错误处理（指数退避重试、限流处理）
- 防抖（1s 重复提交保护）
- 网络状态检测
