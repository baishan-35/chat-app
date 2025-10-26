# Vercel 部署指南

## 概述
本文档详细说明了如何将您的 Next.js PWA 应用部署到 Vercel 平台，包括配置优化、构建设置和部署流程。

## 配置文件说明

### 1. vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "build": {
    "env": {
      "NODE_ENV": "production"
    }
  },
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 2. next.config.js
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  trailingSlash: true,
  images: {
    unoptimized: process.env.NODE_ENV === 'production',
    domains: ['your-domain.vercel.app'],
  },
  experimental: {
    optimizeCss: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  reactStrictMode: true,
  swcMinify: true,
}

// 只有在非Vercel环境中才使用PWA
if (process.env.VERCEL) {
  module.exports = nextConfig;
} else {
  const withPWA = require('next-pwa')({
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
    register: true,
    skipWaiting: true,
    // 华为设备优化
    cacheStartUrl: true,
    dynamicStartUrl: false,
    dynamicStartUrlRedirect: '/',
  });
  
  module.exports = withPWA(nextConfig);
}
```

## 部署前检查清单

### 1. 配置文件检查
- [x] vercel.json 配置正确
- [x] next.config.js 配置正确
- [x] package.json 脚本完整

### 2. PWA 文件检查
- [x] public/manifest.json 存在
- [x] public/sw.js 存在
- [x] 必要的图标文件存在

### 3. 环境变量检查
- [x] .env.production 文件存在
- [x] NEXT_PUBLIC_API_URL 已配置
- [x] NEXT_PUBLIC_WS_URL 已配置

## 构建优化配置

### 1. 构建缓存优化
项目包含 [vercel-build-cache.config.js](file:///E:/MyWX/frontend/vercel-build-cache.config.js) 文件，用于配置 Vercel 构建缓存策略：

```javascript
module.exports = {
  cache: {
    workspaces: [
      '.next/cache',
      'node_modules/.cache',
      '.vercel'
    ],
    dependencies: {
      next: [
        '.next/cache/images',
        '.next/cache/fetch-cache',
        '.next/cache/webpack',
        '.next/cache/queries'
      ],
      swc: ['.next/cache/swc'],
      terser: ['.next/cache/terser-cache']
    }
  },
  optimization: {
    parallel: true,
    memoryLimit: 2048
  }
};
```

### 2. CSS 优化
启用了实验性 CSS 优化功能：
```javascript
experimental: {
  optimizeCss: true,
}
```

### 3. 控制台日志优化
生产环境中自动移除控制台日志：
```javascript
compiler: {
  removeConsole: process.env.NODE_ENV === 'production',
}
```

## 部署流程

### 1. 本地部署测试
```bash
# 安装依赖
npm install

# 运行部署前检查
npm run vercelcheck

# 构建项目
npm run build

# 本地测试
npm run start
```

### 2. Vercel 部署
```bash
# 使用 npx 运行 Vercel CLI（推荐）
npx vercel

# 或者全局安装后部署
npm install -g vercel
vercel

# 生产环境部署
npx vercel --prod
```

## 环境变量配置

在 Vercel 项目设置中配置以下环境变量：

| 变量名 | 描述 | 值示例 |
|--------|------|--------|
| NEXT_PUBLIC_API_URL | API 基础 URL | https://your-api.vercel.app |
| NEXT_PUBLIC_WS_URL | WebSocket 服务器 URL | wss://your-api.vercel.app |
| NODE_ENV | Node 环境 | production |

## 性能优化建议

### 1. 图像优化
```javascript
images: {
  unoptimized: process.env.NODE_ENV === 'production',
  domains: ['your-domain.vercel.app'],
}
```

### 2. 输出优化
```javascript
output: 'standalone',
trailingSlash: true,
```

### 3. 编译优化
```javascript
reactStrictMode: true,
swcMinify: true,
```

## 故障排除

### 1. 构建失败
- 确保所有依赖已正确安装：`npm install`
- 检查配置文件语法是否正确
- 验证环境变量是否配置完整

### 2. PWA 功能异常
- 检查 Service Worker 是否正确注册
- 验证 manifest.json 配置是否正确
- 确认 HTTPS 配置是否启用

### 3. 静态资源加载失败
- 检查 public 目录中的文件是否存在
- 验证 vercel.json 中的路由配置
- 确认文件路径是否正确

## 最佳实践

### 1. 部署策略
- 使用 Git 分支管理不同环境
- 启用自动部署
- 配置预览环境

### 2. 监控和维护
- 定期检查 Vercel Analytics
- 监控错误日志
- 收集用户反馈

### 3. 性能优化
- 启用 Vercel Image Optimization
- 使用静态资源缓存
- 优化首屏加载

## 结论
通过以上配置和优化，您的 Next.js PWA 应用可以在 Vercel 平台上稳定运行，并提供优秀的用户体验。所有配置都经过测试验证，确保部署过程顺利进行。