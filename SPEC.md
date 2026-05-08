# Music MiniMax - AI 歌曲生成网页应用

## 概述
基于 MiniMax API 的 AI 歌曲生成网页应用，用户通过对话描述需求，系统生成歌词，用户确认后生成歌曲。

## 技术架构

### 前后端分离
- **后端**: Flask API 服务器
- **前端**: React 单页应用
- **API Endpoint**: `http://localhost:5000/api`

### MiniMax API 集成
- **对话模型**: MiniMax-M2.7-highspeed (理解用户需求)
- **歌词模型**: lyrics_generation (生成歌词)
- **歌曲模型**: music-2.6 (生成歌曲)

### 核心流程
1. 用户对话 → MiniMax-M2.7-highspeed 理解需求
2. 生成歌词 → lyrics_generation API
3. 用户确认歌词
4. 生成歌曲 → music-2.6 API
5. 网页播放歌曲

## API 设计

### 端点
- `POST /api/chat` - 对话理解
- `POST /api/lyrics` - 生成歌词
- `POST /api/music` - 生成歌曲
- `GET /api/health` - 健康检查

### 请求格式
```json
{
  "action": "chat|lyrics|music",
  "data": { ... }
}
```

## 文件结构
```
music-minimax/
├── backend/
│   ├── app.py           # Flask 主应用
│   ├── api_client.py    # MiniMax API 客户端
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   └── components/
│   └── package.json
└── tests/
    └── e2e.spec.js      # Playwright 测试
```

## 环境变量
```
MINIMAX_API_KEY=sk-cp-LgTiOgPQdjuhkRMDIahYhL3k-Tkmjh3DzqYrn7X7FjiIeHsPdIGEs3iiQtDh_QzpF3M6AYtk8l4qU8iwdN3fQbLjX3IAI5DsIl1Qw1nFOVPabO0kyuVX5Y4
MINIMAX_API_BASE=https://api.minimaxi.com
```

## 验收标准
- [ ] 用户可在网页输入歌曲需求
- [ ] 系统生成歌词并展示给用户
- [ ] 用户可编辑/确认歌词
- [ ] 系统生成歌曲并提供播放
- [ ] Playwright 端到端测试通过
