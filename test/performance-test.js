// performance-test.js
// 性能优化测试脚本

import performanceMonitor from '../frontend/lib/performance.js';

console.log('开始性能优化测试...\n');

// 模拟大量消息
function simulateMessages(count) {
  console.log(`模拟生成 ${count} 条消息...`);
  
  for (let i = 0; i < count; i++) {
    const messageId = `msg_${Date.now()}_${i}`;
    
    // 记录消息发送时间
    performanceMonitor.startMessageTimer(messageId);
    
    // 模拟网络延迟
    setTimeout(() => {
      // 记录消息接收时间
      performanceMonitor.endMessageTimer(messageId);
    }, Math.random() * 100); // 0-100ms的随机延迟
  }
}

// 模拟API调用
async function simulateApiCalls() {
  console.log('模拟API调用...');
  
  const apis = [
    { name: 'getPosts', delay: 200 },
    { name: 'createPost', delay: 150 },
    { name: 'likePost', delay: 100 },
    { name: 'getComments', delay: 180 }
  ];
  
  for (const api of apis) {
    const startTime = performanceMonitor.startApiTimer(api.name);
    
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, api.delay));
    
    // 记录API响应时间
    performanceMonitor.endApiTimer(api.name, startTime);
  }
}

// 测试内存使用
function testMemoryUsage() {
  console.log('测试内存使用情况...');
  
  // 创建一些数据来增加内存使用
  const data = [];
  for (let i = 0; i < 10000; i++) {
    data.push({
      id: i,
      name: `Item ${i}`,
      value: Math.random()
    });
  }
  
  // 获取内存使用情况
  const memoryUsage = performanceMonitor.getMemoryUsage();
  if (memoryUsage) {
    console.log(`内存使用: ${(memoryUsage.used / 1024 / 1024).toFixed(2)}MB / ${(memoryUsage.total / 1024 / 1024).toFixed(2)}MB`);
  }
}

// 运行测试
async function runPerformanceTest() {
  try {
    // 开始页面加载计时
    performanceMonitor.startPageLoad();
    
    // 模拟页面加载完成
    setTimeout(() => {
      performanceMonitor.endPageLoad();
    }, 150); // 150ms页面加载时间
    
    // 模拟消息通信
    simulateMessages(50);
    
    // 模拟API调用
    await simulateApiCalls();
    
    // 测试内存使用
    testMemoryUsage();
    
    // 等待所有异步操作完成
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 输出性能报告
    console.log('\n=== 性能测试结果 ===');
    performanceMonitor.printReport();
    
    console.log('\n✅ 性能测试完成！');
    
  } catch (error) {
    console.error('❌ 性能测试失败:', error);
    process.exit(1);
  }
}

// 添加未捕获异常处理
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
  process.exit(1);
});

// 运行测试
runPerformanceTest();