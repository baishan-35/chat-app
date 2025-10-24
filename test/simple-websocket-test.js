// WebSocket连接测试
const WebSocket = require('ws');

console.log('开始WebSocket连接测试...');

// 使用有效JWT令牌连接WebSocket服务器
const ws = new WebSocket('ws://localhost:3001?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyXzE3NjEyMDQ4NDMwNTYiLCJpYXQiOjE3NjEyMDQ4NDMsImV4cCI6MTc2MTI5MTI0M30.jBo7miVUyjItRtdTR27Br-jtEI_M1mkTQk9nR0Vw6ME');

// 设置连接超时
const connectionTimeout = setTimeout(() => {
  console.log('❌ WebSocket连接超时');
  ws.terminate();
  process.exit(1);
}, 5000);

ws.on('open', () => {
  clearTimeout(connectionTimeout);
  console.log('✅ WebSocket连接成功');
  
  // 测试完成后关闭连接
  setTimeout(() => {
    ws.close();
    console.log('WebSocket连接已关闭');
    process.exit(0);
  }, 1000);
});

ws.on('error', (error) => {
  clearTimeout(connectionTimeout);
  console.log('❌ WebSocket连接失败:', error.message);
  process.exit(1);
});

ws.on('close', (code, reason) => {
  console.log(`WebSocket连接已关闭，代码: ${code}, 原因: ${reason || '无'}`);
});

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  console.log('未捕获的异常:', error.message);
  process.exit(1);
});