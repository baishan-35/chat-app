'use client';

import { useEffect, useState } from 'react';

export default function EnvironmentCheckPage() {
  const [envVars, setEnvVars] = useState<Record<string, string>>({});

  useEffect(() => {
    // 客户端环境变量检查
    setEnvVars({
      'NODE_ENV': process.env.NODE_ENV || '未设置',
      'NEXT_PUBLIC_API_URL': process.env.NEXT_PUBLIC_API_URL || '未设置',
      'NEXT_PUBLIC_WS_URL': process.env.NEXT_PUBLIC_WS_URL || '未设置',
      'NEXT_PUBLIC_VERCEL_ENV': process.env.NEXT_PUBLIC_VERCEL_ENV || '未设置',
      'BACKEND_URL': process.env.BACKEND_URL || '未设置 (仅服务端可用)',
    });
  }, []);

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">环境变量检查</h1>
      
      <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">客户端环境变量</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(envVars).map(([key, value]) => (
            <div key={key} className="border rounded p-4">
              <h3 className="font-medium text-lg mb-2">{key}</h3>
              <p className="text-gray-600 break-all">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">部署说明</h2>
        <div className="prose max-w-none">
          <h3>在Vercel中设置环境变量</h3>
          <ol className="list-decimal pl-5 space-y-2">
            <li>登录Vercel控制台</li>
            <li>进入您的项目</li>
            <li>点击"Settings"选项卡</li>
            <li>在左侧菜单中选择"Environment Variables"</li>
            <li>添加以下环境变量：</li>
          </ol>
          
          <h4 className="mt-4">必需的环境变量</h4>
          <ul className="list-disc pl-5 space-y-2">
            <li><code>NODE_ENV</code> = <code>production</code></li>
            <li><code>NEXT_PUBLIC_API_URL</code> = <code>https://your-app.vercel.app</code></li>
            <li><code>NEXT_PUBLIC_WS_URL</code> = <code>wss://your-app.vercel.app</code></li>
            <li><code>NEXT_PUBLIC_VERCEL_ENV</code> = <code>production</code></li>
            <li><code>BACKEND_URL</code> = <code>https://your-backend-service.com</code></li>
            <li><code>JWT_SECRET</code> = <code>your_strong_random_jwt_secret_key_at_least_32_characters</code></li>
          </ul>
          
          <h4 className="mt-4">注意事项</h4>
          <ul className="list-disc pl-5 space-y-2">
            <li>设置完环境变量后需要重新部署项目</li>
            <li><code>JWT_SECRET</code> 应该是一个强随机字符串，至少32个字符</li>
            <li><code>BACKEND_URL</code> 应该指向您部署的后端服务</li>
            <li>所有URL都应该使用HTTPS协议</li>
          </ul>
        </div>
      </div>

      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">后端服务部署</h2>
        <div className="prose max-w-none">
          <p>由于Vercel不支持WebSocket，后端服务需要部署到支持WebSocket的平台：</p>
          
          <h3>推荐部署平台</h3>
          <ol className="list-decimal pl-5 space-y-2">
            <li><strong>Railway</strong> (推荐) - 原生WebSocket支持</li>
            <li><strong>Heroku</strong> - 成熟的平台，支持WebSocket</li>
            <li><strong>自建服务器</strong> - 完全控制，需要维护</li>
          </ol>
          
          <h3 className="mt-4">Railway部署步骤</h3>
          <ol className="list-decimal pl-5 space-y-2">
            <li>注册Railway账户</li>
            <li>创建新项目</li>
            <li>连接Git仓库</li>
            <li>配置环境变量：
              <ul className="list-disc pl-5 mt-2">
                <li><code>JWT_SECRET</code> = your_strong_random_jwt_secret_key_at_least_32_characters</li>
                <li><code>DATABASE_URL</code> = your_database_connection_string (如果使用数据库)</li>
              </ul>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}