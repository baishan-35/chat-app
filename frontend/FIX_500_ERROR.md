# HTTP 500错误修复方案

## 问题分析
HTTP 500错误表示服务器内部错误。在当前配置中，问题出在Vercel环境变量配置上：
- `BACKEND_URL`被设置为占位符值`https://your-backend-service.com`
- 这导致API路由无法连接到实际的后端服务

## 解决方案

### 1. 部署后端服务
首先，需要将后端服务部署到支持WebSocket的平台，如Railway：

1. 访问 https://railway.app 注册账户
2. 创建新项目
3. 连接Git仓库或直接部署代码
4. 配置环境变量：
   ```
   JWT_SECRET=your_strong_random_jwt_secret_key_at_least_32_characters
   DATABASE_URL=your_database_connection_string (如果使用数据库)
   PORT=3000
   ```

### 2. 更新Vercel环境变量
在Vercel项目设置中更新环境变量：

1. 登录Vercel控制台
2. 进入项目设置
3. 选择"Environment Variables"
4. 更新以下变量：
   ```
   BACKEND_URL = https://your-actual-backend-service-url.up.railway.app
   ```

### 3. 重新部署应用
更新环境变量后，重新部署应用以使更改生效：
```bash
cd frontend
npx vercel --prod
```

## 验证修复
1. 访问部署的URL
2. 尝试登录功能
3. 检查网络面板中的API请求响应

## 预防措施
1. 在部署前验证所有环境变量
2. 使用真实的URL而不是占位符
3. 定期检查后端服务的可用性