# Music MiniMax - AI 歌曲生成器

基于 MiniMax API 的 AI 歌曲生成网页应用。

## 功能特性

- 🎤 **对话创作**：用自然语言描述你的歌曲需求
- ✍️ **智能歌词**：AI 自动生成专业歌词，支持编辑
- 🎵 **歌曲生成**：一键生成高质量歌曲
- ▶️ **在线播放**：直接在网页播放生成的音乐

## 技术架构

- **后端**：Flask + MiniMax API
- **前端**：React SPA
- **API**：RESTful JSON

## 快速开始

### 1. 启动后端
```bash
cd backend
pip install -r requirements.txt
python app.py
```

### 2. 启动前端
```bash
cd frontend
npm install
npm start
```

### 3. 打开浏览器
访问 http://localhost:3000

## API 端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/health` | GET | 健康检查 |
| `/api/chat` | POST | 对话理解 |
| `/api/lyrics` | POST | 生成歌词 |
| `/api/music` | POST | 生成歌曲 |

## 使用流程

1. 输入歌曲描述（如"一首关于夏天的轻快情歌"）
2. AI 理解需求并生成歌词
3. 编辑/确认歌词
4. 点击生成歌曲
5. 等待生成后直接播放

## MiniMax API

- 对话模型：MiniMax-M2.7-highspeed
- 歌词模型：lyrics_generation
- 歌曲模型：music-2.6

## 开发团队

- coder：后端开发
- frontend-dev：前端开发
- tester：测试工程师
- documentation：文档工程师
- business-analyst：需求分析