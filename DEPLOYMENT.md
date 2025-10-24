# 部署说明

## 概述
本文档详细说明了如何使用Docker Compose部署微信项目。

## 目录结构
```
.
├── backend/              # 后端服务
│   ├── Dockerfile        # 后端Docker配置
│   ├── package.json      # 后端依赖配置
│   ├── server.js         # HTTP服务器入口
│   ├── prisma/           # Prisma数据库配置
│   └── src/websocket/    # WebSocket服务器
│       └── server.js     # WebSocket服务器入口
├── frontend/             # 前端服务
│   ├── Dockerfile        # 前端Docker配置
│   ├── package.json      # 前端依赖配置
│   └── next.config.js    # Next.js配置
├── docker-compose.yml    # Docker Compose配置
└── README.md             # 项目说明
```

## 端口配置

| 服务 | 容器内端口 | 映射端口 | 说明 |
|------|------------|----------|------|
| PostgreSQL | 5432 | 5432 | 数据库服务 |
| Backend HTTP | 3007 | 3007 | REST API服务 |
| Backend WebSocket | 3001 | 3001 | 实时通信服务 |
| Frontend | 3000 | 3000 | Web前端服务 |

## 环境变量

### 后端环境变量
```bash
NODE_ENV=production
DATABASE_URL=postgresql://chatuser:mychatpassword123@postgres:5432/chatapp?schema=public
JWT_SECRET=my-super-secret-jwt-key-for-chat-app
PORT=3007
FRONTEND_URL=http://localhost:3000
```

### 前端环境变量
```bash
NODE_ENV=production
NEXT_PUBLIC_API_URL=http://backend:3007
NEXT_PUBLIC_WS_URL=ws://backend:3001
```

## 部署步骤

### 1. 安装Docker
确保已安装Docker和Docker Compose：
```bash
# 检查Docker版本
docker --version
docker-compose --version
```

### 2. 构建和启动服务
```bash
# 克隆项目（如果尚未克隆）
git clone <repository-url>
cd <project-directory>

# 使用Docker Compose启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps
```

### 3. 数据库迁移（首次部署）
Dockerfile中已包含自动数据库迁移，但您也可以手动执行：
```bash
# 进入后端容器
docker exec -it chat_backend sh

# 运行数据库迁移
npm run db:push

# 或者运行特定迁移
npm run db:migrate

# 退出容器
exit
```

### 4. 访问应用
- 前端界面: http://localhost:3000
- 后端API: http://localhost:3007
- WebSocket: ws://localhost:3001
- 数据库: postgresql://chatuser:mychatpassword123@localhost:5432/chatapp

## 管理命令

### 查看日志
```bash
# 查看所有服务日志
docker-compose logs

# 查看特定服务日志
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres
```

### 停止服务
```bash
# 停止所有服务
docker-compose stop

# 停止并删除容器
docker-compose down

# 停止并删除容器及数据卷
docker-compose down -v
```

### 重启服务
```bash
# 重启所有服务
docker-compose restart

# 重启特定服务
docker-compose restart backend
```

## 数据持久化

### PostgreSQL数据
PostgreSQL数据存储在命名卷`postgres_data`中，即使容器被删除，数据也会保留。

### 文件上传
后端的上传文件目录`/app/uploads`被挂载到宿主机，确保文件在容器重启后仍然存在。

## 故障排除

### 常见问题

1. **端口冲突**
   ```bash
   # 检查端口占用
   netstat -tulpn | grep :3000
   netstat -tulpn | grep :3001
   netstat -tulpn | grep :3007
   netstat -tulpn | grep :5432
   ```

2. **数据库连接失败**
   ```bash
   # 检查数据库服务状态
   docker-compose logs postgres
   
   # 测试数据库连接
   docker exec -it chat_postgres psql -U chatuser -d chatapp
   ```

3. **后端服务无法启动**
   ```bash
   # 查看后端日志
   docker-compose logs backend
   
   # 检查环境变量
   docker exec -it chat_backend env
   ```

4. **前端服务无法访问API**
   ```bash
   # 检查前端日志
   docker-compose logs frontend
   
   # 测试后端API连接
   curl http://localhost:3007/health
   ```

### 重建服务
```bash
# 重建所有服务
docker-compose up -d --build

# 重建特定服务
docker-compose build backend
docker-compose up -d backend
```

## 安全建议

1. **生产环境密码**
   - 更改默认的数据库密码
   - 使用强随机字符串作为JWT密钥
   - 不要在代码中硬编码敏感信息

2. **HTTPS配置**
   - 在生产环境中使用HTTPS
   - 配置SSL证书

3. **访问控制**
   - 限制对数据库端口的外部访问
   - 使用防火墙规则

## 监控和维护

### 健康检查
```bash
# 后端健康检查
curl http://localhost:3007/health

# 数据库连接检查
docker exec -it chat_postgres pg_isready -U chatuser -d chatapp
```

### 备份和恢复
```bash
# 备份数据库
docker exec -t chat_postgres pg_dump -U chatuser -d chatapp > backup.sql

# 恢复数据库
docker exec -i chat_postgres psql -U chatuser -d chatapp < backup.sql
```

## 扩展部署

### 负载均衡
对于高可用部署，可以使用Nginx或负载均衡器分发请求。

### 环境分离
为开发、测试和生产环境创建不同的docker-compose文件：
- docker-compose.yml (基础配置)
- docker-compose.dev.yml (开发环境)
- docker-compose.prod.yml (生产环境)

使用以下命令启动特定环境：
```bash
# 开发环境
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# 生产环境
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```