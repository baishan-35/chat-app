# 聊天功能验收测试指南

## 验收标准

两个用户能完成完整的消息发送→接收→显示流程，包括：
1. 消息状态正确显示（发送中→已发送→已送达）
2. 区分自己/他人消息
3. 实时接收WebSocket消息
4. 刷新页面后历史消息能重新加载

## 测试环境准备

### 服务启动
确保以下服务正在运行：
- 前端服务：http://localhost:3000
- 后端API服务：http://localhost:3001
- WebSocket服务：ws://localhost:3002

### 依赖检查
- Node.js环境
- npm包已安装
- Prisma客户端已生成

## 测试步骤

### 步骤1：数据模型验证
检查Prisma schema中Message模型是否正确扩展：
```prisma
model Message {
  id         String   @id @default(uuid())
  content    String
  status     String   @default("sending") // sending, sent, delivered, read
  senderId   String
  receiverId String
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  // 关联用户
  sender   User @relation("sentMessages", fields: [senderId], references: [id])
  receiver User @relation("receivedMessages", fields: [receiverId], references: [id])

  @@map("messages")
}
```

### 步骤2：组件功能测试

#### SendMessage组件测试
1. 组件正确渲染文本输入框和发送按钮
2. 支持Enter键发送消息
3. 实现乐观更新（立即显示消息）
4. 通过WebSocket发送消息
5. 显示连接状态提示

#### MessageList组件测试
1. 实时接收WebSocket消息
2. 正确区分自己/他人消息（样式不同）
3. 显示消息发送状态（发送中、已发送、已送达）
4. 消息按时间顺序排列
5. 自动滚动到最新消息

### 步骤3：端到端测试

#### 测试场景1：基本消息收发
1. 用户A打开聊天页面
2. 用户B打开聊天页面
3. 用户A发送消息："Hello, 这是测试消息"
4. 用户B立即收到消息并显示
5. 用户B回复："收到你的消息了"
6. 用户A立即收到回复并显示

#### 测试场景2：消息状态跟踪
1. 用户A发送消息
2. 消息立即显示为"发送中"状态（带动画）
3. 服务器确认后显示为"已发送"状态（带对勾）
4. 用户B收到消息后，用户A端显示为"已送达"状态

#### 测试场景3：历史消息加载
1. 用户A发送几条消息
2. 刷新页面
3. 验证历史消息正确加载并显示
4. 消息状态保持正确

## 预期结果

### 功能性要求
- ✅ 消息能从用户A发送到用户B
- ✅ 消息能从用户B发送到用户A
- ✅ 消息状态正确更新和显示
- ✅ 消息历史正确保存和加载
- ✅ 连接断开后能自动重连
- ✅ 心跳检测机制正常工作

### 性能要求
- ✅ 消息发送延迟 < 100ms
- ✅ 页面刷新后消息加载时间 < 1秒
- ✅ WebSocket连接稳定，无频繁断连

### 用户体验要求
- ✅ 界面响应迅速
- ✅ 消息显示清晰易读
- ✅ 状态指示明确
- ✅ 错误提示友好

## 测试工具

### 自动化测试脚本
使用 [chat-components-test.js](file:///e:/我的微信/test/chat-components-test.js) 进行功能验证：
```bash
cd e:\我的微信\test
node chat-components-test.js
```

### 手动测试流程
1. 打开两个浏览器窗口
2. 分别登录不同用户账户
3. 进入聊天页面
4. 按照验收标准进行功能验证

## 故障排除

### 常见问题
1. **WebSocket连接失败**：检查3002端口是否被占用
2. **消息无法发送**：检查网络连接和认证状态
3. **状态显示错误**：检查消息ID匹配逻辑
4. **历史消息丢失**：检查localStorage权限和存储逻辑

### 调试方法
1. 打开浏览器开发者工具查看控制台日志
2. 检查Network标签页中的WebSocket通信
3. 查看后端服务日志
4. 验证Prisma数据库连接状态

## 验收确认

所有测试通过后，在下方签字确认：

测试人员：_________________  
测试日期：_________________  
测试结果：□ 通过  □ 未通过  □ 部分通过

备注：
__________________________________________________
__________________________________________________