const WebSocket = require('ws');

// 创建WebSocket客户端连接
const ws = new WebSocket('ws://localhost:3003');

ws.on('open', () => {
  console.log('WebSocket连接已建立');
  
  // 发送测试消息
  ws.send(JSON.stringify({
    type: 'test',
    message: 'Hello WebSocket Server!'
  }));
});

ws.on('message', (data) => {
  try {
    const message = JSON.parse(data);
    console.log('收到服务器消息:', message);
    
    // 如果是欢迎消息，发送另一个测试消息
    if (message.type === 'welcome') {
      ws.send(JSON.stringify({
        type: 'another_test',
        message: 'Another test message'
      }));
    }
  } catch (error) {
    console.error('解析服务器消息时出错:', error);
  }
});

ws.on('error', (error) => {
  console.error('WebSocket连接错误:', error);
});

ws.on('close', () => {
  console.log('WebSocket连接已关闭');
});