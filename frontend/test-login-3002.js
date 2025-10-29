// 验证登录端点（端口3002）
const http = require('http');

const postData = JSON.stringify({
  email: 'test@example.com',
  password: 'password123'
});

const options = {
  hostname: 'localhost',
  port: 3002,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  },
  timeout: 10000
};

console.log('正在验证登录端点...');
console.log('URL: http://localhost:3002/api/auth/login');
console.log('测试账号: test@example.com / password123');
console.log('');

const req = http.request(options, (res) => {
  console.log('=== 验证结果 ===');
  console.log('1. HTTP状态码:', res.statusCode);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const jsonData = JSON.parse(data);
      console.log('');
      console.log('2. success字段值:', jsonData.success !== undefined ? jsonData.success : 'N/A');
      console.log('');
      console.log('3. 是否返回500错误:', res.statusCode === 500 ? '是 ✗' : '否 ✓');
      console.log('');
      
      if (res.statusCode === 200 && jsonData.success === true) {
        console.log('✓ 登录端点验证通过！');
        console.log('');
        console.log('用户信息:', JSON.stringify(jsonData.data?.user, null, 2));
        console.log('Token已返回:', jsonData.data?.accessToken ? '是' : '否');
      } else if (res.statusCode === 401) {
        console.log('⚠ 认证失败（401）- 这是预期的行为');
        console.log('错误信息:', jsonData.message);
      } else {
        console.log('完整响应体:');
        console.log(JSON.stringify(jsonData, null, 2));
      }
    } catch (error) {
      console.log('');
      console.log('响应体解析错误:', error.message);
      console.log('原始响应 (前200字符):', data.substring(0, 200));
      console.log('');
      console.log('2. success字段值: N/A');
      console.log('3. 是否返回500错误:', res.statusCode === 500 ? '是 ✗' : '否 ✓');
    }
  });
});

req.on('error', (error) => {
  console.log('=== 验证结果 ===');
  console.log('请求失败:', error.message);
  console.log('');
  console.log('1. HTTP状态码: N/A');
  console.log('2. success字段值: N/A');
  console.log('3. 是否返回500错误: N/A');
});

req.on('timeout', () => {
  console.log('=== 验证结果 ===');
  console.log('请求超时');
  req.destroy();
});

req.write(postData);
req.end();
