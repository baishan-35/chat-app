// WebSocket连接测试脚本（带JWT认证）
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

console.log('开始测试带JWT认证的WebSocket连接...');

// 生成一个测试JWT令牌
const testUser = {
  userId: 1,
  username: 'testuser',
  email: 'test@example.com'
};

const secret = process.env.JWT_SECRET || 'default_secret_key_for_development';
const token = jwt.sign(testUser, secret, { expiresIn: '1h' });

console.log('生成的JWT令牌:', token);

// 创建WebSocket连接（带认证令牌）
const ws = new WebSocket(`ws://localhost:3002?token=${token}`);

ws.on('open', function open() {
  console.log('WebSocket连接成功建立');
  console.log('发送测试消息...');
  
  // 发送测试消息
  ws.send(JSON.stringify({
    type: 'test_message',
    data: {
      text: 'Hello from test client',
      timestamp: new Date().toISOString()
    }
  }));
});

ws.on('message', function message(data) {
  console.log('收到服务器消息:', data.toString());
});

ws.on('error', function error(err) {
  console.log('WebSocket连接错误:', err.message);
});

ws.on('close', function close(code, reason) {
  console.log('WebSocket连接已关闭，代码:', code, '原因:', reason?.toString() || '无');
});

// 设置超时
setTimeout(() => {
  if (ws.readyState === WebSocket.OPEN) {
    console.log('测试完成，连接正常');
    ws.close();
  } else if (ws.readyState === WebSocket.CONNECTING) {
    console.log('连接超时');
    ws.terminate();
  }
}, 10000);