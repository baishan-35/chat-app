import { NextResponse } from 'next/server'

// 处理CORS头
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function POST(request) {
  try {
    const { email, password, name } = await request.json()
    
    // 这里应该是你的注册逻辑
    console.log('Register attempt:', email)
    
    // 模拟注册成功
    if (email && password) {
      return NextResponse.json({
        success: true,
        token: 'mock-jwt-token-for-vercel',
        user: { id: Date.now(), email, name: name || 'New User' }
      }, {
        headers: corsHeaders
      })
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid registration data' },
        { status: 400, headers: corsHeaders }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    )
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