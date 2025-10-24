import { create } from "zustand";
import { persist } from "zustand/middleware";
import { IPost, IUser, ILike, IComment } from "@/types/social";

// 社交状态接口
interface SocialState {
  // 帖子列表
  posts: IPost[];
  // 当前用户信息
  currentUser: IUser | null;
  // 加载状态
  loading: boolean;
  // 是否还有更多数据
  hasMore: boolean;
  // 错误信息
  error: string | null;
  
  // 帖子操作
  addPost: (post: IPost) => void;
  removePost: (postId: string) => void;
  updatePost: (post: IPost) => void;
  setPosts: (posts: IPost[]) => void;
  
  // 点赞操作
  addLike: (postId: string, like: ILike) => void;
  removeLike: (postId: string, likeId: string) => void;
  
  // 评论操作
  addComment: (postId: string, comment: IComment) => void;
  removeComment: (postId: string, commentId: string) => void;
  addCommentReply: (postId: string, commentId: string, reply: IComment) => void;
  
  // 用户操作
  setCurrentUser: (user: IUser | null) => void;
  
  // 状态操作
  setLoading: (loading: boolean) => void;
  setHasMore: (hasMore: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

// 创建社交状态存储
export const useSocialStore = create<SocialState>()(
  persist(
    (set, get) => ({
      // 初始化状态
      posts: [],
      currentUser: null,
      loading: false,
      hasMore: true, // 默认还有更多数据
      error: null,
      
      // 帖子操作
      addPost: (post) => {
        set((state) => ({
          posts: [post, ...state.posts]
        }));
      },
      
      removePost: (postId) => {
        set((state) => ({
          posts: state.posts.filter(post => post.id !== postId)
        }));
      },
      
      updatePost: (post) => {
        set((state) => ({
          posts: state.posts.map(p => p.id === post.id ? post : p)
        }));
      },
      
      setPosts: (posts) => {
        set({ posts });
      },
      
      // 点赞操作
      addLike: (postId, like) => {
        set((state) => ({
          posts: state.posts.map(post => {
            if (post.id === postId) {
              // 检查是否已经点赞
              const alreadyLiked = post.likes.some(l => l.user.id === like.user.id);
              if (!alreadyLiked) {
                return {
                  ...post,
                  likes: [...post.likes, like]
                };
              }
            }
            return post;
          })
        }));
      },
      
      removeLike: (postId, likeId) => {
        set((state) => ({
          posts: state.posts.map(post => {
            if (post.id === postId) {
              return {
                ...post,
                likes: post.likes.filter(like => like.id !== likeId)
              };
            }
            return post;
          })
        }));
      },
      
      // 评论操作
      addComment: (postId, comment) => {
        set((state) => ({
          posts: state.posts.map(post => {
            if (post.id === postId) {
              return {
                ...post,
                comments: [...post.comments, comment]
              };
            }
            return post;
          })
        }));
      },
      
      removeComment: (postId, commentId) => {
        set((state) => ({
          posts: state.posts.map(post => {
            if (post.id === postId) {
              return {
                ...post,
                comments: post.comments.filter(comment => comment.id !== commentId)
              };
            }
            return post;
          })
        }));
      },
      
      addCommentReply: (postId, commentId, reply) => {
        set((state) => ({
          posts: state.posts.map(post => {
            if (post.id === postId) {
              return {
                ...post,
                comments: post.comments.map(comment => {
                  if (comment.id === commentId) {
                    return {
                      ...comment,
                      replies: [...(comment.replies || []), reply]
                    };
                  }
                  return comment;
                })
              };
            }
            return post;
          })
        }));
      },
      
      // 用户操作
      setCurrentUser: (user) => {
        set({ currentUser: user });
      },
      
      // 状态操作
      setLoading: (loading) => {
        set({ loading });
      },
      
      setHasMore: (hasMore) => {
        set({ hasMore });
      },
      
      setError: (error) => {
        set({ error });
      },
      
      clearError: () => {
        set({ error: null });
      }
    }),
    {
      name: "social-storage", // 存储在localStorage中的键名
      partialize: (state) => ({ 
        posts: state.posts,
        currentUser: state.currentUser
      }),
    }
  )
);