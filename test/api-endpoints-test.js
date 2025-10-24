// API端点测试脚本
const { default: fetch } = require('node-fetch');

console.log('开始测试API端点...');

// 测试基础URL
const BASE_URL = 'http://localhost:3001';

// 测试根路径
async function testRoot() {
  try {
    console.log('\n--- 测试根路径 ---');
    const response = await fetch(BASE_URL);
    const data = await response.json();
    console.log('状态码:', response.status);
    console.log('响应数据:', JSON.stringify(data, null, 2));
    
    if (data.success && data.endpoints) {
      console.log('✅ 根路径响应正常');
      return true;
    } else {
      console.log('❌ 根路径响应异常');
      return false;
    }
  } catch (error) {
    console.log('❌ 根路径测试错误:', error.message);
    return false;
  }
}

// 测试健康检查
async function testHealth() {
  try {
    console.log('\n--- 测试健康检查 ---');
    const response = await fetch(`${BASE_URL}/health`);
    const data = await response.json();
    console.log('状态码:', response.status);
    console.log('响应数据:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('✅ 健康检查响应正常');
      return true;
    } else {
      console.log('❌ 健康检查响应异常');
      return false;
    }
  } catch (error) {
    console.log('❌ 健康检查测试错误:', error.message);
    return false;
  }
}

// 测试认证端点
async function testAuthEndpoints() {
  try {
    console.log('\n--- 测试认证端点 ---');
    
    // 测试注册端点
    const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
        name: '测试用户'
      })
    });
    
    console.log('注册端点状态码:', registerResponse.status);
    
    // 测试登录端点
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });
    
    console.log('登录端点状态码:', loginResponse.status);
    
    console.log('✅ 认证端点可访问');
    return true;
  } catch (error) {
    console.log('❌ 认证端点测试错误:', error.message);
    return false;
  }
}

// 测试朋友圈端点
async function testPostsEndpoints() {
  try {
    console.log('\n--- 测试朋友圈端点 ---');
    
    // 测试创建动态端点（OPTIONS方法）
    const createResponse = await fetch(`${BASE_URL}/api/posts`, {
      method: 'OPTIONS'
    });
    
    console.log('创建动态端点状态码:', createResponse.status);
    
    // 测试获取动态端点（OPTIONS方法）
    const getResponse = await fetch(`${BASE_URL}/api/posts`, {
      method: 'OPTIONS'
    });
    
    console.log('获取动态端点状态码:', getResponse.status);
    
    // 测试点赞端点（OPTIONS方法）
    const likeResponse = await fetch(`${BASE_URL}/api/posts/123/likes`, {
      method: 'OPTIONS'
    });
    
    console.log('点赞端点状态码:', likeResponse.status);
    
    // 测试评论端点（OPTIONS方法）
    const commentResponse = await fetch(`${BASE_URL}/api/posts/123/comments`, {
      method: 'OPTIONS'
    });
    
    console.log('评论端点状态码:', commentResponse.status);
    
    console.log('✅ 朋友圈端点可访问');
    return true;
  } catch (error) {
    console.log('❌ 朋友圈端点测试错误:', error.message);
    return false;
  }
}

// 主测试函数
async function runTests() {
  console.log('🚀 开始API端点测试...\n');
  
  const results = [];
  
  // 测试根路径
  results.push(await testRoot());
  
  // 测试健康检查
  results.push(await testHealth());
  
  // 测试认证端点
  results.push(await testAuthEndpoints());
  
  // 测试朋友圈端点
  results.push(await testPostsEndpoints());
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log(`\n📊 测试结果: ${passed}/${total} 个测试通过`);
  
  if (passed === total) {
    console.log('🎉 所有API端点测试通过！');
  } else {
    console.log('⚠️  部分API端点测试未通过，请检查实现。');
  }
}

// 执行测试
runTests();