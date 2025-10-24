// 综合API接口测试
const http = require('http');
const WebSocket = require('ws');

console.log('开始执行API接口集成测试...\n');

// 测试用的用户凭证
const testUser = {
  email: 'api-test@example.com',
  password: '123456'
};

let authToken = null;
let createdPostId = null;

// 1. 用户注册测试
function testRegister() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      email: testUser.email,
      password: testUser.password
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
        console.log('=== 注册测试 ===');
        console.log('状态码:', res.statusCode);
        // console.log('响应数据:', data);
        
        if (res.statusCode === 201) {
          console.log('✅ 用户注册成功\n');
          resolve();
        } else {
          console.log('❌ 用户注册失败\n');
          reject(new Error(`注册失败，状态码: ${res.statusCode}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// 2. 用户登录测试
function testLogin() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      email: testUser.email,
      password: testUser.password
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
        console.log('=== 登录测试 ===');
        console.log('状态码:', res.statusCode);
        // console.log('响应数据:', data);
        
        if (res.statusCode === 200) {
          try {
            const response = JSON.parse(data);
            authToken = response.data.accessToken;
            console.log('✅ 用户登录成功\n');
            resolve();
          } catch (e) {
            console.log('❌ 无法解析登录响应数据\n');
            reject(e);
          }
        } else {
          console.log('❌ 用户登录失败\n');
          reject(new Error(`登录失败，状态码: ${res.statusCode}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// 3. 创建动态测试
function testCreatePost() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      content: 'API集成测试动态'
    });

    const options = {
      hostname: 'localhost',
      port: 3007,
      path: '/api/posts',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `accessToken=${authToken}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('=== 创建动态测试 ===');
        console.log('状态码:', res.statusCode);
        // console.log('响应数据:', data);
        
        if (res.statusCode === 201) {
          try {
            const response = JSON.parse(data);
            createdPostId = response.data.id;
            console.log('✅ 创建动态成功\n');
            resolve();
          } catch (e) {
            console.log('❌ 无法解析创建动态响应数据\n');
            reject(e);
          }
        } else {
          console.log('❌ 创建动态失败\n');
          reject(new Error(`创建动态失败，状态码: ${res.statusCode}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// 4. 获取动态列表测试
function testGetPosts() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3007,
      path: '/api/posts',
      method: 'GET',
      headers: {
        'Cookie': `accessToken=${authToken}`
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('=== 获取动态列表测试 ===');
        console.log('状态码:', res.statusCode);
        // console.log('响应数据:', data);
        
        if (res.statusCode === 200) {
          try {
            const response = JSON.parse(data);
            console.log(`✅ 获取动态列表成功，共${response.data.posts.length}条动态\n`);
            resolve();
          } catch (e) {
            console.log('❌ 无法解析获取动态列表响应数据\n');
            reject(e);
          }
        } else {
          console.log('❌ 获取动态列表失败\n');
          reject(new Error(`获取动态列表失败，状态码: ${res.statusCode}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

// 5. 点赞动态测试
function testLikePost() {
  return new Promise((resolve, reject) => {
    if (!createdPostId) {
      console.log('❌ 无法进行点赞测试，没有创建的动态ID\n');
      reject(new Error('没有创建的动态ID'));
      return;
    }

    const options = {
      hostname: 'localhost',
      port: 3007,
      path: `/api/posts/${createdPostId}/likes`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `accessToken=${authToken}`,
        'Content-Length': 0
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('=== 点赞动态测试 ===');
        console.log('状态码:', res.statusCode);
        // console.log('响应数据:', data);
        
        if (res.statusCode === 200) {
          try {
            const response = JSON.parse(data);
            console.log('✅ 点赞动态成功\n');
            resolve();
          } catch (e) {
            console.log('❌ 无法解析点赞动态响应数据\n');
            reject(e);
          }
        } else {
          console.log('❌ 点赞动态失败\n');
          reject(new Error(`点赞动态失败，状态码: ${res.statusCode}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

// 6. WebSocket连接测试
function testWebSocketConnection() {
  return new Promise((resolve, reject) => {
    if (!authToken) {
      console.log('❌ 无法进行WebSocket测试，没有认证令牌\n');
      reject(new Error('没有认证令牌'));
      return;
    }

    console.log('=== WebSocket连接测试 ===');
    
    // 设置连接超时
    const connectionTimeout = setTimeout(() => {
      console.log('❌ WebSocket连接超时\n');
      reject(new Error('WebSocket连接超时'));
    }, 5000);
    
    const ws = new WebSocket(`ws://localhost:3001?token=${authToken}`);
    
    ws.on('open', () => {
      clearTimeout(connectionTimeout);
      console.log('✅ WebSocket连接成功\n');
      
      // 收到连接确认后关闭连接
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data);
          if (message.type === 'connection_ack') {
            ws.close();
            resolve();
          }
        } catch (error) {
          // 忽略解析错误
        }
      });
    });
    
    ws.on('error', (error) => {
      clearTimeout(connectionTimeout);
      console.log('❌ WebSocket连接失败\n');
      reject(error);
    });
  });
}

// 执行所有测试
async function runAllTests() {
  try {
    // 1. 用户注册
    await testRegister();
    
    // 2. 用户登录
    await testLogin();
    
    // 3. 创建动态
    await testCreatePost();
    
    // 4. 获取动态列表
    await testGetPosts();
    
    // 5. 点赞动态
    await testLikePost();
    
    // 6. WebSocket连接
    await testWebSocketConnection();
    
    console.log('🎉 所有API接口测试通过！');
    console.log('\n接口测试结果:');
    console.log('✅ 用户注册接口 - /api/auth/register');
    console.log('✅ 用户登录接口 - /api/auth/login');
    console.log('✅ 创建动态接口 - /api/posts');
    console.log('✅ 获取动态列表接口 - /api/posts');
    console.log('✅ 点赞动态接口 - /api/posts/:id/likes');
    console.log('✅ WebSocket连接接口 - ws://localhost:3001');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    process.exit(1);
  }
}

// 添加未捕获异常处理
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
  process.exit(1);
});

// 开始测试
runAllTests();