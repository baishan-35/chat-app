"use client";

import { useState, useRef, useEffect } from "react";
import { IPost, IComment } from "@/types/social";
import { useSocialStore } from "@/stores/useSocialStore";
import { SocialService } from "@/services/socialService";

interface SocialPostProps {
  post: IPost;
}

// 懒加载图片组件
const LazyImage = ({ src, alt, className }: { src: string; alt: string; className?: string }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px' // 提前50px开始加载
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={imgRef} className={`relative ${className}`}>
      {isInView ? (
        <img
          src={src}
          alt={alt}
          className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
          onLoad={() => setIsLoaded(true)}
          loading="lazy"
        />
      ) : (
        <div className={`${className} bg-gray-200 animate-pulse`} />
      )}
      {!isLoaded && isInView && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
        </div>
      )}
    </div>
  );
};

export default function SocialPost({ post: initialPost }: SocialPostProps) {
  const { currentUser } = useSocialStore();
  const [post, setPost] = useState<IPost>(initialPost);
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [loading, setLoading] = useState(false);

  // 检查当前用户是否已点赞
  const isLiked = post.likes.some(like => like.user.id === currentUser?.id);

  // 处理点赞/取消点赞
  const handleLike = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      if (isLiked) {
        // 取消点赞
        const response = await SocialService.unlikePost({ postId: post.id });
        if (response.success) {
          const likeId = post.likes.find(like => like.user.id === currentUser.id)?.id;
          if (likeId) {
            useSocialStore.getState().removeLike(post.id, likeId);
            setPost(prev => ({
              ...prev,
              likes: prev.likes.filter(like => like.user.id !== currentUser.id)
            }));
          }
        }
      } else {
        // 点赞
        const response = await SocialService.likePost({ postId: post.id });
        if (response.success) {
          const newLike = {
            id: `like_${Date.now()}`,
            user: currentUser,
            createdAt: new Date()
          };
          
          useSocialStore.getState().addLike(post.id, newLike);
          setPost(prev => ({
            ...prev,
            likes: [...prev.likes, newLike]
          }));
        }
      }
    } catch (error) {
      console.error("点赞操作失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 处理添加评论
  const handleAddComment = async () => {
    if (!newComment.trim() || !currentUser) return;
    
    setLoading(true);
    try {
      const response = await SocialService.addComment({
        postId: post.id,
        content: newComment
      });
      
      if (response.success && response.data) {
        useSocialStore.getState().addComment(post.id, response.data);
        setPost(prev => ({
          ...prev,
          comments: [...prev.comments, response.data!]
        }));
        setNewComment("");
      }
    } catch (error) {
      console.error("添加评论失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 处理删除帖子
  const handleDeletePost = async () => {
    if (!currentUser || post.author.id !== currentUser.id) return;
    
    if (confirm("确定要删除这条朋友圈吗？")) {
      setLoading(true);
      try {
        const response = await SocialService.deletePost(post.id);
        if (response.success) {
          useSocialStore.getState().removePost(post.id);
        }
      } catch (error) {
        console.error("删除帖子失败:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  // 格式化时间
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      {/* 帖子头部 */}
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          {post.author.avatar ? (
            <LazyImage 
              src={post.author.avatar} 
              alt={post.author.name} 
              className="w-10 h-10 rounded-full mr-3"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-300 mr-3 flex items-center justify-center">
              <span className="text-gray-600 font-medium">
                {post.author.name.charAt(0)}
              </span>
            </div>
          )}
          <div>
            <h3 className="font-medium text-gray-900">{post.author.name}</h3>
            <p className="text-xs text-gray-500">{formatTime(post.createdAt)}</p>
          </div>
        </div>
        
        {currentUser && post.author.id === currentUser.id && (
          <button 
            onClick={handleDeletePost}
            disabled={loading}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
      
      {/* 帖子内容 */}
      <div className="mt-3">
        <p className="text-gray-800">{post.content}</p>
      </div>
      
      {/* 帖子图片 */}
      {post.images && post.images.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {post.images.map((image, index) => (
            <LazyImage 
              key={index} 
              src={image} 
              alt={`图片${index + 1}`} 
              className="rounded-lg object-cover w-full h-40"
            />
          ))}
        </div>
      )}
      
      {/* 帖子统计 */}
      <div className="mt-3 flex items-center text-sm text-gray-500">
        <span>{post.likes.length} 个赞</span>
        <span className="mx-2">·</span>
        <span>{post.comments.length} 条评论</span>
      </div>
      
      {/* 操作按钮 */}
      <div className="mt-3 flex border-t border-b border-gray-100 py-2">
        <button
          onClick={handleLike}
          disabled={loading}
          className={`flex-1 flex items-center justify-center py-2 rounded-md transition-colors ${
            isLiked 
              ? 'text-red-500 hover:bg-red-50' 
              : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          <svg 
            className={`w-5 h-5 mr-1 ${isLiked ? 'fill-current' : ''}`} 
            fill={isLiked ? 'currentColor' : 'none'} 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          {isLiked ? '已赞' : '赞'}
        </button>
        
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex-1 flex items-center justify-center py-2 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          评论
        </button>
      </div>
      
      {/* 评论区域 */}
      {showComments && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          {/* 添加评论 */}
          <div className="flex items-center mb-3">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="写评论..."
              className="flex-1 border border-gray-300 rounded-full py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              disabled={loading}
            />
            <button
              onClick={handleAddComment}
              disabled={!newComment.trim() || loading}
              className={`ml-2 px-4 py-2 rounded-full text-sm font-medium ${
                newComment.trim() && !loading
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              发送
            </button>
          </div>
          
          {/* 评论列表 */}
          <div className="space-y-3">
            {post.comments.map((comment) => (
              <div key={comment.id} className="flex">
                <div className="mr-3">
                  {comment.author.avatar ? (
                    <LazyImage 
                      src={comment.author.avatar} 
                      alt={comment.author.name} 
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-gray-600 text-xs font-medium">
                        {comment.author.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="bg-gray-100 rounded-lg px-3 py-2">
                    <div className="flex items-center">
                      <span className="font-medium text-sm text-gray-900">
                        {comment.author.name}
                      </span>
                    </div>
                    <p className="text-gray-800 text-sm mt-1">{comment.content}</p>
                  </div>
                  <div className="flex items-center mt-1 text-xs text-gray-500">
                    <span>{formatTime(comment.createdAt)}</span>
                    <button className="ml-3 text-gray-500 hover:text-indigo-600">
                      回复
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}