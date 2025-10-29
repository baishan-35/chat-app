# API调用规范指南

## 1. 前端API调用规范

### 1.1 使用相对路径
在Next.js应用中，前端到后端API的调用应优先使用相对路径：

```javascript
// 正确的做法
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ email, password }),
});

// 错误的做法（避免硬编码绝对URL）
const response = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  // ...
});
```

### 1.2 API路由转发
前端API路由负责将请求转发到实际的后端服务：

```
前端请求 -> Next.js API路由 -> 后端服务
```

### 1.3 环境变量配置
后端服务URL应通过环境变量配置，避免在代码中硬编码：

```bash
# .env.local (开发环境)
BACKEND_URL=http://localhost:3009

# Vercel环境变量 (生产环境)
BACKEND_URL=https://your-backend-service.com
```

## 2. API路由实现规范

### 2.1 环境变量检查
API路由必须检查必要的环境变量是否已配置：

```javascript
// 正确的做法
const backendUrl = process.env.BACKEND_URL;
if (!backendUrl) {
  return NextResponse.json(
    { success: false, message: '后端服务URL未配置，请检查环境变量设置' },
    { status: 500, headers: corsHeaders }
  );
}

// 错误的做法（避免使用不安全的默认值）
const backendUrl = process.env.BACKEND_URL || 'http://localhost:3009';
```

### 2.2 请求转发
API路由应正确转发请求到后端服务：

```javascript
const backendApiUrl = `${backendUrl}/api/auth/login`;

const response = await fetch(backendApiUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(body),
});
```

## 3. 安全规范

### 3.1 HTTPS强制
所有生产环境的URL必须使用HTTPS协议：

```bash
# 正确的做法
BACKEND_URL=https://your-backend-service.com

# 错误的做法
BACKEND_URL=http://your-backend-service.com
```

### 3.2 敏感变量保护
敏感变量（如JWT_SECRET）应仅在部署平台中配置，不要硬编码在代码中：

```bash
# .env.local (开发环境)
JWT_SECRET=default_secret_key_for_development

# Vercel环境变量 (生产环境)
JWT_SECRET=your_strong_random_jwt_secret_key_at_least_32_characters
```

## 4. 错误处理

### 4.1 网络错误处理
API路由应正确处理网络错误：

```javascript
try {
  response = await fetch(backendApiUrl, fetchOptions);
} catch (fetchError) {
  console.error('转发请求失败:', fetchError);
  return NextResponse.json(
    { success: false, message: '无法连接到后端服务: ' + fetchError.message },
    { status: 500, headers: corsHeaders }
  );
}
```

### 4.2 响应错误处理
API路由应正确处理后端服务的错误响应：

```javascript
if (!response.ok) {
  // 转发后端服务的错误状态
  const errorData = await response.json();
  return NextResponse.json(
    { success: false, ...errorData },
    { status: response.status, headers: corsHeaders }
  );
}
```

## 5. 示例实现

### 5.1 前端调用
```javascript
// pages/login.js
const handleLogin = async () => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    
    if (response.ok) {
      // 处理成功响应
      console.log('登录成功', data);
    } else {
      // 处理错误响应
      console.error('登录失败', data);
    }
  } catch (error) {
    console.error('网络错误', error);
  }
};
```

### 5.2 API路由实现
```javascript
// app/api/auth/login/route.js
export async function POST(request) {
  try {
    // 解析请求体
    const body = await request.json();
    
    // 检查环境变量
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) {
      return NextResponse.json(
        { success: false, message: '后端服务URL未配置，请检查环境变量设置' },
        { status: 500, headers: corsHeaders }
      );
    }
    
    // 构造后端API URL
    const backendApiUrl = `${backendUrl}/api/auth/login`;
    
    // 转发请求到后端服务器
    const response = await fetch(backendApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    // 获取后端响应
    const data = await response.json();
    
    // 返回后端响应
    return NextResponse.json(data, {
      status: response.status,
      headers: corsHeaders
    });
  } catch (error) {
    console.error('登录API错误:', error);
    return NextResponse.json(
      { success: false, message: '服务器内部错误: ' + error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
```

## 6. 验证清单

在部署前，请检查以下项目：

- [ ] 前端API调用使用相对路径
- [ ] API路由正确检查环境变量
- [ ] 生产环境URL使用HTTPS协议
- [ ] 敏感变量仅在部署平台中配置
- [ ] 网络错误和响应错误得到正确处理
- [ ] 本地开发和生产环境都能正常工作