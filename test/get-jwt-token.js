// 获取JWT令牌的脚本
const { default: fetch } = require('node-fetch');

async function getJWTToken() {
  try {
    console.log('正在获取JWT令牌...');
    
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'user@example.com',
        password: 'password123'
      })
    });
    
    const data = await response.json();
    
    if (data.success && data.data && data.data.accessToken) {
      console.log('登录成功！');
      console.log('JWT令牌:', data.data.accessToken);
      return data.data.accessToken;
    } else {
      console.log('登录失败:', data.message);
      return null;
    }
  } catch (error) {
    console.error('获取JWT令牌时出错:', error.message);
    return null;
  }
}

// 执行并输出令牌
getJWTToken().then(token => {
  if (token) {
    console.log('\n请将以下令牌用于WebSocket测试:');
    console.log(token);
  }
});