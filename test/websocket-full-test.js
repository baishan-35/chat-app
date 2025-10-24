// WebSocket完整功能测试
const WebSocket = require('ws');

console.log('开始WebSocket完整功能测试...\n');

// 使用有效JWT令牌连接WebSocket服务器
const ws = new WebSocket('ws://localhost:3001?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyXzE3NjEyMDQ4NDMwNTYiLCJpYXQiOjE3NjEyMDQ4NDMsImV4cCI6MTc2MTI5MTI0M30.jBo7miVUyjItRtdTR27Br-jtEI_M1mkTQk9nR0Vw6ME');

// 设置连接超时
const connectionTimeout = setTimeout(() => {
  console.log('❌ WebSocket连接超时');
  ws.terminate();
  process.exit(1);
}, 5000);

// 存储测试状态
let connectionAckReceived = false;
let messageEchoReceived = false;
let testCompleted = false;

ws.on('open', () => {
  clearTimeout(connectionTimeout);
  console.log('✅ WebSocket连接成功');
  
  // 发送一条测试消息
  const testMessage = {
    type: 'chat_message',
    data: {
      id: 'test-message-1',
      content: 'Hello WebSocket!'
    }
  };
  
  console.log('发送测试消息:', JSON.stringify(testMessage));
  ws.send(JSON.stringify(testMessage));
});

ws.on('message', (data) => {
  try {
    const message = JSON.parse(data);
    console.log('收到服务器消息:', JSON.stringify(message, null, 2));
    
    // 检查连接确认消息
    if (message.type === 'connection_ack') {
      connectionAckReceived = true;
      console.log('✅ 收到连接确认消息');
    }
    
    // 检查消息回显
    if (message.type === 'chat_message' && message.data.content === 'Hello WebSocket!') {
      messageEchoReceived = true;
      console.log('✅ 收到消息回显');
    }
    
    // 检查心跳响应
    if (message.type === 'heartbeat_ack') {
      console.log('✅ 收到心跳响应');
    }
    
    // 如果收到所有预期的响应，测试完成
    if (connectionAckReceived && messageEchoReceived && !testCompleted) {
      testCompleted = true;
      console.log('\n🎉 WebSocket完整功能测试通过！');
      console.log('测试结果:');
      console.log('✅ WebSocket连接成功');
      console.log('✅ 消息往返测试通过');
      
      // 关闭连接
      setTimeout(() => {
        ws.close();
      }, 1000);
    }
  } catch (error) {
    console.log('解析消息时出错:', error.message);
  }
});

ws.on('error', (error) => {
  clearTimeout(connectionTimeout);
  console.log('❌ WebSocket连接失败:', error.message);
  process.exit(1);
});

ws.on('close', (code, reason) => {
  console.log(`\nWebSocket连接已关闭，代码: ${code}`);
  if (!testCompleted) {
    console.log('❌ 测试未完成');
    process.exit(1);
  } else {
    console.log('✅ 测试完成');
    process.exit(0);
  }
});

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  console.log('未捕获的异常:', error.message);
  process.exit(1);
});

// 设置测试超时
setTimeout(() => {
  if (!testCompleted) {
    console.log('❌ 测试超时');
    ws.close();
    process.exit(1);
  }
}, 10000);