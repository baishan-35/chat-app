import { NextResponse } from 'next/server'

// 处理CORS头
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// 模拟用户数据库
const mockUsers = [
  {
    id: 1,
    email: 'test@example.com',
    password: 'password123',
    name: '测试用户',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test'
  },
  {
    id: 2,
    email: 'admin@example.com',
    password: 'admin123',
    name: '管理员',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
  },
  {
    id: 3,
    email: 'user@example.com',
    password: 'user123',
    name: '普通用户',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'
  }
]

// 生成模拟JWT token
function generateMockToken(userId) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64')
  const payload = Buffer.from(JSON.stringify({
    userId: userId,
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24小时过期
  })).toString('base64')
  const signature = Buffer.from('mock-signature-' + userId).toString('base64')
  return `${header}.${payload}.${signature}`
}

export async function POST(request) {
  try {
    console.log('收到登录请求');
    
    // 获取请求体
    let body;
    try {
      const requestContentType = request.headers.get('content-type');
      
      if (requestContentType && requestContentType.includes('application/json')) {
        body = await request.json();
      } else {
        const bodyText = await request.text();
        if (bodyText) {
          body = JSON.parse(bodyText);
        } else {
          throw new Error('请求体为空');
        }
      }
    } catch (parseError) {
      console.error('请求体解析错误:', parseError);
      return NextResponse.json(
        { 
          success: false, 
          message: '请求格式错误，请确保发送有效的JSON数据' 
        },
        { status: 400, headers: corsHeaders }
      );
    }
    
    // 验证必填字段
    const { email, password } = body || {};
    
    if (!email || !password) {
      console.log('缺少必填字段');
      return NextResponse.json(
        { 
          success: false, 
          message: '请提供邮箱和密码' 
        },
        { status: 400, headers: corsHeaders }
      );
    }
    
    console.log('登录尝试 - 邮箱:', email);
    
    // 查找用户
    const user = mockUsers.find(u => u.email === email && u.password === password);
    
    if (!user) {
      console.log('登录失败 - 邮箱或密码错误');
      return NextResponse.json(
        { 
          success: false, 
          message: '邮箱或密码错误' 
        },
        { status: 401, headers: corsHeaders }
      );
    }
    
    // 登录成功，生成token
    const token = generateMockToken(user.id);
    
    // 返回用户信息（不包含密码）
    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar
    };
    
    console.log('登录成功 - 用户ID:', user.id);
    
    return NextResponse.json(
      {
        success: true,
        message: '登录成功',
        data: {
          user: userResponse,
          accessToken: token,
          tokenType: 'Bearer',
          expiresIn: 86400 // 24小时，单位：秒
        }
      },
      { status: 200, headers: corsHeaders }
    );
    
  } catch (error) {
    console.error('登录API错误:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: '服务器内部错误，请稍后重试' 
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

// 处理OPTIONS请求（预检请求）
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}