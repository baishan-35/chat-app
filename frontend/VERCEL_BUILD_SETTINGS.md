# Vercel构建设置优化指南

## 构建配置

在Vercel项目Settings → General中配置以下设置：

### Framework Preset
- **值**: `Next.js`
- **说明**: 指定项目使用Next.js框架

### Build Command
- **值**: `npm run build`
- **说明**: 使用Next.js的构建命令

### Output Directory
- **值**: `.next`
- **说明**: 指定构建输出目录

### Install Command
- **值**: `npm install`
- **说明**: 指定依赖安装命令

### Development Command
- **值**: `npm run dev`
- **说明**: 指定开发环境启动命令

## 构建优化设置

### Regions
在vercel.json中配置：
```json
{
  "regions": ["hkg1"]
}
```
- **说明**: 指定部署区域为香港(hkg1)，优化亚洲地区访问速度

### 构建缓存优化
在vercel.json中配置：
```json
{
  "build": {
    "env": {
      "ENABLE_FILE_SYSTEM_API": "1"
    }
  }
}
```

### 输出优化
在next.config.js中已配置：
```javascript
{
  output: 'standalone'
}
```
- **说明**: 生成独立的构建输出，减少部署包大小

## 高级构建配置

### 环境变量优化
在vercel.json中配置：
```json
{
  "build": {
    "env": {
      "NEXT_TELEMETRY_DISABLED": "1"
    }
  }
}
```
- **说明**: 禁用Next.js遥测数据收集

### 构建超时设置
在vercel.json中配置：
```json
{
  "build": {
    "timeout": 300
  }
}
```
- **说明**: 设置构建超时时间为300秒

## 构建缓存策略

### Node Modules缓存
Vercel自动缓存node_modules目录以加速构建过程

### 构建产物缓存
Vercel自动缓存构建产物以支持增量构建

### 自定义缓存配置
在vercel.json中配置：
```json
{
  "build": {
    "cache": {
      "directories": [".next/cache"]
    }
  }
}
```

## 构建错误处理

### 构建失败通知
在Vercel项目Settings → Notifications中配置：
- 邮件通知
- Slack通知
- Webhook通知

### 构建日志分析
- 检查构建日志中的错误信息
- 使用Vercel的错误诊断工具
- 启用详细的构建日志输出

## 性能优化建议

### 代码分割
Next.js自动进行代码分割，无需额外配置

### 静态资源优化
- 使用Vercel的自动图像优化
- 启用静态资源压缩

### CDN配置
Vercel自动使用全球CDN分发静态资源

### 缓存策略
在vercel.json中配置：
```json
{
  "headers": [
    {
      "source": "/_next/static/(.*)",
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
- **说明**: 为静态资源设置长期缓存策略

## 部署后验证

### 部署状态检查
- 检查Vercel部署状态页面
- 验证应用功能是否正常
- 测试API端点响应

### 性能监控
- 使用Vercel Analytics监控性能
- 检查页面加载时间
- 监控错误率

### 安全检查
- 验证HTTPS配置
- 检查安全头设置
- 验证环境变量是否正确加载