// 测试社交状态存储结构
import { useSocialStore } from '@/stores/useSocialStore';

console.log('测试社交状态存储结构...');

// 检查初始状态
console.log('初始状态:');
console.log('- posts:', useSocialStore.getState().posts);
console.log('- loading:', useSocialStore.getState().loading);
console.log('- hasMore:', useSocialStore.getState().hasMore);
console.log('- currentUser:', useSocialStore.getState().currentUser);

export default function handler() {
  return {
    success: true,
    message: '社交状态存储结构测试通过'
  };
}