// 完整的认证流程测试脚本
const { default: fetch } = require('node-fetch');

async function testAuthFlow() {
  console.log('开始测试完整的认证流程...');
  
  try {
    // 1. 测试健康检查
    console.log('\n1. 测试健康检查...');
    const healthResponse = await fetch('http://localhost:3001/health');
    const healthData = await healthResponse.json();
    console.log('健康检查响应:', healthData);
    
    if (!healthData.success) {
      console.log('✗ 健康检查失败');
      return;
    }
    console.log('✓ 健康检查通过');
    
    // 2. 测试注册
    console.log('\n2. 测试用户注册...');
    const registerResponse = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: `test_${Date.now()}@example.com`,
        password: 'password123',
        name: '测试用户'
      })
    });
    
    const registerData = await registerResponse.json();
    console.log('注册响应:', JSON.stringify(registerData, null, 2));
    
    if (!registerData.success) {
      console.log('✗ 用户注册失败');
      return;
    }
    console.log('✓ 用户注册成功');
    
    // 3. 测试登录
    console.log('\n3. 测试用户登录...');
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: registerData.data.user.email,
        password: 'password123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('登录响应:', JSON.stringify(loginData, null, 2));
    
    if (!loginData.success) {
      console.log('✗ 用户登录失败');
      return;
    }
    console.log('✓ 用户登录成功');
    
    // 4. 验证JWT令牌
    console.log('\n4. 验证JWT令牌...');
    const token = loginData.data.accessToken;
    if (!token) {
      console.log('✗ 未返回JWT令牌');
      return;
    }
    console.log('✓ JWT令牌获取成功');
    
    // 5. 测试获取当前用户信息
    console.log('\n5. 测试获取当前用户信息...');
    const meResponse = await fetch('http://localhost:3001/api/auth/me', {
      method: 'GET',
      headers: {
        'Cookie': `accessToken=${token}`
      }
    });
    
    const meData = await meResponse.json();
    console.log('用户信息响应:', JSON.stringify(meData, null, 2));
    
    if (!meData.success) {
      console.log('✗ 获取用户信息失败');
      return;
    }
    console.log('✓ 获取用户信息成功');
    
    // 6. 测试WebSocket连接
    console.log('\n6. 测试WebSocket连接...');
    const WebSocket = require('ws');
    
    const ws = new WebSocket(`ws://localhost:3002?token=${token}`);
    
    ws.on('open', function open() {
      console.log('✓ WebSocket连接成功建立');
      ws.close();
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
        console.log('WebSocket测试完成');
        ws.close();
      } else if (ws.readyState === WebSocket.CONNECTING) {
        console.log('✗ WebSocket连接超时');
        ws.terminate();
      }
    }, 5000);
    
    console.log('\n✅ 完整的认证流程测试完成！');
    
  } catch (error) {
    console.error('测试过程中出错:', error.message);
  }
}

// 执行测试
testAuthFlow();