# 部署到Vercel指南

## 概述
本文档详细说明了如何将优化的PWA应用部署到Vercel平台，特别针对华为手机进行了优化。

## 前置要求

### 1. 安装Vercel CLI
```bash
# 全局安装Vercel CLI
npm install -g vercel

# 验证安装
vercel --version
```

### 2. 登录Vercel账户
```bash
# 登录Vercel
vercel login

# 验证登录状态
vercel whoami
```

## 项目配置检查

### 1. 环境变量设置
在部署前，确保设置正确的环境变量：

```bash
# 在Vercel项目中设置环境变量
vercel env add NEXT_PUBLIC_API_URL production
vercel env add NEXT_PUBLIC_WS_URL production
```

输入相应的后端服务URL：
- `NEXT_PUBLIC_API_URL`: https://your-backend-service.com
- `NEXT_PUBLIC_WS_URL`: wss://your-backend-service.com

### 2. 配置文件验证
确保以下文件存在且配置正确：
- [frontend/next.config.js](file:///e:/MyWX/frontend/next.config.js) - Next.js配置
- [frontend/vercel.json](file:///e:/MyWX/frontend/vercel.json) - Vercel配置
- [frontend/public/manifest.json](file:///e:/MyWX/frontend/public/manifest.json) - PWA Manifest
- [frontend/public/sw.js](file:///e:/MyWX/frontend/public/sw.js) - Service Worker

## 部署步骤

### 1. 首次部署
```bash
# 进入前端目录
cd frontend

# 部署到Vercel
vercel

# 按提示操作：
# - Set up and deploy? Y
# - Which scope? 选择您的账户
# - Link to existing project? N (首次部署)
# - What's your project's name? chat-app-frontend
# - In which directory is your code located? ./
# - Want to override the settings? N
```

### 2. 生产环境部署
```bash
# 部署到生产环境
vercel --prod
```

### 3. 预览部署
```bash
# 创建预览部署
vercel
```

## 华为设备优化验证

### 1. PWA功能检查
部署完成后，验证以下PWA功能：
- [ ] 可以"添加到主屏幕"
- [ ] 桌面图标显示正常
- [ ] 启动画面正常显示
- [ ] 全屏模式无地址栏

### 2. 华为特调功能
- [ ] 华为浏览器显示正常
- [ ] EMUI系统状态栏适配
- [ ] 输入法弹出不影响布局
- [ ] 手势操作流畅

### 3. 核心功能验证
- [ ] 消息发送接收正常
- [ ] 朋友圈功能完整
- [ ] 图片上传显示正常
- [ ] 实时推送工作

## 性能优化检查

### 1. Lighthouse测试
使用Chrome DevTools的Lighthouse工具测试：
- PWA功能得分
- 性能得分
- 可访问性得分
- 最佳实践得分

### 2. 华为设备测试
在华为设备上验证：
- [ ] 加载时间 < 3秒
- [ ] 离线功能正常
- [ ] 推送通知显示正确
- [ ] 内存使用合理

## 域名配置

### 1. 添加自定义域名
```bash
# 添加自定义域名
vercel domains add your-domain.com
```

### 2. 配置DNS记录
按照Vercel提供的指示配置DNS记录：
- A记录指向Vercel的IP地址
- CNAME记录（如果使用子域名）

## 环境管理

### 1. 多环境部署
```bash
# 开发环境
vercel --target development

# 预生产环境
vercel --target staging

# 生产环境
vercel --prod
```

### 2. 环境变量管理
```bash
# 为不同环境设置变量
vercel env add VARIABLE_NAME development
vercel env add VARIABLE_NAME preview
vercel env add VARIABLE_NAME production
```

## 监控和分析

### 1. Vercel Analytics
- 实时访问统计
- 性能监控
- 地理位置分析

### 2. 错误跟踪
```bash
# 查看部署日志
vercel logs your-deployment-url.vercel.app

# 查看错误日志
vercel logs your-deployment-url.vercel.app --since 1h
```

## CI/CD集成

### 1. GitHub集成
1. 在Vercel项目设置中连接GitHub仓库
2. 启用自动部署
3. 配置预览环境

### 2. 自动化部署规则
```yaml
# 在GitHub Actions中部署
name: Deploy to Vercel
on:
  push:
    branches:
      - main
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        run: npx vercel --token $VERCEL_TOKEN --prod
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
```

## 故障排除

### 1. 构建失败
```bash
# 查看详细构建日志
vercel --debug

# 本地构建测试
cd frontend
npm run build
```

### 2. PWA功能异常
- 检查Service Worker注册
- 验证manifest.json配置
- 确认HTTPS配置

### 3. 华为设备兼容性
- 使用不同华为设备测试
- 检查控制台错误
- 验证资源加载

## 成本管理

### 1. 使用情况监控
```bash
# 查看使用情况
vercel usage
```

### 2. 优化建议
- 启用资源压缩
- 使用CDN缓存
- 优化图片资源

## 最佳实践

### 1. 部署策略
- 使用Git分支管理不同环境
- 启用自动部署
- 配置预览环境

### 2. 性能优化
- 启用Vercel Image Optimization
- 使用静态资源缓存
- 优化首屏加载

### 3. 安全配置
- 使用HTTPS
- 配置CORS
- 管理环境变量安全

## 常用命令

```bash
# 查看项目信息
vercel inspect

# 列出部署
vercel list

# 查看环境变量
vercel env list

# 添加环境变量
vercel env add KEY production

# 删除部署
vercel remove deployment-url

# 重新部署
vercel deploy --force
```

## 支持资源

- [Vercel官方文档](https://vercel.com/docs)
- [Next.js部署文档](https://nextjs.org/docs/deployment)
- [Vercel社区论坛](https://github.com/vercel/vercel/discussions)
- [华为PWA测试指南](./HUAWAI_PWA_COMPREHENSIVE_TESTING_GUIDE.md)

通过遵循本指南，您可以成功将优化的PWA应用部署到Vercel，并确保在华为设备上提供最佳用户体验。