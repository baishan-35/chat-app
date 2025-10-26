# 前端部署指南

## 项目目录结构
```
E:\MyWX\                 # 项目根目录
├── frontend\            # 前端项目目录
│   ├── app\             # Next.js App Router目录
│   ├── components\      # React组件目录
│   ├── public\          # 静态资源目录
│   ├── scripts\         # 脚本目录
│   ├── next.config.js   # Next.js配置文件
│   ├── vercel.json      # Vercel配置文件
│   └── package.json     # npm包配置文件
└── backend\             # 后端项目目录
```

## 部署前准备

### 1. 确认当前目录
在执行任何命令之前，请先确认您所在的目录位置：

```bash
# 查看当前目录（Windows PowerShell/CMD）
cd

# 或者在Linux/Mac终端中
pwd
```

### 2. 根据位置执行相应操作

#### 如果您在项目根目录 `E:\MyWX`：
```bash
# 进入前端目录
cd frontend

# 运行部署前检查
npm run predeploy

# 本地构建测试
npm run build

# 部署到Vercel
vercel --prod
```

#### 如果您已在前端目录 `E:\MyWX\frontend`：
```bash
# 运行部署前检查
npm run predeploy

# 本地构建测试
npm run build

# 部署到Vercel
vercel --prod
```

## 部署前检查

### 运行自动化检查
```bash
npm run predeploy
```

该命令会检查：
- 必要文件是否存在
- 配置文件内容是否正确
- 客户端/服务器组件使用是否正确
- PWA相关文件是否完整

### 手动检查清单
- [ ] 确认在正确的目录中执行命令
- [ ] 检查`next.config.js`配置
- [ ] 验证`vercel.json`配置
- [ ] 确认`public`目录中包含必要的PWA文件
- [ ] 检查环境变量是否已设置

## 本地测试

### 构建测试
```bash
npm run build
```

### 开发服务器测试
```bash
npm run dev
```
然后访问 http://localhost:3000 验证应用功能

## Vercel部署

### 首次部署
```bash
vercel
```

### 生产环境部署
```bash
vercel --prod
```

### 查看部署状态
```bash
vercel list
```

## 环境变量配置

确保在Vercel项目中设置了必要的环境变量：
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_WS_URL`

## 故障排除

### 1. 路径错误
**错误信息：** `cd : 找不到路径`
**解决方案：** 确认当前目录位置，不要重复进入不存在的子目录

### 2. 构建失败
**错误信息：** 构建过程中出现错误
**解决方案：** 
- 运行`npm run predeploy`检查配置
- 本地运行`npm run build`测试构建
- 检查错误日志并修复问题

### 3. PWA功能异常
**问题描述：** Service Worker未注册或离线功能不工作
**解决方案：**
- 检查`public/sw.js`文件是否存在
- 验证`public/manifest.json`配置
- 确认应用通过HTTPS访问

## 华为设备验证

部署完成后，请在华为设备上验证以下功能：
- [ ] PWA安装功能正常
- [ ] Service Worker正确注册
- [ ] 离线功能可用
- [ ] 推送通知显示正常
- [ ] 输入法弹出不影响布局
- [ ] 手势操作流畅

## 常用命令参考

### 目录导航
```bash
# 查看当前目录
cd

# 进入前端目录
cd frontend

# 返回上级目录
cd ..
```

### npm命令
```bash
# 安装依赖
npm install

# 运行开发服务器
npm run dev

# 构建生产版本
npm run build

# 运行部署前检查
npm run predeploy
```

### Vercel命令
```bash
# 登录Vercel
vercel login

# 部署到开发环境
vercel

# 部署到生产环境
vercel --prod

# 查看部署列表
vercel list

# 查看部署日志
vercel logs <deployment-url>
```

通过遵循本指南，您应该能够顺利完成前端应用的部署工作。