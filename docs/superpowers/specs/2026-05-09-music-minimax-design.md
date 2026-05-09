# Music MiniMax - 设计规格文档

## 概述

基于 MiniMax API 的 AI 歌曲生成网页应用，用户通过对话描述需求，系统生成歌词，用户确认后异步生成歌曲并支持播放下载。

## 架构决策

### 技术栈（已定）
- 前端：Next.js 14 (App Router) + TypeScript + Tailwind + shadcn/ui
- 后端：Next.js API Routes（同项目内，避免跨域）
- 数据库：SQLite + Prisma
- 鉴权：NextAuth (Credentials provider)
- 播放器：wavesurfer.js
- 测试：Playwright
- 日志：pino（结构化 JSON 日志，输出到 logs/app-YYYY-MM-DD.log）
- 部署：本地 docker-compose up 一键启动，绑定 localhost:3000

### 音频存储方案
- **选择：B. 下载到本地**
- 生成后自动下载 mp3 到 `/public/songs/` 目录
- 数据库存储本地路径（`/songs/{uuid}.mp3`）
- 需要定期清理策略（按时间/数量/用户配额）

## 数据库模型

```prisma
model User {
  id              String      @id @default(cuid())
  email           String      @unique
  passwordHash    String
  dailySongCount  Int        @default(0)
  dailyResetAt    DateTime   @default(now())
  createdAt       DateTime   @default(now())
  songs           SongTask[]
  tokenUsage      TokenUsage[]
}

model SongTask {
  id               String    @id @default(cuid())
  userId           String
  user             User      @relation(fields: [userId], references: [id])
  status           String    // pending | processing | done | failed
  prompt           String
  lyrics           String?
  lyricsCacheKey   String?
  musicUrl         String?   // 本地路径：/songs/{uuid}.mp3
  error           String?
  progress         Int       @default(0)
  estimatedSeconds Int?
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
}

model LyricsCache {
  id        String   @id @default(cuid())
  cacheKey  String   @unique  // MD5(prompt)
  prompt    String
  lyrics    String
  createdAt DateTime @default(now())
  expiresAt DateTime
}

model TokenUsage {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  action    String   // chat | lyrics | music
  tokens    Int
  createdAt DateTime @default(now())
}
```

## API 设计

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth 处理登录/登出 |
| `/api/chat` | POST | 对话理解 |
| `/api/lyrics` | POST | 生成歌词（先查缓存，再调 API） |
| `/api/music/generate` | POST | 创建歌曲生成任务 |
| `/api/music/status/[taskId]` | GET | 轮询任务状态 |
| `/api/songs` | GET | 获取当前用户所有歌曲 |
| `/api/songs/[taskId]` | DELETE | 删除歌曲及本地文件 |
| `/api/songs/[taskId]/regenerate` | POST | 重新生成（复用歌词） |
| `/api/admin/usage` | GET | 查看消耗统计 |

### 任务状态流转
```
pending → processing → done
                   → failed
```

## 前端页面结构

```
app/
├── (auth)/
│   ├── login/page.tsx
│   └── register/page.tsx
├── (main)/
│   ├── layout.tsx
│   ├── chat/page.tsx           # 核心流程页
│   └── my-songs/page.tsx       # 我的作品
├── api/
│   ├── auth/[...nextauth]/
│   ├── chat/route.ts
│   ├── lyrics/route.ts
│   ├── music/generate/route.ts
│   ├── music/status/[taskId]/route.ts
│   └── songs/route.ts
└── components/
    ├── ui/                     # shadcn/ui
    ├── chat/
    ├── player/                 # wavesurfer.js
    └── layout/
```

## 错误处理策略

| 错误场景 | 处理方式 |
|----------|----------|
| MiniMax API 超时 | 指数退避重试（1s → 2s → 4s → 8s），最多 3 次 |
| 限流（429） | 等待 30s 后重试 |
| 任务失败 | 状态改为 failed，前端显示友好错误 |
| 重复点击 | 防抖 1s 内禁止重复提交 |
| 网络断开 | 前端检测 navigator.onLine，断网时禁用操作 |
| Token 超限 | 返回 429，提示"今日生成次数已用完" |

## 日志规范

每条日志（pino JSON）必须包含：
```json
{
  "level": "info",
  "timestamp": "ISO8601",
  "requestId": "贯穿一次请求",
  "userId": "未登录时为 null",
  "module": "api/lyrics",
  "action": "lyrics_generate",
  "durationMs": 3240,
  "payload": { "脱敏后" }
}
```

关键节点必打日志：API 入参、MiniMax 请求/响应、DB 写入、任务状态流转、异常。

## 安全要求

1. **API Key 隔离**：所有 MiniMax 调用必须走 Next.js 后端代理，key 放 `.env.local`
2. **Token 保护**：每用户每日最多 5 次歌曲生成（可配置）
3. **bcrypt 密码哈希**：用于本地账号系统

## MiniMax API 配置

- 对话模型：MiniMax-M2.7-highspeed（OpenAI 兼容格式）
- 歌词模型：lyrics_generation
- 歌曲模型：music-2.6（异步，轮询机制）
- API Key：配置在 `.env.local` 中（`MINIMAX_API_KEY`），永不写入代码或文档
- 文档入口：https://platform.minimaxi.com/docs/api-reference/api-overview
