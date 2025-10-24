// 朋友圈核心流程测试
const http = require('http');

async function runSocialFlow() {
  console.log('开始执行朋友圈核心流程...\n');
  
  try {
    // 先获取有效的认证令牌
    console.log('正在获取认证令牌...');
    const token = await getAuthToken();
    console.log('认证令牌获取成功\n');
    
    // 1. 创建动态
    console.log('1. 创建动态...');
    await api.createPost(token, { content: '测试动态' });
    console.log('✅ 创建动态成功\n');
    
    // 2. 获取动态列表
    console.log('2. 获取动态列表...');
    const posts = await api.getPosts(token);
    console.log('✅ 获取动态列表成功\n');
    
    // 3. 点赞动态
    console.log('3. 点赞动态...');
    if (posts && posts.length > 0) {
      await api.likePost(token, posts[0].id);
      console.log('✅ 点赞动态成功\n');
    }
    
    console.log('🎉 朋友圈核心流程完成！');
  } catch (error) {
    console.error('❌ 流程执行失败:', error.message);
  }
}

// 获取认证令牌
async function getAuthToken() {
  return new Promise((resolve, reject) => {
    // 注册用户
    const registerData = JSON.stringify({
      email: 'simple@test.com',
      password: '123456'
    });

    const registerOptions = {
      hostname: 'localhost',
      port: 3007,
      path: '/api/auth/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(registerData)
      }
    };

    const registerReq = http.request(registerOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 201) {
          console.log('✅ 用户注册成功');
          // 登录用户
          const loginData = JSON.stringify({
            email: 'simple@test.com',
            password: '123456'
          });

          const loginOptions = {
            hostname: 'localhost',
            port: 3007,
            path: '/api/auth/login',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(loginData)
            }
          };

          const loginReq = http.request(loginOptions, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
              data += chunk;
            });
            
            res.on('end', () => {
              if (res.statusCode === 200) {
                try {
                  const response = JSON.parse(data);
                  console.log('✅ 用户登录成功');
                  resolve(response.data.accessToken);
                } catch (e) {
                  reject(new Error('无法解析登录响应数据'));
                }
              } else {
                reject(new Error(`登录失败，状态码: ${res.statusCode}`));
              }
            });
          });

          loginReq.on('error', (error) => {
            reject(error);
          });

          loginReq.write(loginData);
          loginReq.end();
        } else {
          reject(new Error(`注册失败，状态码: ${res.statusCode}`));
        }
      });
    });

    registerReq.on('error', (error) => {
      reject(error);
    });

    registerReq.write(registerData);
    registerReq.end();
  });
}

// 模拟API客户端
const api = {
  // 创建动态
  createPost: async (token, data) => {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(data);
      
      const options = {
        hostname: 'localhost',
        port: 3007,
        path: '/api/posts',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `accessToken=${token}`,
          'Content-Length': Buffer.byteLength(postData)
        }
      };
      
      const req = http.request(options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode === 201) {
            resolve(JSON.parse(responseData));
          } else {
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
  },
  
  // 获取动态列表
  getPosts: async (token) => {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 3007,
        path: '/api/posts',
        method: 'GET',
        headers: {
          'Cookie': `accessToken=${token}`
        }
      };
      
      const req = http.request(options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode === 200) {
            const data = JSON.parse(responseData);
            resolve(data.data.posts);
          } else {
            reject(new Error(`获取动态列表失败，状态码: ${res.statusCode}`));
          }
        });
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      req.end();
    });
  },
  
  // 点赞动态
  likePost: async (token, postId) => {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 3007,
        path: `/api/posts/${postId}/likes`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `accessToken=${token}`,
          'Content-Length': 0
        }
      };
      
      const req = http.request(options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode === 200) {
            resolve(JSON.parse(responseData));
          } else {
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
};

// 执行测试
runSocialFlow();