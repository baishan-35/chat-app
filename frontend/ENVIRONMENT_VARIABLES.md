# 环境变量配置说明

## 环境变量文件

项目使用以下环境变量文件：

- `.env.example` - 示例环境变量文件（可提交到版本控制）
- `.env.local` - 本地开发环境变量（不应提交到版本控制）
- `.env.production` - 生产环境变量（不应提交到版本控制）

## 必需的环境变量

### 前端环境变量

| 变量名 | 描述 | 是否必需 | 默认值 |
|--------|------|----------|--------|
| NEXT_PUBLIC_API_URL | API基础URL | 否 | 相对于当前域名 |
| NEXT_PUBLIC_WS_URL | WebSocket服务器URL | 否 | 相对于当前域名 |

### 后端环境变量

| 变量名 | 描述 | 是否必需 | 默认值 |
|--------|------|----------|--------|
| JWT_SECRET | JWT签名密钥 | 是（生产环境） | 开发环境默认值 |

## 配置说明

### 开发环境配置

在本地开发时，创建 `.env.local` 文件并添加必要的环境变量：

```env
# 本地开发API URL（如果API服务运行在不同端口）
NEXT_PUBLIC_API_URL=http://localhost:3001

# 本地开发WebSocket URL（如果WebSocket服务运行在不同端口）
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

### 生产环境配置

在Vercel等平台部署时，通过平台的环境变量设置功能配置：

1. `NEXT_PUBLIC_API_URL` - 如果API服务部署在不同域名
2. `NEXT_PUBLIC_WS_URL` - 如果WebSocket服务部署在不同域名
3. `JWT_SECRET` - 强随机字符串，用于JWT签名验证

## 安全注意事项

1. 永远不要在代码中硬编码敏感信息
2. 敏感环境变量应通过部署平台配置，而不是存储在文件中
3. `.env.local` 和 `.env.production` 文件应添加到 `.gitignore` 中
4. 生产环境必须设置 `JWT_SECRET` 环境变量