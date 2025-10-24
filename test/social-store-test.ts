// 社交状态存储测试
import { useSocialStore } from '../frontend/stores/useSocialStore';
import { IPost, IUser } from '../frontend/types/social';

console.log('开始测试社交状态存储...\n');

// 创建测试数据
const mockUser: IUser = {
  id: 'user1',
  name: '测试用户',
  email: 'test@example.com'
};

const mockPost: IPost = {
  id: 'post1',
  content: '测试动态内容',
  images: [],
  author: mockUser,
  likes: [],
  comments: [],
  createdAt: new Date(),
  updatedAt: new Date()
};

// 测试状态存储功能
function testSocialStore() {
  console.log('1. 测试初始状态...');
  const initialState = useSocialStore.getState();
  console.log('✅ posts:', initialState.posts.length === 0 ? '空数组' : initialState.posts.length);
  console.log('✅ loading:', initialState.loading === false ? 'false' : initialState.loading);
  console.log('✅ hasMore:', initialState.hasMore === true ? 'true' : initialState.hasMore);
  console.log();

  console.log('2. 测试设置帖子...');
  useSocialStore.getState().setPosts([mockPost]);
  const stateAfterSetPosts = useSocialStore.getState();
  console.log('✅ posts数量:', stateAfterSetPosts.posts.length);
  console.log();

  console.log('3. 测试设置加载状态...');
  useSocialStore.getState().setLoading(true);
  const stateAfterSetLoading = useSocialStore.getState();
  console.log('✅ loading状态:', stateAfterSetLoading.loading);
  console.log();

  console.log('4. 测试设置更多数据状态...');
  useSocialStore.getState().setHasMore(false);
  const stateAfterSetHasMore = useSocialStore.getState();
  console.log('✅ hasMore状态:', stateAfterSetHasMore.hasMore);
  console.log();

  console.log('5. 测试添加帖子...');
  const newPost: IPost = {
    ...mockPost,
    id: 'post2',
    content: '新的测试动态'
  };
  useSocialStore.getState().addPost(newPost);
  const stateAfterAddPost = useSocialStore.getState();
  console.log('✅ posts数量:', stateAfterAddPost.posts.length);
  console.log();

  console.log('🎉 社交状态存储测试完成！');
}

// 运行测试
testSocialStore();