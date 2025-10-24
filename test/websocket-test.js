/**
 * WebSocket连接测试脚本
 * 用于验证WebSocket连接、消息往返和断线重连功能
 */

const WebSocket = require('ws');
const http = require('http');

// 测试配置
const WS_URL = 'ws://localhost:3002';
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0X3VzZXIiLCJpYXQiOjE3NjExMDYwMDAsImV4cCI6MTc2MTE5MjQwMH0.5XVzV7dC7fK3g3d9Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z'; // 示例JWT令牌
const TEST_MESSAGE = { type: 'test', data: 'Hello WebSocket!' };

/**
 * 测试WebSocket连接建立
 */
async function testConnection() {
  console.log('=== WebSocket连接测试 ===');
  
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`${WS_URL}?token=${TEST_TOKEN}`);
    
    // 连接成功
    ws.on('open', () => {
      console.log('✓ WebSocket连接建立成功');
      resolve(ws);
    });
    
    // 连接错误
    ws.on('error', (error) => {
      console.error('✗ WebSocket连接失败:', error.message);
      reject(error);
    });
    
    // 连接关闭
    ws.on('close', (code, reason) => {
      console.log(`连接关闭: ${code} - ${reason}`);
    });
  });
}

/**
 * 测试消息往返
 * @param {WebSocket} ws - WebSocket连接
 */
async function testMessageRoundtrip(ws) {
  console.log('\n=== 消息往返测试 ===');
  
  return new Promise((resolve, reject) => {
    // 发送测试消息
    ws.send(JSON.stringify(TEST_MESSAGE));
    console.log('已发送测试消息:', TEST_MESSAGE);
    
    // 监听响应
    const timeout = setTimeout(() => {
      console.error('✗ 消息往返超时');
      reject(new Error('消息往返超时'));
    }, 5000);
    
    ws.on('message', (data) => {
      try {
        const response = JSON.parse(data);
        console.log('收到响应消息:', response);
        
        // 检查是否为回显消息
        if (response.type === 'echo') {
          console.log('✓ 消息往返测试成功');
          clearTimeout(timeout);
          resolve();
        }
      } catch (error) {
        console.error('解析响应消息时出错:', error);
      }
    });
  });
}

/**
 * 测试心跳机制
 * @param {WebSocket} ws - WebSocket连接
 */
async function testHeartbeat(ws) {
  console.log('\n=== 心跳机制测试 ===');
  
  return new Promise((resolve, reject) => {
    let heartbeatCount = 0;
    const maxHeartbeats = 3;
    
    // 监听心跳响应
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        if (message.type === 'heartbeat_ack') {
          heartbeatCount++;
          console.log(`✓ 收到心跳响应 ${heartbeatCount}/${maxHeartbeats}`);
          
          if (heartbeatCount >= maxHeartbeats) {
            console.log('✓ 心跳机制测试成功');
            resolve();
          }
        }
      } catch (error) {
        console.error('解析心跳响应时出错:', error);
      }
    });
    
    // 发送心跳消息
    const heartbeatInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'heartbeat' }));
      }
    }, 1000);
    
    // 设置超时
    const timeout = setTimeout(() => {
      clearInterval(heartbeatInterval);
      console.error('✗ 心跳机制测试超时');
      reject(new Error('心跳机制测试超时'));
    }, 10000);
  });
}

/**
 * 测试断线重连
 * @param {WebSocket} ws - WebSocket连接
 */
async function testReconnection(ws) {
  console.log('\n=== 断线重连测试 ===');
  
  return new Promise((resolve, reject) => {
    // 先关闭连接
    ws.close();
    
    // 等待一段时间后尝试重新连接
    setTimeout(async () => {
      try {
        const newWs = await testConnection();
        console.log('✓ 断线重连测试成功');
        resolve(newWs);
      } catch (error) {
        console.error('✗ 断线重连测试失败:', error.message);
        reject(error);
      }
    }, 3000);
  });
}

/**
 * 主测试函数
 */
async function runTests() {
  console.log('开始WebSocket测试...\n');
  
  try {
    // 1. 测试连接建立
    let ws = await testConnection();
    
    // 2. 测试消息往返
    await testMessageRoundtrip(ws);
    
    // 3. 测试心跳机制
    await testHeartbeat(ws);
    
    // 4. 测试断线重连
    ws = await testReconnection(ws);
    
    // 关闭连接
    ws.close();
    
    console.log('\n=== 所有测试完成 ===');
    console.log('✓ WebSocket基础功能测试通过');
  } catch (error) {
    console.error('\n=== 测试失败 ===');
    console.error('错误详情:', error.message);
    process.exit(1);
  }
}

// 运行测试
if (require.main === module) {
  runTests();
}

module.exports = {
  testConnection,
  testMessageRoundtrip,
  testHeartbeat,
  testReconnection,
  runTests
};