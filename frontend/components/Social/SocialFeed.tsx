"use client";

import { useEffect, useState } from "react";
import { useSocialStore } from "@/stores/useSocialStore";
import { SocialService } from "@/services/socialService";
import CreatePost from "./CreatePost";
import SocialPost from "./SocialPost";

export default function SocialFeed() {
  const { posts, loading, error, setPosts, setLoading, setError } = useSocialStore();
  const [initialLoading, setInitialLoading] = useState(true);

  // 加载帖子数据
  useEffect(() => {
    const loadPosts = async () => {
      setInitialLoading(true);
      setLoading(true);
      setError(null);
      
      try {
        const response = await SocialService.getPosts();
        if (response.success && response.data) {
          // 修正：正确设置帖子数据
          setPosts(response.data.posts);
        } else {
          setError(response.error || "加载失败");
        }
      } catch (err) {
        setError("网络错误，请稍后重试");
        console.error("加载帖子失败:", err);
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    };

    loadPosts();
  }, [setPosts, setLoading, setError]);

  // 按时间倒序排列帖子
  const sortedPosts = [...posts].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* 发布区域 */}
      <CreatePost />
      
      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}
      
      {/* 帖子列表 */}
      {sortedPosts.length > 0 ? (
        <div>
          {sortedPosts.map((post) => (
            <SocialPost key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">暂无朋友圈</h3>
          <p className="mt-1 text-sm text-gray-500">发布你的第一条朋友圈吧</p>
        </div>
      )}
      
      {/* 加载更多 */}
      {loading && !initialLoading && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
        </div>
      )}
    </div>
  );
}