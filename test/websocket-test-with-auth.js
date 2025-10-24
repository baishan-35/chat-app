/**
 * WebSocket连接测试脚本（带认证）
 * 用于验证WebSocket连接、消息往返和断线重连功能
 */

const WebSocket = require('ws');
const http = require('http');

// 测试配置
const WS_URL = 'ws://localhost:3002';
const API_BASE_URL = 'http://localhost:3001';
const TEST_USER = {
  email: 'test@example.com',
  password: 'password123'
};

/**
 * 用户登录并获取JWT令牌
 */
async function login() {
  console.log('=== 用户登录 ===');
  
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(TEST_USER);
    
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (res.statusCode === 200 && result.success) {
            console.log('✓ 用户登录成功');
            resolve(result.data.accessToken);
          } else {
            console.error('✗ 用户登录失败:', result.message);
            reject(new Error(result.message));
          }
        } catch (error) {
          console.error('✗ 解析登录响应时出错:', error);
          reject(error);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('✗ 登录请求失败:', error.message);
      reject(error);
    });
    
    req.write(postData);
    req.end();
  });
}

/**
 * 测试WebSocket连接建立
 * @param {string} token - JWT令牌
 */
async function testConnection(token) {
  console.log('\n=== WebSocket连接测试 ===');
  
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`${WS_URL}?token=${token}`);
    
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
    const testMessage = { type: 'test', data: 'Hello WebSocket!' };
    
    // 发送测试消息
    ws.send(JSON.stringify(testMessage));
    console.log('已发送测试消息:', testMessage);
    
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
 * @param {string} token - JWT令牌
 */
async function testReconnection(token) {
  console.log('\n=== 断线重连测试 ===');
  
  return new Promise((resolve, reject) => {
    // 先建立连接
    const ws = new WebSocket(`${WS_URL}?token=${token}`);
    
    ws.on('open', () => {
      console.log('✓ 初始连接建立成功');
      
      // 立即关闭连接
      ws.close();
    });
    
    ws.on('close', () => {
      console.log('初始连接已关闭');
      
      // 等待一段时间后尝试重新连接
      setTimeout(async () => {
        try {
          const newWs = await testConnection(token);
          console.log('✓ 断线重连测试成功');
          resolve(newWs);
        } catch (error) {
          console.error('✗ 断线重连测试失败:', error.message);
          reject(error);
        }
      }, 3000);
    });
    
    ws.on('error', (error) => {
      console.error('✗ 初始连接失败:', error.message);
      reject(error);
    });
  });
}

/**
 * 主测试函数
 */
async function runTests() {
  console.log('开始WebSocket测试（带认证）...\n');
  
  try {
    // 1. 用户登录获取令牌
    const token = await login();
    
    // 2. 测试连接建立
    let ws = await testConnection(token);
    
    // 3. 测试消息往返
    await testMessageRoundtrip(ws);
    
    // 4. 测试心跳机制
    await testHeartbeat(ws);
    
    // 5. 测试断线重连
    ws = await testReconnection(token);
    
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
  login,
  testConnection,
  testMessageRoundtrip,
  testHeartbeat,
  testReconnection,
  runTests
};