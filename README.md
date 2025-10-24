# 微信项目

## 概述
这是一个基于Next.js和Express.js的全栈微信项目，包含用户认证、实时聊天、朋友圈等功能。

## 技术栈

### 前端
- Next.js 14 (App Router)
- Tailwind CSS
- Zustand (状态管理)
- WebSocket (实时通信)

### 后端
- Express.js
- PostgreSQL + Prisma (数据库)
- JWT (身份认证)
- WebSocket (实时通信)

## 功能特性
- [x] 用户注册/登录/登出
- [x] JWT身份认证 (HTTP Only Cookie)
- [x] 实时聊天 (WebSocket)
- [x] 朋友圈动态发布
- [x] 点赞/评论功能
- [x] 文件上传 (图片、文档)
- [x] 性能优化 (虚拟滚动、懒加载、缓存)
- [x] 安全防护 (密码加密、文件类型限制等)

## 快速开始

### 开发环境
```bash
# 1. 克隆项目
git clone <repository-url>
cd <project-directory>

# 2. 安装前端依赖
cd frontend
npm install
cd ..

# 3. 安装后端依赖
cd backend
npm install
cd ..

# 4. 启动数据库 (使用Docker)
docker-compose up -d postgres

# 5. 启动后端服务
cd backend
npm run dev

# 6. 启动前端服务
cd frontend
npm run dev

# 7. 访问应用
# 前端: http://localhost:3000
# 后端API: http://localhost:3007
# WebSocket: ws://localhost:3001
```

### Docker部署（推荐）
```bash
# 使用Docker Compose一键部署
docker-compose up -d

# 访问应用
# 前端: http://localhost:3000
# 后端API: http://localhost:3007
# WebSocket: ws://localhost:3001
```

### GitHub部署
有关如何将代码推送到GitHub的详细说明，请参考 [GitHub部署指南](GITHUB_DEPLOYMENT.md)。

## 项目结构
```
.
├── backend/              # 后端服务
│   ├── src/              # 源代码
│   │   ├── routes/       # API路由
│   │   ├── middleware/   # 中间件
│   │   ├── websocket/    # WebSocket服务器
│   │   └── lib/          # 工具库
│   ├── uploads/          # 上传文件目录
│   ├── prisma/           # Prisma数据库配置
│   └── server.js         # HTTP服务器入口
├── frontend/             # 前端服务
│   ├── app/              # 页面组件
│   ├── components/       # UI组件
│   ├── lib/              # 工具库
│   ├── services/         # API服务
│   ├── stores/           # 状态管理
│   └── types/            # TypeScript类型定义
├── test/                 # 测试文件
└── docker-compose.yml    # Docker部署配置
```

## 测试
项目包含完整的测试套件，覆盖认证、WebSocket、社交功能等。

```bash
# 运行测试
cd test
node auth-checkpoint-test.js
node websocket-connection-test.js
node social-core-flow-test.js
```

## 故障排除
如果在部署过程中遇到问题，请参考 [故障排除指南](TROUBLESHOOTING.md)。

## 文档
- [部署说明](DEPLOYMENT.md) - 详细的部署指南
- [GitHub部署指南](GITHUB_DEPLOYMENT.md) - 如何将代码推送到GitHub
- [测试报告](test/README.md) - 测试套件说明
- [API文档](test/api-endpoints-test.js) - API端点测试

## 许可证
MIT