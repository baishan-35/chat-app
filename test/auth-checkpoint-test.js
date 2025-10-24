const http = require('http');

console.log('开始执行阶段1认证检查点测试...\n');

// 测试注册API
function testRegister() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      email: 'test@test.com',
      password: '123456'
      // 注意：不提供name字段，测试是否能正常处理
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
        console.log('=== 注册测试结果 ===');
        console.log('状态码:', res.statusCode);
        console.log('响应数据:', data);
        
        if (res.statusCode === 201) {
          console.log('✅ 注册测试通过\n');
          try {
            const response = JSON.parse(data);
            resolve(response.data.accessToken); // 返回accessToken用于登录测试
          } catch (e) {
            reject(new Error('无法解析注册响应数据'));
          }
        } else {
          console.log('❌ 注册测试失败\n');
          reject(new Error('注册失败'));
        }
      });
    });

    req.on('error', (error) => {
      console.error('注册请求错误:', error);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// 测试登录API
function testLogin() {
  return new Promise((resolve, reject) => {
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
        console.log('=== 登录测试结果 ===');
        console.log('状态码:', res.statusCode);
        console.log('响应数据:', data);
        
        if (res.statusCode === 200) {
          console.log('✅ 登录测试通过\n');
          try {
            const response = JSON.parse(data);
            if (response.data && response.data.accessToken) {
              console.log('✅ 成功返回JWT令牌\n');
              resolve(true);
            } else {
              console.log('❌ 未返回JWT令牌\n');
              reject(new Error('登录成功但未返回JWT令牌'));
            }
          } catch (e) {
            reject(new Error('无法解析登录响应数据'));
          }
        } else {
          console.log('❌ 登录测试失败\n');
          reject(new Error('登录失败'));
        }
      });
    });

    req.on('error', (error) => {
      console.error('登录请求错误:', error);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// 执行测试序列
async function runTests() {
  try {
    // 测试注册
    const accessToken = await testRegister();
    
    // 等待一点时间确保注册完成
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 测试登录
    await testLogin();
    
    console.log('🎉 所有检查点测试通过！');
    console.log('\n检查点验证结果:');
    console.log('✅ curl -X POST http://localhost:3007/api/auth/register -d \'{"email":"test@test.com","password":"123456"}\' → 成功');
    console.log('✅ curl -X POST http://localhost:3007/api/auth/login -d \'{"email":"test@test.com","password":"123456"}\' → 返回JWT');
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    process.exit(1);
  }
}

// 开始测试
runTests();