// 浏览器WebSocket测试脚本
// 请将下面的VALID_JWT_TOKEN替换为您从登录接口获取的实际JWT令牌

// 替换为实际的JWT令牌:
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyXzE3NjExMjgyMTMxNTEiLCJpYXQiOjE3NjExMjgyMTMsImV4cCI6MTc2MTIxNDYxM30.LPOPNozPy6zywBC2cTX7BLI402G2AuEw1QCUGGVkC_c';

// 1. 创建WebSocket连接
const ws = new WebSocket(`ws://localhost:3002?token=${token}`);

// 2. 连接成功事件
ws.onopen = () => {
  console.log('✅ WebSocket连接成功');
  
  // 3. 发送测试消息
  setTimeout(() => {
    ws.send(JSON.stringify({
      type: 'test_message',
      data: {
        text: 'Hello from browser console',
        timestamp: new Date().toISOString()
      }
    }));
    console.log('📤 发送测试消息');
  }, 1000);
};

// 4. 接收消息事件
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('📨 收到消息:', message);
  
  // 根据消息类型进行不同处理
  switch (message.type) {
    case 'connection_ack':
      console.log('✅ 连接确认:', message.data.message);
      break;
    case 'user_online':
      console.log('👤 用户上线:', message.data.userId);
      break;
    case 'echo':
      console.log('🔄 消息回显:', message.data.originalMessage);
      break;
    case 'heartbeat_ack':
      console.log('💓 心跳响应');
      break;
    default:
      console.log('📄 其他消息:', message);
  }
};

// 5. 连接错误事件
ws.onerror = (error) => {
  console.error('❌ WebSocket连接错误:', error);
};

// 6. 连接关闭事件
ws.onclose = (event) => {
  console.log('🔚 WebSocket连接已关闭', event.code, event.reason);
};

// 7. 发送心跳消息的函数
function sendHeartbeat() {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'heartbeat'
    }));
    console.log('💓 发送心跳');
  }
}

// 8. 发送自定义消息的函数
function sendMessage(text) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'custom_message',
      data: {
        text: text,
        timestamp: new Date().toISOString()
      }
    }));
    console.log('📤 发送自定义消息:', text);
  }
}

console.log('WebSocket测试脚本已准备就绪');
console.log('请在浏览器控制台中执行以下操作:');
console.log('1. 粘贴并执行以上代码');
console.log('2. 观察连接和消息结果');
console.log('3. 可以调用 sendHeartbeat() 发送心跳消息');
console.log('4. 可以调用 sendMessage("your message") 发送自定义消息');