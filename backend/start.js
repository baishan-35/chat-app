// start.js
// 同时启动HTTP服务器和WebSocket服务器

const { spawn } = require('child_process');
const path = require('path');

console.log('正在启动后端服务...');

// 启动HTTP服务器
const httpServer = spawn('node', ['server.js'], {
  cwd: __dirname,
  stdio: 'inherit'
});

// 启动WebSocket服务器
const wsServer = spawn('node', [path.join(__dirname, 'src', 'websocket', 'server.js')], {
  cwd: __dirname,
  stdio: 'inherit'
});

// 监听进程退出
httpServer.on('close', (code) => {
  console.log(`HTTP服务器退出，退出码 ${code}`);
  wsServer.kill();
});

wsServer.on('close', (code) => {
  console.log(`WebSocket服务器退出，退出码 ${code}`);
  httpServer.kill();
});

// 监听错误
httpServer.on('error', (err) => {
  console.error('HTTP服务器启动错误:', err);
  wsServer.kill();
});

wsServer.on('error', (err) => {
  console.error('WebSocket服务器启动错误:', err);
  httpServer.kill();
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('正在关闭所有服务...');
  httpServer.kill();
  wsServer.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('正在关闭所有服务...');
  httpServer.kill();
  wsServer.kill();
  process.exit(0);
});