// 本地登录端点验证脚本
const http = require('http');

const postData = JSON.stringify({
  email: 'test@test.com',
  password: 'test'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  },
  timeout: 10000
};

console.log('正在验证本地登录端点...');
console.log('URL: http://localhost:3000/api/auth/login');
console.log('请求数据:', postData);
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
      console.log('完整响应体:');
      console.log(JSON.stringify(jsonData, null, 2));
    } catch (error) {
      console.log('');
      console.log('响应体解析错误:', error.message);
      console.log('原始响应:', data.substring(0, 200));
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
  console.log('1. HTTP状态码: N/A (连接失败)');
  console.log('2. success字段值: N/A');
  console.log('3. 是否返回500错误: N/A');
  console.log('');
  console.log('提示: 请确认本地开发服务器是否在运行 (npm run dev)');
});

req.on('timeout', () => {
  console.log('=== 验证结果 ===');
  console.log('请求超时');
  console.log('');
  console.log('1. HTTP状态码: N/A (超时)');
  console.log('2. success字段值: N/A');
  console.log('3. 是否返回500错误: N/A');
  req.destroy();
});

req.write(postData);
req.end();
