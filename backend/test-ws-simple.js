// 简单的WebSocket服务器测试，不使用JWT
const WebSocket = require('ws');

// 创建WebSocket服务器，使用不同的端口
const wss = new WebSocket.Server({ port: 3003 });

wss.on('connection', (ws) => {
  console.log('客户端已连接');
  
  // 发送欢迎消息
  ws.send(JSON.stringify({
    type: 'welcome',
    message: '欢迎连接到WebSocket服务器'
  }));
  
  // 监听消息
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      console.log('收到消息:', message);
      
      // 回显消息
      ws.send(JSON.stringify({
        type: 'echo',
        originalMessage: message,
        timestamp: new Date().toISOString()
      }));
    } catch (error) {
      console.error('解析消息时出错:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: '消息格式错误'
      }));
    }
  });
  
  // 监听连接关闭
  ws.on('close', () => {
    console.log('客户端断开连接');
  });
  
  // 监听错误
  ws.on('error', (error) => {
    console.error('WebSocket错误:', error);
  });
});

wss.on('error', (error) => {
  console.error('WebSocket服务器错误:', error);
});

console.log('简单的WebSocket服务器正在端口3003上运行');