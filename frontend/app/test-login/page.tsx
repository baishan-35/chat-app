"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";

export default function TestLoginPage() {
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("password123");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const router = useRouter();
  const { login } = useAuthStore();

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      // 检查响应状态
      if (!response.ok) {
        setResult({
          error: `HTTP错误: ${response.status}`,
          status: response.status,
          statusText: response.statusText
        });
        return;
      }

      // 检查响应内容类型
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        setResult({
          error: "服务器返回非JSON响应",
          contentType: contentType,
          responseText: text
        });
        return;
      }

      const data = await response.json();
      setResult(data);

      if (response.ok) {
        // 更新认证状态
        login(data.data.user, data.data.accessToken);
        
        // 等待一小段时间确保状态保存到localStorage
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 跳转到仪表板
        router.push("/dashboard");
      }
    } catch (error: any) {
      console.error("登录错误:", error);
      setResult({ 
        error: error.message,
        type: "network_error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            测试登录
          </h2>
        </div>
        
        <div className="mt-8 space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              邮箱
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              密码
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? "登录中..." : "登录"}
            </button>
          </div>
        </div>
        
        {result && (
          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">响应结果</h3>
              <pre className="text-sm bg-gray-100 p-4 rounded overflow-x-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}