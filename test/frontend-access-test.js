// 前端访问测试脚本
const { default: fetch } = require('node-fetch');

async function testFrontendAccess() {
  console.log('测试前端访问...');
  
  try {
    const response = await fetch('http://localhost:3000');
    const text = await response.text();
    
    console.log('前端响应状态:', response.status);
    console.log('前端响应头:', [...response.headers.entries()]);
    
    if (response.status === 200) {
      console.log('✓ 前端服务可访问');
    } else {
      console.log('✗ 前端服务不可访问');
    }
  } catch (error) {
    console.error('访问前端时出错:', error.message);
  }
  
  console.log('\n测试后端API访问...');
  
  try {
    const response = await fetch('http://localhost:3001/health');
    const data = await response.json();
    
    console.log('后端健康检查响应:', data);
    
    if (data.success) {
      console.log('✓ 后端API可访问');
    } else {
      console.log('✗ 后端API不可访问');
    }
  } catch (error) {
    console.error('访问后端API时出错:', error.message);
  }
}

// 执行测试
testFrontendAccess();