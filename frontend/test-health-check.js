// 健康检查端点验证脚本
const https = require('https');

const url = 'https://chat-ffjd2u3ib-baishan35s-projects.vercel.app/api/health';

console.log('正在验证健康检查端点...');
console.log('URL:', url);
console.log('');

https.get(url, {
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000
}, (res) => {
  console.log('=== 验证结果 ===');
  console.log('1. HTTP状态码:', res.statusCode);
  console.log('');
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const jsonData = JSON.parse(data);
      console.log('2. 响应体内容:');
      console.log(JSON.stringify(jsonData, null, 2));
      console.log('');
      
      const isPassed = res.statusCode === 200 && jsonData.status === 'ok';
      console.log('3. 是否通过验证:', isPassed ? '是 ✓' : '否 ✗');
      
      if (isPassed) {
        console.log('');
        console.log('✓ 健康检查端点验证通过！');
      } else {
        console.log('');
        console.log('✗ 健康检查端点验证失败');
      }
    } catch (error) {
      console.log('响应体解析错误:', error.message);
      console.log('原始响应:', data);
      console.log('');
      console.log('3. 是否通过验证: 否 ✗');
    }
  });
}).on('error', (error) => {
  console.log('=== 验证结果 ===');
  console.log('请求失败:', error.message);
  console.log('');
  console.log('1. HTTP状态码: N/A');
  console.log('2. 响应体内容: N/A');
  console.log('3. 是否通过验证: 否 ✗');
  console.log('');
  console.log('错误原因:', error.code || error.message);
}).on('timeout', () => {
  console.log('=== 验证结果 ===');
  console.log('请求超时');
  console.log('');
  console.log('1. HTTP状态码: N/A');
  console.log('2. 响应体内容: N/A');
  console.log('3. 是否通过验证: 否 ✗');
});
