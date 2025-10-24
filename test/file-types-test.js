// 文件类型测试
const http = require('http');
const fs = require('fs');

console.log('开始文件类型测试...\n');

// 首先注册并登录用户以获取JWT令牌
async function getAuthToken() {
  return new Promise((resolve, reject) => {
    // 注册用户
    const registerData = JSON.stringify({
      email: 'filetypes@test.com',
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
            email: 'filetypes@test.com',
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

// 测试不同文件类型的上传
async function testFileUpload(token, fileName, mimeType, fileContent) {
  return new Promise((resolve, reject) => {
    const boundary = '----FormDataBoundary' + Math.random().toString(36).substring(2);
    
    // 构造multipart/form-data请求体
    let body = '';
    body += `--${boundary}\r\n`;
    body += 'Content-Disposition: form-data; name="content"\r\n\r\n';
    body += `测试动态内容 - ${fileName}\r\n`;
    body += `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="images"; filename="${fileName}"\r\n`;
    body += `Content-Type: ${mimeType}\r\n\r\n`;
    body += fileContent + '\r\n';
    body += `--${boundary}--\r\n`;
    
    const options = {
      hostname: 'localhost',
      port: 3007,
      path: '/api/posts',
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Cookie': `accessToken=${token}`,
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`=== ${fileName} 上传测试 ===`);
        console.log('状态码:', res.statusCode);
        // console.log('响应数据:', data);
        
        if (res.statusCode === 201) {
          console.log(`✅ ${fileName} 上传成功\n`);
          resolve(true);
        } else {
          console.log(`❌ ${fileName} 上传失败\n`);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.log(`❌ ${fileName} 上传失败:`, error.message);
      resolve(false);
    });

    req.write(body);
    req.end();
  });
}

// 执行测试
async function runTest() {
  try {
    // 获取认证令牌
    console.log('正在获取认证令牌...');
    const token = await getAuthToken();
    console.log('认证令牌获取成功\n');
    
    // 测试支持的文件类型
    const testFiles = [
      {
        name: 'test.jpg',
        mime: 'image/jpeg',
        content: 'JPEG文件内容'
      },
      {
        name: 'test.png',
        mime: 'image/png',
        content: 'PNG文件内容'
      },
      {
        name: 'test.pdf',
        mime: 'application/pdf',
        content: 'PDF文件内容'
      },
      {
        name: 'test.doc',
        mime: 'application/msword',
        content: 'DOC文件内容'
      }
    ];
    
    let successCount = 0;
    for (const file of testFiles) {
      const success = await testFileUpload(token, file.name, file.mime, file.content);
      if (success) {
        successCount++;
      }
    }
    
    console.log(`🎉 文件类型测试完成！${successCount}/${testFiles.length} 个文件上传成功`);
    
    if (successCount === testFiles.length) {
      console.log('✅ 所有文件类型测试通过');
    } else {
      console.log('❌ 部分文件类型测试失败');
    }
    
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
runTest();