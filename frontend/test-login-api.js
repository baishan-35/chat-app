// 测试登录API的脚本
const testLoginAPI = async () => {
  try {
    console.log('测试登录API路由...');
    
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });
    
    console.log('响应状态:', response.status);
    console.log('响应头:', response.headers);
    
    const data = await response.json();
    console.log('响应数据:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('测试错误:', error);
  }
};

const testSimpleLoginAPI = async () => {
  try {
    console.log('测试简单登录API路由...');
    
    const response = await fetch('http://localhost:3000/api/auth/simple-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });
    
    console.log('响应状态:', response.status);
    console.log('响应头:', response.headers);
    
    const data = await response.json();
    console.log('响应数据:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('测试错误:', error);
  }
};

const testHealthAPI = async () => {
  try {
    console.log('测试健康检查API路由...');
    
    const response = await fetch('http://localhost:3000/api/health');
    
    console.log('响应状态:', response.status);
    console.log('响应头:', response.headers);
    
    const data = await response.json();
    console.log('响应数据:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('测试错误:', error);
  }
};

// 运行测试
testHealthAPI();
testSimpleLoginAPI();
testLoginAPI();