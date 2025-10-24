"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";

export default function DebugPage() {
  const { user, accessToken, isAuthenticated } = useAuthStore();
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    // 获取localStorage中的认证信息
    const authStorage = localStorage.getItem("auth-storage");
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        setDebugInfo(parsed);
      } catch (error) {
        setDebugInfo({ error: "无法解析存储的认证信息" });
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">调试信息</h1>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">当前状态</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">是否认证</p>
                <p className="text-lg font-semibold">{isAuthenticated ? "是" : "否"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">用户信息</p>
                <pre className="text-sm bg-gray-100 p-2 rounded">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">访问令牌</p>
                <p className="text-sm bg-gray-100 p-2 rounded">
                  {accessToken ? `${accessToken.substring(0, 20)}...` : "无"}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">本地存储信息</h2>
            <pre className="text-sm bg-gray-100 p-4 rounded">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}