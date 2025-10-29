const fetch = require('node-fetch');

async function testLogin() {
  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      }),
    });
    
    const data = await response.json();
    console.log('响应状态:', response.status);
    console.log('响应数据:', data);
  } catch (error) {
    console.error('测试错误:', error);
  }
}

testLogin();