const http = require('http');
const WebSocket = require('ws');

console.log('开始执行WebSocket连接测试...\n');

// 首先注册用户以获取JWT令牌
function registerUser() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      email: 'websocket@test.com',
      password: '123456'
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
        if (res.statusCode === 201) {
          try {
            const response = JSON.parse(data);
            console.log('✅ 用户注册成功');
            resolve(response.data.accessToken);
          } catch (e) {
            reject(new Error('无法解析注册响应数据'));
          }
        } else {
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

// 测试WebSocket连接
async function testWebSocketConnection() {
  try {
    // 获取JWT令牌
    console.log('正在注册用户以获取JWT令牌...');
    const token = await registerUser();
    console.log('JWT令牌获取成功\n');
    
    // 创建WebSocket连接
    console.log('正在连接WebSocket服务器...');
    // 注意：WebSocket服务器运行在3002端口，但用户要求连接3001端口
    // 我们先尝试连接3001端口，如果失败再尝试3002端口
    const wsUrl = `ws://localhost:3001?token=${token}`;
    console.log(`连接地址: ${wsUrl}`);
    
    const ws = new WebSocket(wsUrl);
    
    // 设置连接超时
    const connectionTimeout = setTimeout(() => {
      console.log('❌ WebSocket连接超时');
      ws.close();
      process.exit(1);
    }, 5000);
    
    ws.on('open', () => {
      clearTimeout(connectionTimeout);
      console.log('✅ WebSocket连接成功');
      
      // 监听服务器响应
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data);
          console.log('收到服务器消息:', JSON.stringify(message, null, 2));
          
          // 如果收到连接确认消息，测试完成
          if (message.type === 'connection_ack') {
            console.log('🎉 WebSocket连接测试完成');
            ws.close();
            process.exit(0);
          }
        } catch (error) {
          console.log('收到非JSON消息:', data.toString());
        }
      });
    });
    
    ws.on('error', (error) => {
      clearTimeout(connectionTimeout);
      console.log('❌ WebSocket连接错误:', error.message);
      
      // 如果3001端口连接失败，尝试3002端口
      if (error.code === 'ECONNREFUSED') {
        console.log('正在尝试连接3002端口...');
        const wsUrl3002 = `ws://localhost:3002?token=${token}`;
        console.log(`连接地址: ${wsUrl3002}`);
        
        const ws2 = new WebSocket(wsUrl3002);
        
        const connectionTimeout2 = setTimeout(() => {
          console.log('❌ WebSocket连接3002端口也失败');
          ws2.close();
          process.exit(1);
        }, 5000);
        
        ws2.on('open', () => {
          clearTimeout(connectionTimeout2);
          console.log('✅ WebSocket连接3002端口成功');
          
          // 监听服务器响应
          ws2.on('message', (data) => {
            try {
              const message = JSON.parse(data);
              console.log('收到服务器消息:', JSON.stringify(message, null, 2));
              
              // 如果收到连接确认消息，测试完成
              if (message.type === 'connection_ack') {
                console.log('🎉 WebSocket连接测试完成');
                ws2.close();
                process.exit(0);
              }
            } catch (error) {
              console.log('收到非JSON消息:', data.toString());
            }
          });
        });
        
        ws2.on('error', (error) => {
          clearTimeout(connectionTimeout2);
          console.log('❌ WebSocket连接3002端口也失败:', error.message);
          process.exit(1);
        });
      } else {
        process.exit(1);
      }
    });
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
    process.exit(1);
  }
}

// 执行测试
testWebSocketConnection();