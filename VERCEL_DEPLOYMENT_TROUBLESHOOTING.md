# Vercel部署故障排除指南

## 常见问题及解决方案

### 1. 配置冲突错误
**错误信息：** `Error: If 'rewrites', 'redirects', 'headers', 'cleanUrls' or 'trailingSlash' are used, then 'routes' cannot be present.`

**原因：** Vercel配置中同时使用了`routes`和`headers`/`rewrites`等属性，这是不允许的。

**解决方案：**
1. 打开[vercel.json](file:///e:/MyWX/frontend/vercel.json)文件
2. 移除`routes`数组
3. 使用`rewrites`数组替代`routes`功能
4. 重新部署

### 2. 没有生成预览URL
**问题描述：** 部署完成后没有显示预览URL

**可能原因及解决方案：**

#### 原因1：构建失败
- 检查终端输出是否有错误信息
- 运行`npm run build`本地测试构建
- 修复构建错误后重新部署

#### 原因2：配置错误
- 检查[vercel.json](file:///e:/MyWX/frontend/vercel.json)配置是否正确
- 确保没有语法错误
- 验证路由配置

#### 原因3：权限问题
- 确保已正确登录Vercel账户
- 运行`vercel whoami`验证登录状态
- 必要时重新登录：`vercel login`

### 3. API路由问题
**问题描述：** API请求无法正确路由到后端服务

**解决方案：**
1. 检查Vercel配置中的重写规则
2. 确保环境变量已正确设置
3. 验证后端服务URL是否正确

### 4. PWA功能异常
**问题描述：** Service Worker未注册或缓存不工作

**解决方案：**
1. 检查[sw.js](file:///e:/MyWX/frontend/public/sw.js)文件是否存在且配置正确
2. 验证manifest.json配置
3. 确保应用通过HTTPS访问
4. 检查浏览器控制台是否有相关错误

## 部署检查清单

### 预部署检查
- [ ] 确认所有代码已提交到Git
- [ ] 验证[next.config.js](file:///e:/MyWX/frontend/next.config.js)配置正确
- [ ] 检查[vercel.json](file:///e:/MyWX/frontend/vercel.json)配置无冲突
- [ ] 确认环境变量已设置
- [ ] 本地测试构建通过：`npm run build`

### 部署过程检查
- [ ] 使用正确的Vercel账户登录
- [ ] 选择正确的项目作用域
- [ ] 确认项目名称和目录设置
- [ ] 检查部署日志是否有错误

### 部署后验证
- [ ] 访问部署URL验证应用正常运行
- [ ] 测试PWA功能（安装、离线等）
- [ ] 验证API请求正常工作
- [ ] 检查华为设备上的表现

## 命令行工具使用

### 常用Vercel CLI命令
```bash
# 登录Vercel
vercel login

# 查看当前登录用户
vercel whoami

# 部署到开发环境
vercel

# 部署到生产环境
vercel --prod

# 查看部署列表
vercel list

# 查看部署日志
vercel logs <deployment-url>

# 查看环境变量
vercel env list

# 添加环境变量
vercel env add <key> <environment>
```

### 本地开发测试
```bash
# 本地开发服务器
npm run dev

# 本地构建测试
npm run build

# 本地启动生产版本
npm run start
```

## 环境变量配置

### 设置环境变量
```bash
# 在Vercel项目中添加环境变量
vercel env add NEXT_PUBLIC_API_URL production
vercel env add NEXT_PUBLIC_WS_URL production
```

### 环境变量值示例
```bash
# 后端API URL
NEXT_PUBLIC_API_URL=https://your-backend-service.com

# WebSocket URL
NEXT_PUBLIC_WS_URL=wss://your-backend-service.com
```

## 性能优化建议

### 1. 图片优化
使用Next.js内置图片优化：
```jsx
import Image from 'next/image';

<Image
  src="/path/to/image.jpg"
  alt="描述"
  width={800}
  height={600}
  quality={85}
/>
```

### 2. 静态资源缓存
在[vercel.json](file:///e:/MyWX/frontend/vercel.json)中配置缓存头：
```json
{
  "headers": [
    {
      "source": "/icons/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

## 华为设备特定优化

### 1. Service Worker优化
确保Service Worker针对华为设备进行了优化：
- 减少缓存大小
- 优化推送通知
- 处理后台同步

### 2. 触摸交互优化
- 确保按钮最小44x44px
- 优化滑动操作
- 处理输入法遮挡

### 3. 兼容性测试
- 在不同华为设备上测试
- 验证EMUI系统适配
- 检查华为浏览器兼容性

## 获取帮助

### 1. Vercel官方资源
- [Vercel文档](https://vercel.com/docs)
- [Vercel社区](https://github.com/vercel/vercel/discussions)
- [Vercel状态页面](https://www.vercel-status.com/)

### 2. 项目相关文档
- [Vercel PWA部署优化方案](./VERCEL_PWA_DEPLOYMENT_OPTIMIZATION.md)
- [部署到Vercel指南](./DEPLOY_TO_VERCEL.md)
- [华为PWA综合测试指南](./HUAWAI_PWA_COMPREHENSIVE_TESTING_GUIDE.md)

### 3. 技术支持
如果问题仍然存在，请提供以下信息：
1. 完整的错误日志
2. 部署命令和输出
3. 相关配置文件内容
4. 测试环境信息

通过遵循本指南，您应该能够解决大部分Vercel部署问题，并成功将应用部署到生产环境。