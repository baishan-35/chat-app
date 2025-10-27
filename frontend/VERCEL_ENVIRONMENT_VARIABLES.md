# Vercel环境变量配置指南

## 必需的环境变量

在Vercel项目Settings → Environment Variables中添加以下环境变量：

### 1. 基础环境变量

```
NODE_ENV=production
```

### 2. 前端环境变量

```
NEXT_PUBLIC_API_URL=https://your-app.vercel.app
NEXT_PUBLIC_WS_URL=wss://your-app.vercel.app
```

### 3. 后端服务变量

```
BACKEND_URL=https://your-backend-service.com
```

### 4. 安全相关变量

```
JWT_SECRET=your_strong_random_jwt_secret_key_at_least_32_characters
```

## 环境变量配置说明

### NODE_ENV
- **用途**: 指定运行环境
- **值**: `production`
- **说明**: 确保应用在生产模式下运行

### NEXT_PUBLIC_API_URL
- **用途**: 前端API基础URL
- **值**: `https://your-app.vercel.app`
- **说明**: 用于前端调用API的基地址

### NEXT_PUBLIC_WS_URL
- **用途**: WebSocket连接URL
- **值**: `wss://your-app.vercel.app`
- **说明**: 用于建立WebSocket连接

### BACKEND_URL
- **用途**: 后端服务URL
- **值**: `https://your-backend-service.com`
- **说明**: API路由转发请求的目标地址，必须使用HTTPS协议

### JWT_SECRET
- **用途**: JWT令牌签名密钥
- **值**: 强随机字符串，至少32个字符
- **说明**: 用于签名和验证JWT令牌，生产环境必须使用安全的随机字符串

## 配置步骤

1. 登录Vercel控制台
2. 进入您的项目
3. 点击"Settings"选项卡
4. 在左侧菜单中选择"Environment Variables"
5. 点击"Add"按钮添加每个环境变量
6. 保存配置
7. 重新部署项目以使配置生效

## 安全建议

1. **敏感变量保护**: 所有敏感变量（如JWT_SECRET）应仅在Vercel控制台中配置，不要硬编码在代码中
2. **HTTPS强制**: 所有URL必须使用HTTPS协议，避免Mixed Content安全错误
3. **密钥强度**: JWT_SECRET应使用至少32个字符的强随机字符串
4. **定期轮换**: 定期轮换安全密钥以提高安全性

## 验证配置

配置完成后，可以通过以下方式验证环境变量是否正确设置：

1. 检查Vercel部署日志中的环境变量加载情况
2. 在应用中添加环境变量检查页面进行验证
3. 测试API调用和WebSocket连接是否正常工作