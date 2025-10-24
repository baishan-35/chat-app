import { IPost, CreatePostRequest, CreateCommentRequest, LikePostRequest, SocialResponse, IComment } from "@/types/social";

// 简单的内存缓存实现
class SimpleCache {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private defaultTTL: number = 5 * 60 * 1000; // 默认5分钟过期

  set(key: string, data: any, ttl?: number) {
    const expiration = Date.now() + (ttl || this.defaultTTL);
    this.cache.set(key, { data, timestamp: expiration });
  }

  get(key: string) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.timestamp) {
      // 缓存已过期
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  delete(key: string) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }
}

// 创建缓存实例
const apiCache = new SimpleCache();

// 社交API服务
export class SocialService {
  private static BASE_URL = "/api/posts";
  
  // 获取朋友圈帖子列表
  static async getPosts(page: number = 1, limit: number = 10): Promise<SocialResponse<{posts: IPost[], pagination: any}>> {
    try {
      // 生成缓存键
      const cacheKey = `posts_${page}_${limit}`;
      
      // 尝试从缓存获取数据
      const cachedData = apiCache.get(cacheKey);
      if (cachedData) {
        console.log('从缓存获取帖子列表');
        return {
          success: true,
          data: cachedData
        };
      }

      const response = await fetch(`${this.BASE_URL}?page=${page}&limit=${limit}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        // 缓存数据（仅缓存第一页）
        if (page === 1) {
          apiCache.set(cacheKey, data.data, 30 * 1000); // 第一页缓存30秒
        }
        
        return {
          success: true,
          data: data.data
        };
      } else {
        return {
          success: false,
          error: data.message || "获取帖子失败"
        };
      }
    } catch (error) {
      return {
        success: false,
        error: "网络错误，请稍后重试"
      };
    }
  }
  
  // 创建新帖子
  static async createPost(request: CreatePostRequest): Promise<SocialResponse<IPost>> {
    try {
      const formData = new FormData();
      formData.append('content', request.content);
      
      if (request.images) {
        for (let i = 0; i < request.images.length; i++) {
          formData.append('images', request.images[i]);
        }
      }
      
      const response = await fetch(this.BASE_URL, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.success) {
        // 清除帖子列表缓存
        apiCache.clear();
        
        return {
          success: true,
          data: data.data
        };
      } else {
        return {
          success: false,
          error: data.message || "创建帖子失败"
        };
      }
    } catch (error) {
      return {
        success: false,
        error: "网络错误，请稍后重试"
      };
    }
  }
  
  // 删除帖子
  static async deletePost(postId: string): Promise<SocialResponse<boolean>> {
    try {
      const response = await fetch(`${this.BASE_URL}/${postId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        // 清除帖子列表缓存
        apiCache.clear();
        
        return {
          success: true,
          data: true
        };
      } else {
        return {
          success: false,
          error: data.message || "删除帖子失败"
        };
      }
    } catch (error) {
      return {
        success: false,
        error: "网络错误，请稍后重试"
      };
    }
  }
  
  // 点赞帖子
  static async likePost(request: LikePostRequest): Promise<SocialResponse<boolean>> {
    try {
      const response = await fetch(`${this.BASE_URL}/${request.postId}/likes`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });
      
      const data = await response.json();
      
      if (data.success) {
        // 清除帖子列表缓存
        apiCache.clear();
        
        return {
          success: true,
          data: data.data.liked
        };
      } else {
        return {
          success: false,
          error: data.message || "点赞失败"
        };
      }
    } catch (error) {
      return {
        success: false,
        error: "网络错误，请稍后重试"
      };
    }
  }
  
  // 取消点赞
  static async unlikePost(request: LikePostRequest): Promise<SocialResponse<boolean>> {
    // 取消点赞使用相同的API端点，后端会自动切换
    return this.likePost(request);
  }
  
  // 添加评论
  static async addComment(request: CreateCommentRequest): Promise<SocialResponse<IComment>> {
    try {
      const response = await fetch(`${this.BASE_URL}/${request.postId}/comments`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: request.content,
          parentId: request.parentId
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // 清除帖子列表缓存
        apiCache.clear();
        
        return {
          success: true,
          data: data.data
        };
      } else {
        return {
          success: false,
          error: data.message || "添加评论失败"
        };
      }
    } catch (error) {
      return {
        success: false,
        error: "网络错误，请稍后重试"
      };
    }
  }
  
  // 删除评论
  static async deleteComment(commentId: string): Promise<SocialResponse<boolean>> {
    try {
      const response = await fetch(`${this.BASE_URL}/comments/${commentId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        // 清除帖子列表缓存
        apiCache.clear();
        
        return {
          success: true,
          data: true
        };
      } else {
        return {
          success: false,
          error: data.message || "删除评论失败"
        };
      }
    } catch (error) {
      return {
        success: false,
        error: "网络错误，请稍后重试"
      };
    }
  }
}