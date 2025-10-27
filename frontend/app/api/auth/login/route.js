import { NextResponse } from 'next/server'

// 处理CORS头
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function POST(request) {
  try {
    // 获取请求体
    const body = await request.json();
    
    // 从环境变量获取后端URL，生产环境必须通过环境变量配置
    const backendUrl = process.env.BACKEND_URL;
    
    // 如果没有配置后端URL，返回错误
    if (!backendUrl) {
      return NextResponse.json(
        { success: false, message: '后端服务URL未配置' },
        { status: 500, headers: corsHeaders }
      );
    }
    
    // 构造后端API URL
    const backendApiUrl = `${backendUrl}/api/auth/login`;
    
    // 转发请求到后端服务器
    const response = await fetch(backendApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    // 获取后端响应
    const data = await response.json();
    
    // 返回后端响应
    return NextResponse.json(data, {
      status: response.status,
      headers: corsHeaders
    });
  } catch (error) {
    console.error('登录API错误:', error);
    return NextResponse.json(
      { success: false, message: '服务器内部错误' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// 处理OPTIONS请求（预检请求）
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

// 明确声明支持的HTTP方法
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}

export async function PATCH() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}