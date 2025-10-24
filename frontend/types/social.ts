// 用户接口
export interface IUser {
  id: string;
  name: string;
  avatar?: string;
  email: string;
}

// 点赞接口
export interface ILike {
  id: string;
  user: IUser;
  createdAt: Date;
}

// 评论接口
export interface IComment {
  id: string;
  content: string;
  author: IUser;
  createdAt: Date;
  // 支持回复评论
  replies?: IComment[];
}

// 朋友圈帖子接口
export interface IPost {
  id: string;
  content: string;
  images: string[];
  author: IUser;
  likes: ILike[];
  comments: IComment[];
  createdAt: Date;
  updatedAt: Date;
}

// 创建帖子请求接口
export interface CreatePostRequest {
  content: string;
  images?: File[];
}

// 创建评论请求接口
export interface CreateCommentRequest {
  postId: string;
  content: string;
  parentId?: string; // 用于回复评论
}

// 点赞请求接口
export interface LikePostRequest {
  postId: string;
}

// 删除帖子请求接口
export interface DeletePostRequest {
  postId: string;
}

// 更新帖子请求接口
export interface UpdatePostRequest {
  postId: string;
  content: string;
}

// 社交功能响应接口
export interface SocialResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}