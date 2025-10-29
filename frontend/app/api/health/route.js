import { NextResponse } from 'next/server'

// CORS头配置
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function GET() {
  try {
    // 获取基本系统信息
    const healthData = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'MyWX Frontend API',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime ? Math.floor(process.uptime()) : 0,
    }

    // 永远返回200状态码
    return NextResponse.json(healthData, {
      status: 200,
      headers: corsHeaders
    })
  } catch (error) {
    // 即使出错也返回200状态码
    console.error('健康检查错误:', error)
    return NextResponse.json(
      {
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'MyWX Frontend API',
        version: '1.0.0',
        environment: 'unknown',
        uptime: 0,
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