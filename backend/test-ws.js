const WebSocket = require('ws');

// 创建一个简单的WebSocket服务器来测试
const wss = new WebSocket.Server({ port: 3002 });

wss.on('connection', (ws) => {
  console.log('客户端已连接');
  
  ws.on('message', (message) => {
    console.log('收到消息:', message.toString());
    ws.send(`回显: ${message}`);
  });
  
  ws.on('close', () => {
    console.log('客户端断开连接');
  });
});

console.log('测试WebSocket服务器正在端口3002上运行');