# 完整Vercel部署指南

## 概述
本指南将帮助您在Vercel上成功部署应用，并正确配置环境变量以确保后端服务可访问。

## 1. 后端服务部署

由于Vercel不支持WebSocket，我们需要将后端服务部署到支持WebSocket的平台。

### 1.1 选择部署平台
推荐的部署平台：
1. **Railway** (推荐) - 原生WebSocket支持
2. **Heroku** - 成熟的平台，支持WebSocket
3. **自建服务器** - 完全控制，需要维护

### 1.2 Railway部署步骤
1. 访问 https://railway.app 注册账户
2. 创建新项目
3. 连接Git仓库或直接部署代码
4. 配置环境变量：
   ```
   JWT_SECRET=your_strong_random_jwt_secret_key_at_least_32_characters
   DATABASE_URL=your_database_connection_string (如果使用数据库)
   PORT=3000
   ```

### 1.3 获取后端服务URL
部署完成后，Railway会提供一个URL，例如：
```
https://your-project-production.up.railway.app
```

记下这个URL，稍后在Vercel环境变量中会用到。

## 2. Vercel环境变量设置

### 2.1 登录Vercel控制台
1. 访问 https://vercel.com
2. 使用您的GitHub账户登录

### 2.2 进入项目设置
1. 在Vercel仪表板中找到您的项目
2. 点击项目名称进入项目详情页
3. 点击顶部的"Settings"选项卡

### 2.3 设置环境变量
在"Settings"页面的左侧菜单中选择"Environment Variables"，然后添加以下变量：

#### 基础环境变量
```
NODE_ENV = production
```

#### 前端环境变量
```
NEXT_PUBLIC_API_URL = https://your-app.vercel.app
NEXT_PUBLIC_WS_URL = wss://your-app.vercel.app
NEXT_PUBLIC_VERCEL_ENV = production
```

#### 后端服务变量
```
BACKEND_URL = https://your-backend-service.com
```

#### 安全相关变量
```
JWT_SECRET = your_strong_random_jwt_secret_key_at_least_32_characters
```

### 2.4 环境变量配置说明
1. **NEXT_PUBLIC_API_URL**: 您的Vercel应用URL，用于前端API调用
2. **NEXT_PUBLIC_WS_URL**: WebSocket连接URL（在Vercel上将使用轮询替代WebSocket）
3. **BACKEND_URL**: 您部署后端服务的URL（步骤1.3中获取的URL）
4. **JWT_SECRET**: 用于JWT令牌签名的强随机字符串

## 3. 部署应用

### 3.1 首次部署
如果这是您第一次部署应用：
```bash
# 安装Vercel CLI
npm install -g vercel

# 登录Vercel
vercel login

# 部署到开发环境
vercel

# 部署到生产环境
vercel --prod
```

### 3.2 后续部署
```bash
# 部署到开发环境
vercel

# 部署到生产环境
vercel --prod
```

## 4. 验证部署

### 4.1 检查部署状态
```bash
# 查看部署列表
vercel list

# 查看部署日志
vercel logs <deployment-url>
```

### 4.2 验证环境变量
访问您的应用中的环境变量检查页面：
```
https://your-app.vercel.app/env-check
```

### 4.3 测试功能
1. 访问登录页面测试认证功能
2. 访问聊天页面测试实时通信功能
3. 访问WebSocket测试页面（开发环境）或轮询测试页面（Vercel环境）

## 5. 故障排除

### 5.1 常见问题
1. **405错误**: 确保使用了轮询替代WebSocket
2. **环境变量未生效**: 重新部署项目以使配置生效
3. **API调用失败**: 检查BACKEND_URL是否正确配置
4. **认证失败**: 检查JWT_SECRET是否正确配置

### 5.2 调试步骤
1. 检查Vercel部署日志
2. 在应用中添加调试页面检查环境变量
3. 测试后端服务是否可访问
4. 验证WebSocket/轮询连接

## 6. 安全建议

1. **敏感变量保护**: 所有敏感变量（如JWT_SECRET）应仅在Vercel控制台中配置
2. **HTTPS强制**: 所有URL必须使用HTTPS协议
3. **密钥强度**: JWT_SECRET应使用至少32个字符的强随机字符串
4. **定期轮换**: 定期轮换安全密钥以提高安全性

## 7. 性能优化

1. **图片优化**: 使用Next.js内置图片优化功能
2. **静态资源缓存**: 在vercel.json中配置缓存头
3. **代码分割**: 使用动态导入优化加载性能
4. **服务端渲染**: 利用Next.js SSR提高首屏加载速度

## 8. 示例配置

### 8.1 vercel.json
```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["hkg1"],
  "env": {
    "NODE_ENV": "production",
    "BACKEND_URL": "https://your-backend-service.com",
    "NEXT_PUBLIC_VERCEL_ENV": "production",
    "NEXT_PUBLIC_API_URL": "https://your-app.vercel.app",
    "NEXT_PUBLIC_WS_URL": "wss://your-app.vercel.app",
    "JWT_SECRET": "your_strong_random_jwt_secret_key_at_least_32_characters"
  }
}
```

### 8.2 .env.production
```bash
# 生产环境变量配置文件
# 注意：此文件不应提交到版本控制系统中

# API基础URL (生产环境应使用相对路径或域名)
NEXT_PUBLIC_API_URL=https://your-app.vercel.app

# WebSocket服务器URL (生产环境应使用相对路径或域名)
NEXT_PUBLIC_WS_URL=wss://your-app.vercel.app

# 后端服务URL (生产环境应该通过Vercel环境变量配置)
BACKEND_URL=https://your-backend-service.com

# JWT密钥（生产环境必须使用强随机字符串，至少32字符）
JWT_SECRET=your_strong_production_secret_key_here_at_least_32_characters

# Vercel环境标识
NEXT_PUBLIC_VERCEL_ENV=production

# 其他生产环境特定变量可以在这里添加
```

## 9. 验证清单

在完成部署后，请检查以下项目：

- [ ] 后端服务已在支持WebSocket的平台部署
- [ ] 已在Vercel中设置所有必需的环境变量
- [ ] BACKEND_URL指向正确的后端服务URL
- [ ] JWT_SECRET已设置为强随机字符串
- [ ] 应用已重新部署以使环境变量生效
- [ ] 登录功能正常工作
- [ ] 聊天功能在开发环境中使用WebSocket正常工作
- [ ] 聊天功能在Vercel环境中使用轮询正常工作
- [ ] 环境变量检查页面显示正确的配置

完成以上步骤后，您的应用应该能够在Vercel上正常运行，并且后端服务可访问。