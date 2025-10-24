# 前端登录和WebSocket连接测试指南

## 系统访问地址

1. **前端应用**: http://localhost:3000
2. **后端API**: http://localhost:3001
3. **WebSocket服务**: ws://localhost:3002 (仅支持WebSocket连接)

**注意**: 直接访问 http://localhost:3002/ 会显示 "Upgrade Required"，这是正常的，因为该端口仅接受WebSocket连接。

## 测试步骤

### 第一步：访问前端应用并登录

1. 打开浏览器，访问 http://localhost:3000
2. 点击"登录"按钮进入登录页面
3. 输入以下凭据：
   - 邮箱：user@example.com
   - 密码：password123
4. 点击"登录"按钮
5. 验证是否成功跳转到仪表板页面

### 第二步：获取JWT令牌（用于WebSocket测试）

1. 登录成功后，按F12打开浏览器开发者工具
2. 切换到"Application"（应用程序）标签
3. 在左侧导航栏中找到"Storage"（存储）下的"Cookies"
4. 点击 http://localhost:3000
5. 找到名为 `accessToken` 的Cookie，复制其值

### 第三步：测试WebSocket连接

1. 打开 [websocket-connection-test.html](file:///e:/我的微信/test/websocket-connection-test.html) 文件
2. 在输入框中粘贴刚才复制的JWT令牌
3. 点击"连接WebSocket"按钮
4. 观察连接状态和消息记录

## 预期结果

- 登录成功后应跳转到 /dashboard 页面
- 仪表板页面应显示用户信息
- WebSocket连接应自动建立
- 页面应显示"已连接"状态
- 应能成功发送和接收消息

## 故障排除

如果遇到问题，请检查：

1. 确保后端服务正在运行（端口3001和3002）
2. 检查浏览器控制台是否有错误信息
3. 确认网络连接正常
4. 清除浏览器缓存后重试

## WebSocket连接测试说明

WebSocket连接需要通过JavaScript代码建立，不能直接在浏览器地址栏中访问。正确的连接方式如下：

```javascript
// 创建WebSocket连接（需要有效的JWT令牌）
const ws = new WebSocket('ws://localhost:3002?token=YOUR_JWT_TOKEN');

ws.onopen = () => console.log('连接成功');
ws.onmessage = (event) => console.log('收到消息:', event.data);
ws.onerror = (error) => console.error('连接错误:', error);
ws.onclose = () => console.log('连接已关闭');
```

## 系统架构说明

- **前端**: Next.js应用，运行在端口3000
- **后端API**: Express.js服务，运行在端口3001
- **WebSocket服务**: 基于ws库的WebSocket服务器，运行在端口3002
- **数据库**: 可选配置，当前使用模拟数据模式

系统采用前后端分离架构，前端通过HTTP API与后端通信，通过WebSocket实现实时通信功能。