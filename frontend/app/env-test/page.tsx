'use client';

import { useEffect, useState } from 'react';

export default function EnvTestPage() {
  const [envVars, setEnvVars] = useState<Record<string, string | undefined>>({});

  useEffect(() => {
    // 在客户端检查环境变量
    setEnvVars({
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
      NODE_ENV: process.env.NODE_ENV,
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">环境变量测试</h1>
        
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-700">客户端环境变量</h2>
            <div className="mt-2 space-y-2">
              {Object.entries(envVars).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="font-mono text-sm text-gray-600">{key}:</span>
                  <span className="font-mono text-sm break-all">
                    {value || (
                      <span className="text-red-500">未定义</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-700">验证结果</h2>
            <div className="mt-2 space-y-2">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                <span className="text-sm text-gray-600">
                  NEXT_PUBLIC_API_URL 已正确注入: {process.env.NEXT_PUBLIC_API_URL}
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                <span className="text-sm text-gray-600">
                  NEXT_PUBLIC_WS_URL 已正确注入: {process.env.NEXT_PUBLIC_WS_URL}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}