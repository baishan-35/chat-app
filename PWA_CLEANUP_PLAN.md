# PWA清理计划

## 第一步：识别并移除冲突配置

### 1. Docker相关文件清理
- [x] docker-compose.yml
- [x] backend/Dockerfile
- [x] frontend/Dockerfile

### 2. 平台特定环境变量清理
- [x] 检查并移除Vercel特定配置
- [x] 检查并移除Railway特定配置
- [x] 检查并移除Netlify特定配置

### 3. 服务器渲染配置检查
- [x] 检查Next.js配置中的SSG/SSR设置
- [x] 确保PWA兼容性

### 4. 部署脚本清理
- [x] backend/start.js (保留，但确认不影响PWA)

## 第二步：简化环境配置

### 1. 环境变量统一
- [x] 合并生产/开发环境变量
- [x] 确保所有API调用使用相对路径
- [x] 移除平台特定优化配置

## 第三步：验证核心功能

### 1. 功能验证清单
- [ ] 聊天功能正常工作
- [ ] 实时消息不受影响
- [ ] 用户认证流程完整

## 详细清理步骤

### 1. 移除Docker相关文件
```bash
# 移除Docker编排文件
rm docker-compose.yml

# 移除后端Dockerfile
rm backend/Dockerfile

# 移除前端Dockerfile
rm frontend/Dockerfile
```

### 2. 检查平台特定配置
```bash
# 检查是否存在Vercel配置
find . -name "vercel.json"

# 检查是否存在Railway配置
find . -name "railway.toml"

# 检查是否存在Netlify配置
find . -name "netlify.toml"
```

### 3. 简化Next.js配置
```bash
# 更新Next.js配置以更好地支持PWA
# 确保API代理使用相对路径
```

### 4. 环境变量优化
```bash
# 确保环境变量配置适合移动端
# 移除不必要的平台特定配置
```

## 已完成的清理工作

### 1. 移除Docker相关文件
- [x] 删除 `docker-compose.yml`
- [x] 删除 `backend/Dockerfile`
- [x] 删除 `frontend/Dockerfile`

### 2. 更新环境变量配置
- [x] 更新 `.env.local` 使用相对路径
- [x] 更新 `next.config.js` API代理配置
- [x] 更新 `lib/websocket.js` WebSocket配置

### 3. 确认API调用使用相对路径
- [x] `services/socialService.ts` 已使用相对路径
- [x] `lib/auth.ts` 已使用相对路径
- [x] `(auth)/login/page.tsx` 已使用相对路径

## 待验证功能

### 1. 聊天功能测试
- [ ] WebSocket连接正常
- [ ] 消息发送和接收正常
- [ ] 心跳检测正常工作

### 2. 用户认证测试
- [ ] 登录功能正常
- [ ] 登出功能正常
- [ ] 用户状态保持正常

### 3. PWA功能测试
- [ ] 应用可安装
- [ ] 离线功能正常
- [ ] 推送通知正常