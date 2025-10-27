import { NextResponse } from 'next/server'

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
      })
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid registration data' },
        { status: 400 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
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