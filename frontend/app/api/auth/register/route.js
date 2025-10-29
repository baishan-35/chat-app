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
      console.error('后端服务URL未配置，请检查环境变量设置');
      return NextResponse.json(
        { success: false, message: '后端服务URL未配置，请检查环境变量设置' },
        { status: 500, headers: corsHeaders }
      );
    }
    
    // 验证后端URL格式
    try {
      new URL(backendUrl);
    } catch (urlError) {
      console.error('后端服务URL格式错误:', backendUrl, urlError);
      return NextResponse.json(
        { success: false, message: '后端服务URL格式错误: ' + backendUrl },
        { status: 500, headers: corsHeaders }
      );
    }
    
    // 构造后端API URL
    const backendApiUrl = `${backendUrl}/api/auth/register`;
    console.log('构造的后端API URL:', backendApiUrl);
    
    // 准备转发请求的选项
    const fetchOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    };
    
    console.log('转发请求选项:', JSON.stringify(fetchOptions, null, 2));
    
    // 转发请求到后端服务器
    let response;
    try {
      response = await fetch(backendApiUrl, fetchOptions);
      console.log('后端响应状态:', response.status);
    } catch (fetchError) {
      console.error('转发请求失败:', fetchError);
      return NextResponse.json(
        { success: false, message: '无法连接到后端服务: ' + fetchError.message },
        { status: 500, headers: corsHeaders }
      );
    }
    
    // 获取后端响应
    let data;
    try {
      data = await response.json();
      console.log('后端响应数据:', data);
    } catch (responseError) {
      console.error('解析后端响应失败:', responseError);
      // 尝试获取文本响应
      try {
        const text = await response.text();
        console.log('后端响应文本:', text);
        return NextResponse.json(
          { success: false, message: '后端返回非JSON响应: ' + text },
          { status: 500, headers: corsHeaders }
        );
      } catch (textError) {
        console.error('获取后端响应文本失败:', textError);
        return NextResponse.json(
          { success: false, message: '无法获取后端响应' },
          { status: 500, headers: corsHeaders }
        );
      }
    }
    
    // 返回后端响应
    return NextResponse.json(data, {
      status: response.status,
      headers: corsHeaders
    });
  } catch (error) {
    console.error('注册API错误:', error);
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