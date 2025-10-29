# 修复登录时"Unexpected end of JSON input"错误

## 问题分析

在Vercel上测试登录时出现"Unexpected end of JSON input"错误，这通常表示服务器返回的不是有效的JSON格式数据。可能的原因包括：

1. API端点不存在或配置错误
2. 环境变量配置不正确导致API URL错误
3. 网络请求失败返回空响应
4. 服务器内部错误返回HTML页面而非JSON

## 根本原因

通过分析代码，发现以下问题：

1. **环境变量配置问题**：前端[.env.local](file:///e:/MyWX/frontend/.env.local)和[.env.production](file:///e:/MyWX/frontend/.env.production)文件中`NEXT_PUBLIC_API_URL`和`NEXT_PUBLIC_WS_URL`都设置为空值
2. **API代理配置缺失**：[next.config.js](file:///e:/MyWX/frontend/next.config.js)中没有配置API代理
3. **Vercel重写规则问题**：[vercel.json](file:///e:/MyWX/frontend/vercel.json)中的重写规则可能导致请求处理异常

## 修复方案

### 1. 修复环境变量配置

修改[frontend/.env.local](file:///e:/MyWX/frontend/.env.local)文件：

```env
# API基础URL - 使用相对路径以支持PWA
NEXT_PUBLIC_API_URL=

# WebSocket服务器URL - 使用相对路径以支持PWA
NEXT_PUBLIC_WS_URL=

# JWT密钥（开发环境使用默认值）
JWT_SECRET=default_secret_key_for_development
```

修改[frontend/.env.production](file:///e:/MyWX/frontend/.env.production)文件：

```env
# 生产环境变量配置文件
# 注意：此文件不应提交到版本控制系统中

# API基础URL (生产环境应使用相对路径或域名)
NEXT_PUBLIC_API_URL=

# WebSocket服务器URL (生产环境应使用相对路径或域名)
NEXT_PUBLIC_WS_URL=

# JWT密钥（生产环境必须使用强随机字符串，至少32字符）
JWT_SECRET=
```

### 2. 修复Next.js配置

修改[frontend/next.config.js](file:///e:/MyWX/frontend/next.config.js)文件，添加API代理配置：

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
  
  // 添加API代理配置
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*'
      }
    ];
  }
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

### 3. 修复Vercel配置

修改[frontend/vercel.json](file:///e:/MyWX/frontend/vercel.json)文件：

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
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    },
    {
      "source": "/(.*)",
      "destination": "/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 4. 增强前端错误处理

修改[frontend/app/test-login/page.tsx](file:///e:/MyWX/frontend/app/test-login/page.tsx)文件，增强错误处理：

```javascript
const handleLogin = async () => {
  try {
    setIsLoading(true);
    
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    // 检查响应状态
    if (!response.ok) {
      setResult({
        error: `HTTP错误: ${response.status}`,
        status: response.status,
        statusText: response.statusText
      });
      return;
    }

    // 检查响应内容类型
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      setResult({
        error: "服务器返回非JSON响应",
        contentType: contentType,
        responseText: text
      });
      return;
    }

    const data = await response.json();
    setResult(data);

    if (response.ok) {
      // 更新认证状态
      login(data.data.user, data.data.accessToken);
      
      // 等待一小段时间确保状态保存到localStorage
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 跳转到仪表板
      router.push("/dashboard");
    }
  } catch (error: any) {
    console.error("登录错误:", error);
    setResult({ 
      error: error.message,
      type: "network_error"
    });
  } finally {
    setIsLoading(false);
  }
};
```

### 5. 在Vercel中配置环境变量

在Vercel项目设置中添加以下环境变量：

1. `NEXT_PUBLIC_API_URL` = `https://your-backend-service.com`
2. `NEXT_PUBLIC_WS_URL` = `wss://your-backend-service.com`
3. `JWT_SECRET` = `your-strong-secret-key`

## 验证修复

1. 重新部署前端到Vercel
2. 访问测试登录页面
3. 查看控制台输出的详细错误信息
4. 检查网络面板中的请求和响应

## 预防措施

1. 在所有fetch调用中添加适当的错误处理
2. 验证响应内容类型
3. 提供用户友好的错误信息
4. 记录详细的错误日志用于调试