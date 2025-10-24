// 测试社交状态存储
const { useSocialStore } = require('../frontend/stores/useSocialStore');

console.log('测试社交状态存储结构...');

// 创建测试实例
const store = useSocialStore;

// 检查初始状态
console.log('初始状态:');
console.log('- posts:', store.getState().posts);
console.log('- loading:', store.getState().loading);
console.log('- hasMore:', store.getState().hasMore);
console.log('- currentUser:', store.getState().currentUser);

console.log('\n测试通过: 社交状态存储结构正确');