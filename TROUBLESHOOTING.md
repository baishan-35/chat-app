# Docker部署故障排除指南

## 常见问题及解决方案

### 1. "unexpected end of JSON input" 错误

**问题描述**:
```
unable to get image 'mywx-backend': unexpected end of JSON input
```

**可能原因**:
1. Docker daemon未正常运行
2. Docker Desktop服务异常
3. Docker配置文件损坏
4. 网络连接问题导致镜像拉取失败

**解决方案**:

#### 方案1: 重启Docker Desktop
1. 在系统托盘中右键点击Docker Desktop图标
2. 选择"Restart Docker Desktop"
3. 等待Docker Desktop完全重启后再次尝试

#### 方案2: 完全重启Docker Desktop
1. 在系统托盘中右键点击Docker Desktop图标
2. 选择"Quit Docker Desktop"
3. 从开始菜单重新启动Docker Desktop
4. 等待Docker Desktop完全启动后再次尝试

#### 方案3: 重置Docker Desktop
1. 打开Docker Desktop
2. 点击设置图标（齿轮图标）
3. 选择"Reset"选项卡
4. 点击"Reset to factory defaults"
5. 确认重置操作
6. 等待重置完成后重新启动Docker Desktop

### 2. Docker daemon无法启动

**问题描述**:
```
Error response from daemon: Docker Desktop is unable to start
```

**解决方案**:

#### 方案1: 检查系统资源
1. 确保系统有足够的内存和CPU资源
2. 关闭不必要的应用程序以释放资源
3. 在Docker Desktop设置中调整资源分配

#### 方案2: 以管理员身份运行
1. 关闭Docker Desktop
2. 右键点击Docker Desktop图标
3. 选择"以管理员身份运行"

#### 方案3: 检查Windows功能
1. 打开"控制面板" → "程序" → "启用或关闭Windows功能"
2. 确保"Hyper-V"已启用
3. 确保"容器"已启用
4. 重启计算机

### 3. 镜像构建失败

**问题描述**:
构建过程中出现各种错误

**解决方案**:

#### 方案1: 清理Docker缓存
```bash
# 清理构建缓存
docker builder prune

# 清理所有资源
docker system prune -a
```

#### 方案2: 检查Dockerfile语法
1. 确保Dockerfile没有语法错误
2. 确保所有COPY命令的路径正确
3. 确保所有RUN命令能够成功执行

#### 方案3: 分步构建
```bash
# 单独构建每个服务
docker-compose build postgres
docker-compose build backend
docker-compose build frontend

# 然后启动服务
docker-compose up -d
```

### 4. 端口冲突

**问题描述**:
```
port is already allocated
```

**解决方案**:

#### 方案1: 检查端口占用
```bash
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :3001
netstat -ano | findstr :3007
netstat -ano | findstr :5432
```

#### 方案2: 更改端口映射
在docker-compose.yml中修改端口映射：
```yaml
ports:
  - "3001:3001"  # 更改为 "3001:3001" 或其他可用端口
```

### 5. 数据库连接失败

**问题描述**:
后端服务无法连接到数据库

**解决方案**:

#### 方案1: 检查数据库服务状态
```bash
# 查看数据库服务日志
docker-compose logs postgres

# 检查数据库是否正在运行
docker-compose ps
```

#### 方案2: 验证数据库连接信息
1. 确保DATABASE_URL环境变量正确
2. 确保数据库服务在后端服务之前启动
3. 检查网络连接

### 6. 前端无法访问后端API

**问题描述**:
前端应用无法与后端服务通信

**解决方案**:

#### 方案1: 检查环境变量
确保前端环境变量正确设置：
```bash
NEXT_PUBLIC_API_URL=http://backend:3007
NEXT_PUBLIC_WS_URL=ws://backend:3001
```

#### 方案2: 检查Docker网络
```bash
# 查看Docker网络
docker network ls

# 检查容器是否在同一网络中
docker-compose ps
```

## 调试命令

### 查看服务状态
```bash
# 查看所有服务
docker-compose ps

# 查看特定服务
docker-compose ps backend
```

### 查看日志
```bash
# 查看所有服务日志
docker-compose logs

# 查看特定服务日志
docker-compose logs backend

# 实时查看日志
docker-compose logs -f
```

### 进入容器
```bash
# 进入后端容器
docker exec -it chat_backend sh

# 进入前端容器
docker exec -it chat_frontend sh

# 进入数据库容器
docker exec -it chat_postgres psql -U chatuser -d chatapp
```

## 手动部署替代方案

如果Docker部署持续出现问题，可以考虑手动部署：

### 后端部署
```bash
# 1. 启动数据库（使用Docker）
docker-compose up -d postgres

# 2. 安装后端依赖
cd backend
npm install

# 3. 运行数据库迁移
npx prisma db push

# 4. 启动后端服务
npm start
```

### 前端部署
```bash
# 1. 安装前端依赖
cd frontend
npm install

# 2. 构建前端应用
npm run build

# 3. 启动前端服务
npm start
```

## 联系支持

如果以上解决方案都无法解决问题，请：

1. 提供完整的错误日志
2. 提供Docker和Docker Compose版本信息
3. 提供操作系统版本信息
4. 联系技术支持团队