// 消息收发功能测试脚本
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

console.log('开始测试消息收发功能...');

// 生成两个测试用户的JWT令牌
const secret = process.env.JWT_SECRET || 'default_secret_key_for_development';

const userA = {
  userId: 'userA',
  name: '用户A'
};

const userB = {
  userId: 'userB',
  name: '用户B'
};

const tokenA = jwt.sign(userA, secret, { expiresIn: '1h' });
const tokenB = jwt.sign(userB, secret, { expiresIn: '1h' });

console.log('用户A令牌:', tokenA);
console.log('用户B令牌:', tokenB);

// 创建两个WebSocket连接
const wsA = new WebSocket(`ws://localhost:3002?token=${tokenA}`);
const wsB = new WebSocket(`ws://localhost:3002?token=${tokenB}`);

// 用户A的连接处理
wsA.on('open', function open() {
  console.log('用户A连接成功');
  
  // 等待连接建立后发送消息
  setTimeout(() => {
    console.log('用户A发送消息: "Hello, 这是测试消息"');
    wsA.send(JSON.stringify({
      type: 'chat_message',
      data: {
        content: 'Hello, 这是测试消息'
      }
    }));
  }, 1000);
});

wsA.on('message', function message(data) {
  const msg = JSON.parse(data.toString());
  console.log('用户A收到消息:', msg.type, msg.data?.content || msg.data?.message);
});

wsA.on('error', function error(err) {
  console.log('用户A连接错误:', err.message);
});

wsA.on('close', function close() {
  console.log('用户A连接已关闭');
});

// 用户B的连接处理
wsB.on('open', function open() {
  console.log('用户B连接成功');
});

wsB.on('message', function message(data) {
  const msg = JSON.parse(data.toString());
  console.log('用户B收到消息:', msg.type, msg.data?.content || msg.data?.message);
  
  // 如果收到用户A的消息，则回复
  if (msg.type === 'chat_message' && msg.data?.content === 'Hello, 这是测试消息') {
    setTimeout(() => {
      console.log('用户B回复消息: "收到你的消息了"');
      wsB.send(JSON.stringify({
        type: 'chat_message',
        data: {
          content: '收到你的消息了'
        }
      }));
    }, 1000);
  }
});

wsB.on('error', function error(err) {
  console.log('用户B连接错误:', err.message);
});

wsB.on('close', function close() {
  console.log('用户B连接已关闭');
});

// 设置测试超时
setTimeout(() => {
  console.log('测试完成，关闭连接');
  wsA.close();
  wsB.close();
}, 10000);