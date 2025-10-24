"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { useSocialStore } from "@/stores/useSocialStore";
import SocialFeed from "@/components/Social/SocialFeed";

export default function SocialPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { setCurrentUser } = useSocialStore();

  // 设置当前用户
  useEffect(() => {
    if (user) {
      setCurrentUser({
        id: user.id,
        name: user.name || '未知用户',
        email: user.email || '',
        avatar: undefined // 可以从用户数据中获取头像URL
      });
    }
  }, [user, setCurrentUser]);

  // 检查认证状态
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">请先登录</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">朋友圈</h1>
        </div>
        
        <SocialFeed />
      </div>
    </div>
  );
}