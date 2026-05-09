# Music MiniMax E2E 测试套件

## 测试文件说明

| 文件 | 说明 |
|------|------|
| `e2e-full.spec.js` | 完整的 E2E 测试套件，覆盖所有核心流程 |
| `e2e.spec.js` | 基础 E2E 测试（部分覆盖） |
| `api.spec.js` | API 端点测试 |
| `ux.spec.js` | 用户体验测试 |

## 快速开始

### 1. 安装依赖
```bash
cd /Users/airboom/Desktop/opencode/music-minimax
npm install
npx playwright install
```

### 2. 启动应用
```bash
# 启动前端 (端口 3000)
cd frontend && npm start

# 启动后端 (端口 5000) - 新终端
cd backend && python app.py
```

### 3. 运行测试

```bash
# 运行所有测试
npx playwright test

# 运行完整 E2E 测试
npx playwright test tests/e2e-full.spec.js

# 运行测试并查看 UI
npx playwright test --ui

# 只运行某个测试套件
npx playwright test tests/e2e-full.spec.js --grep "对话流程"

# 生成 HTML 报告
npx playwright show-report
```

## 测试用例清单

### 登录流程
- [ ] 正确账号密码登录成功
- [ ] 错误密码登录失败
- [ ] 未注册账号登录失败

### 对话流程
- [x] 发送按钮初始禁用（无输入）
- [x] 输入后发送按钮启用
- [x] 空消息被拒绝
- [x] 发送消息成功 - 用户消息显示
- [x] 发送消息后 AI 回复出现
- [x] 回车键可提交消息
- [x] 多轮对话正常
- [x] 对话后出现生成歌词按钮

### 歌词生成
- [x] 生成歌词成功 - 歌词编辑区出现
- [x] 歌词可编辑
- [x] 重新生成歌词

### 歌曲生成
- [x] 确认歌词后开始生成歌曲
- [x] 进度条/加载状态显示
- [x] 完成后播放器出现

### 播放器
- [x] 音频播放器存在
- [x] 播放/暂停功能
- [x] 跳转进度功能
- [x] 编辑歌词按钮
- [x] 重新生成按钮

### 异常场景
- [x] 重复点击防抖
- [x] 加载中发送按钮禁用
- [x] 后端不可用时显示错误提示
- [x] 错误提示可点击关闭
- [x] 网络断开时提示
- [x] 超时处理

### 响应式设计
- [x] 桌面端布局
- [x] 平板端布局
- [x] 移动端布局
- [x] 移动端横屏

### 可访问性
- [x] 页面有标题
- [x] 输入框有占位符
- [x] 按钮可被聚焦
- [x] 输入框可被聚焦

## 目录结构

```
tests/
├── e2e-full.spec.js    # 完整 E2E 测试套件
├── e2e.spec.js         # 基础 E2E 测试
├── api.spec.js         # API 测试
└── ux.spec.js          # UX 测试

docs/test-reports/
├── TEST-REPORT-TEMPLATE.md
└── YYYY-MM-DD-test-report.md

docs/bugs.md
```

## 报告输出

测试报告会自动生成到：
- HTML 报告: `test-results/html/index.html`
- JSON 报告: `test-results/results.json`

使用 `npx playwright show-report` 查看 HTML 报告。

## CI/CD 集成

在 CI 环境中运行：
```bash
CI=true npx playwright test --reporter=html,json
```

## 注意事项

1. **后端依赖**: 部分测试需要后端服务运行在 `localhost:5000`
2. **超时设置**: 歌曲生成测试超时较长（最多 3 分钟）
3. **并发限制**: 测试串行执行，避免后端压力
4. **视频录制**: 失败测试会自动录制视频保存到 `test-results/`
