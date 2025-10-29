// 健康检查验证脚本
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3002,
  path: '/api/health',
  method: 'GET',
  timeout: 10000
};

console.log('正在验证健康检查端点...');
console.log('URL: http://localhost:3002/api/health');
console.log('');

const req = http.request(options, (res) => {
  console.log('=== 验证结果 ===');
  console.log('HTTP状态码:', res.statusCode, res.statusCode === 200 ? '✓' : '✗');
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const jsonData = JSON.parse(data);
      console.log('');
      console.log('响应数据:');
      console.log(JSON.stringify(jsonData, null, 2));
      console.log('');
      
      if (res.statusCode === 200 && jsonData.status === 'ok') {
        console.log('✓ 健康检查端点验证通过！');
      } else {
        console.log('⚠ 健康检查端点返回异常');
      }
    } catch (error) {
      console.log('响应解析错误:', error.message);
      console.log('原始响应:', data);
    }
  });
});

req.on('error', (error) => {
  console.log('=== 验证结果 ===');
  console.log('请求失败:', error.message);
});

req.on('timeout', () => {
  console.log('=== 验证结果 ===');
  console.log('请求超时');
  req.destroy();
});

req.end();
