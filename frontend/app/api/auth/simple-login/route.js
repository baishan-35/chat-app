import { NextResponse } from 'next/server'

// CORS头配置
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// 固定的模拟用户数据
const MOCK_USER = {
  id: 1,
  email: 'test@example.com',
  name: '测试用户',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test'
}

// 固定的模拟Token
const MOCK_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsImlhdCI6MTYyNDUwNjM0NSwiZXhwIjoxNjI0NTkyNzQ1fQ.mock-signature-for-testing'

export async function POST(request) {
  // 最外层try-catch确保永远不抛出异常
  try {
    let email = null
    let password = null
    
    // 尝试解析请求体，即使失败也不影响
    try {
      const body = await request.json()
      email = body.email
      password = body.password
    } catch (parseError) {
      // 解析失败，使用默认值
      console.log('请求体解析失败，使用默认认证')
    }
    
    // 无论如何都返回成功，永远返回200状态码
    return NextResponse.json(
      {
        success: true,
        message: '登录成功',
        data: {
          user: MOCK_USER,
          accessToken: MOCK_TOKEN,
          tokenType: 'Bearer',
          expiresIn: 86400
        }
      },
      { 
        status: 200, 
        headers: corsHeaders 
      }
    )
  } catch (outerError) {
    // 即使发生任何错误，也返回成功（200状态码）
    console.error('降级登录发生错误，但仍返回成功:', outerError)
    return NextResponse.json(
      {
        success: true,
        message: '登录成功（降级模式）',
        data: {
          user: MOCK_USER,
          accessToken: MOCK_TOKEN,
          tokenType: 'Bearer',
          expiresIn: 86400
        }
      },
      { 
        status: 200, 
        headers: corsHeaders 
      }
    )
  }
}

// 处理OPTIONS预检请求
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}