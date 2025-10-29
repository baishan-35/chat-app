import { NextResponse } from 'next/server';

// 模拟消息存储（在实际应用中应该使用数据库）
let messages = [
  {
    id: '1',
    type: 'chat_message',
    data: {
      content: '欢迎来到聊天室！',
      senderId: 'system',
      senderName: '系统',
      timestamp: new Date().toISOString()
    }
  }
];

// 模拟新消息生成（仅用于测试）
let messageIdCounter = 2;

// 生成测试消息的函数
function generateTestMessage() {
  const testMessages = [
    '这是一条测试消息',
    'Hello World!',
    '欢迎使用实时聊天功能',
    '系统正在运行中',
    '这是一个演示消息'
  ];
  
  const randomMessage = testMessages[Math.floor(Math.random() * testMessages.length)];
  
  const id = messageIdCounter.toString();
  messageIdCounter++;
  
  return {
    id: id,
    type: 'chat_message',
    data: {
      content: randomMessage,
      senderId: 'system',
      senderName: '系统',
      timestamp: new Date().toISOString()
    }
  };
}

// 定期生成测试消息（仅用于测试）
if (process.env.NODE_ENV === 'development') {
  setInterval(() => {
    // 每10秒生成一条测试消息
    messages.push(generateTestMessage());
    
    // 保持消息数量在合理范围内
    if (messages.length > 100) {
      messages = messages.slice(-50);
    }
  }, 10000);
}

// 处理CORS头
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

/**
 * GET /api/messages
 * 获取消息列表
 */
export async function GET(request) {
  try {
    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const lastMessageId = searchParams.get('lastMessageId');
    
    console.log('收到获取消息请求，lastMessageId:', lastMessageId);
    
    // 验证认证令牌
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: '缺少认证令牌' },
        { status: 401, headers: corsHeaders }
      );
    }
    
    // 在实际应用中，这里应该验证令牌
    const token = authHeader.substring(7);
    console.log('认证令牌:', token.substring(0, 10) + '...');
    
    // 过滤消息（只返回新消息）
    let filteredMessages = messages;
    if (lastMessageId) {
      const lastIndex = messages.findIndex(msg => msg.id === lastMessageId);
      if (lastIndex !== -1) {
        filteredMessages = messages.slice(lastIndex + 1);
      }
    }
    
    console.log(`返回 ${filteredMessages.length} 条消息`);
    
    return NextResponse.json(
      { 
        success: true, 
        messages: filteredMessages,
        count: filteredMessages.length
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('获取消息时出错:', error);
    return NextResponse.json(
      { success: false, message: '服务器内部错误: ' + error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * POST /api/messages
 * 发送消息
 */
export async function POST(request) {
  try {
    console.log('收到发送消息请求');
    
    // 验证认证令牌
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: '缺少认证令牌' },
        { status: 401, headers: corsHeaders }
      );
    }
    
    // 在实际应用中，这里应该验证令牌
    const token = authHeader.substring(7);
    console.log('认证令牌:', token.substring(0, 10) + '...');
    
    // 解析请求体
    const body = await request.json();
    console.log('消息内容:', body);
    
    // 验证消息格式
    if (!body.type || !body.data) {
      return NextResponse.json(
        { success: false, message: '消息格式错误' },
        { status: 400, headers: corsHeaders }
      );
    }
    
    // 创建消息对象
    const id = messageIdCounter.toString();
    messageIdCounter++;
    
    const message = {
      id: id,
      type: body.type,
      data: {
        ...body.data,
        senderId: 'user', // 在实际应用中应该从令牌中获取用户ID
        senderName: '用户', // 在实际应用中应该从令牌中获取用户名
        timestamp: new Date().toISOString()
      }
    };
    
    // 存储消息
    messages.push(message);
    
    // 保持消息数量在合理范围内
    if (messages.length > 100) {
      messages = messages.slice(-50);
    }
    
    console.log('消息发送成功:', message);
    
    return NextResponse.json(
      { 
        success: true, 
        data: message,
        message: '消息发送成功'
      },
      { status: 201, headers: corsHeaders }
    );
  } catch (error) {
    console.error('发送消息时出错:', error);
    return NextResponse.json(
      { success: false, message: '服务器内部错误: ' + error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * OPTIONS /api/messages
 * 处理预检请求
 */
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}