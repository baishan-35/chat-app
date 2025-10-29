// 简单的WebSocket测试脚本
const WebSocket = require('ws');

// 连接到WebSocket服务器（带测试令牌）
const ws = new WebSocket('ws://localhost:3010?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0X3VzZXIiLCJuYW1lIjoiVGVzdCBVc2VyIiwiaWF0IjoxNzYxNjAxNjQwLCJleHAiOjE3NjE2MDUyNDB9._YUC9q81modtd8qmBvFxxuhO4dzWQrmdS7nKDxabR2E');

ws.on('open', function open() {
  console.log('WebSocket连接已建立');
  
  // 发送测试消息
  ws.send(JSON.stringify({
    type: 'test_message',
    data: {
      text: 'Hello from test script',
      timestamp: new Date().toISOString()
    }
  }));
});

ws.on('message', function incoming(data) {
  console.log('收到消息:', data.toString());
});

ws.on('error', function error(err) {
  console.error('WebSocket错误:', err);
});

ws.on('close', function close() {
  console.log('WebSocket连接已关闭');
});