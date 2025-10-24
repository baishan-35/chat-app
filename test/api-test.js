const http = require('http');

// 测试注册API
function testRegister() {
  const postData = JSON.stringify({
    email: 'test@test.com',
    password: '123456',
    name: 'Test User'
  });

  const options = {
    hostname: 'localhost',
    port: 3007,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('注册响应状态码:', res.statusCode);
      console.log('注册响应数据:', data);
      
      // 如果注册成功，继续测试登录
      if (res.statusCode === 201) {
        testLogin();
      }
    });
  });

  req.on('error', (error) => {
    console.error('注册请求错误:', error);
  });

  req.write(postData);
  req.end();
}

// 测试登录API
function testLogin() {
  const postData = JSON.stringify({
    email: 'test@test.com',
    password: '123456'
  });

  const options = {
    hostname: 'localhost',
    port: 3007,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('登录响应状态码:', res.statusCode);
      console.log('登录响应数据:', data);
    });
  });

  req.on('error', (error) => {
    console.error('登录请求错误:', error);
  });

  req.write(postData);
  req.end();
}

// 开始测试
testRegister();