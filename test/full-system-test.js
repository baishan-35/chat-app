// 完整系统测试脚本
const { default: fetch } = require('node-fetch');

async function testSystem() {
  console.log('开始测试系统功能...');
  
  try {
    // 1. 测试健康检查接口
    console.log('\n1. 测试健康检查接口...');
    const healthResponse = await fetch('http://localhost:3001/health');
    const healthData = await healthResponse.json();
    console.log('健康检查响应:', healthData);
    
    if (healthData.success) {
      console.log('✓ 健康检查通过');
    } else {
      console.log('✗ 健康检查失败');
      return;
    }
    
    // 2. 测试登录接口
    console.log('\n2. 测试登录接口...');
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'user@example.com',
        password: 'password123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('登录响应:', JSON.stringify(loginData, null, 2));
    
    if (loginData.success && loginData.data && loginData.data.accessToken) {
      console.log('✓ 登录接口测试通过');
      const token = loginData.data.accessToken;
      
      // 3. 测试WebSocket连接
      console.log('\n3. 测试WebSocket连接...');
      const WebSocket = require('ws');
      
      // 创建WebSocket连接（带认证令牌）
      const ws = new WebSocket(`ws://localhost:3002?token=${token}`);
      
      ws.on('open', function open() {
        console.log('✓ WebSocket连接成功建立');
        
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
        const msg = JSON.parse(data.toString());
        console.log('收到服务器消息:', msg.type);
        
        if (msg.type === 'connection_ack') {
          console.log('✓ 连接确认消息接收成功');
        } else if (msg.type === 'user_online') {
          console.log('✓ 用户上线通知接收成功');
        } else if (msg.type === 'echo') {
          console.log('✓ 消息回显接收成功');
          console.log('✓ WebSocket功能测试完成');
          ws.close();
        }
      });
      
      ws.on('error', function error(err) {
        console.log('✗ WebSocket连接错误:', err.message);
      });
      
      ws.on('close', function close() {
        console.log('WebSocket连接已关闭');
      });
      
      // 设置超时
      setTimeout(() => {
        if (ws.readyState === WebSocket.OPEN) {
          console.log('测试完成');
          ws.close();
        } else if (ws.readyState === WebSocket.CONNECTING) {
          console.log('✗ 连接超时');
          ws.terminate();
        }
      }, 10000);
      
    } else {
      console.log('✗ 登录接口测试失败');
    }
  } catch (error) {
    console.error('测试过程中出错:', error.message);
  }
}

// 执行测试
testSystem();