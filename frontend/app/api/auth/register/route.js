// app/api/auth/register/route.js
// 注册API端点 - 代理到后端服务器

export async function POST(request) {
  try {
    // 获取请求体
    const body = await request.json();
    
    // 从环境变量获取后端URL
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3007';
    
    // 构造后端API URL
    const backendApiUrl = `${backendUrl}/api/auth/register`;
    
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
    const headers = new Headers(response.headers);
    
    // 返回后端响应
    return new Response(
      JSON.stringify(data),
      {
        status: response.status,
        headers: {
          'Content-Type': 'application/json',
          ...Object.fromEntries(headers.entries())
        }
      }
    );
  } catch (error) {
    console.error('注册API错误:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: '服务器内部错误'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}