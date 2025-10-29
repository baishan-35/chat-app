# Vercel部署步骤指南

## 1. 后端服务部署

在Vercel上部署前端应用之前，需要先部署后端服务。由于Vercel不支持WebSocket，后端服务需要部署到支持WebSocket的平台。

### 推荐部署平台
1. **Railway** (推荐)
   - 原生WebSocket支持
   - 简单的部署流程
   - 免费额度充足

2. **Heroku**
   - 成熟的平台
   - WebSocket支持

3. **自建服务器**
   - 完全控制
   - 需要维护和安全配置

### Railway部署步骤
1. 注册Railway账户
2. 创建新项目
3. 连接Git仓库
4. 配置环境变量：
   ```
   JWT_SECRET=your_strong_random_jwt_secret_key_at_least_32_characters
   DATABASE_URL=your_database_connection_string (如果使用数据库)
   ```

## 2. Vercel环境变量设置

### 登录Vercel控制台
1. 访问 https://vercel.com
2. 使用您的GitHub账户登录

### 进入项目设置
1. 在Vercel仪表板中找到您的项目
2. 点击项目名称进入项目详情页
3. 点击顶部的"Settings"选项卡

### 设置环境变量
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

### 环境变量配置说明
1. **NEXT_PUBLIC_API_URL**: 您的Vercel应用URL，用于前端API调用
2. **NEXT_PUBLIC_WS_URL**: WebSocket连接URL（在Vercel上将使用轮询替代WebSocket）
3. **BACKEND_URL**: 您部署后端服务的URL
4. **JWT_SECRET**: 用于JWT令牌签名的强随机字符串

## 3. 部署应用

### 首次部署
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

### 后续部署
```bash
# 部署到开发环境
vercel

# 部署到生产环境
vercel --prod
```

## 4. 验证部署

### 检查部署状态
```bash
# 查看部署列表
vercel list

# 查看部署日志
vercel logs <deployment-url>
```

### 验证环境变量
在部署完成后，可以通过以下方式验证环境变量是否正确设置：
1. 检查Vercel部署日志中的环境变量加载情况
2. 在应用中添加环境变量检查页面进行验证
3. 测试API调用和实时通信功能是否正常工作

## 5. 故障排除

### 常见问题
1. **405错误**: 确保使用了轮询替代WebSocket
2. **环境变量未生效**: 重新部署项目以使配置生效
3. **API调用失败**: 检查BACKEND_URL是否正确配置
4. **认证失败**: 检查JWT_SECRET是否正确配置

### 调试步骤
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