"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, checkAuthStatus } = useAuthStore();

  useEffect(() => {
    // 检查认证状态
    checkAuthStatus();
  }, [checkAuthStatus]);

  // 如果未认证且不在公开页面，则重定向到登录页
  useEffect(() => {
    if (!isAuthenticated && !pathname.startsWith("/login")) {
      router.push("/login");
    }
  }, [isAuthenticated, pathname, router]);

  // 对于公共路由，直接渲染内容
  const publicRoutes = ["/login", "/register"];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  if (!isAuthenticated && !isPublicRoute) {
    return <div className="min-h-screen flex items-center justify-center">加载中...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="font-bold text-xl">我的应用</span>
              </div>
            </div>
            <div className="flex items-center">
              {isAuthenticated && (
                <button
                  onClick={() => {
                    useAuthStore.getState().logout();
                    router.push("/login");
                  }}
                  className="ml-4 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  退出登录
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}