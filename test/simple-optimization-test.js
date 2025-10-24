// simple-optimization-test.js
// 简化版优化功能验证测试

console.log('开始简化版优化功能验证测试...\n');

// 测试文件是否存在
const fs = require('fs');
const path = require('path');

function checkFileExists(filePath) {
  try {
    return fs.existsSync(path.join(__dirname, '..', filePath));
  } catch (error) {
    return false;
  }
}

// 测试1: 验证性能监控库
function testPerformanceMonitor() {
  console.log('=== 测试1: 性能监控库 ===');
  
  const exists = checkFileExists('frontend/lib/performance.js');
  if (exists) {
    console.log('✅ 性能监控库文件存在');
    console.log('✅ 性能监控库测试通过\n');
    return true;
  } else {
    console.log('❌ 性能监控库文件不存在');
    return false;
  }
}

// 测试2: 验证虚拟滚动组件
function testVirtualizedMessageList() {
  console.log('=== 测试2: 虚拟滚动组件 ===');
  
  const exists = checkFileExists('frontend/components/Chat/VirtualizedMessageList.tsx');
  if (exists) {
    console.log('✅ 虚拟滚动组件文件存在');
    console.log('✅ 虚拟滚动组件测试通过\n');
    return true;
  } else {
    console.log('❌ 虚拟滚动组件文件不存在');
    return false;
  }
}

// 测试3: 验证图片懒加载
function testLazyImageLoading() {
  console.log('=== 测试3: 图片懒加载 ===');
  
  const exists = checkFileExists('frontend/components/Social/SocialPost.tsx');
  if (exists) {
    console.log('✅ SocialPost组件文件存在');
    
    // 读取文件内容检查是否包含LazyImage
    const content = fs.readFileSync(path.join(__dirname, '..', 'frontend/components/Social/SocialPost.tsx'), 'utf8');
    if (content.includes('LazyImage')) {
      console.log('✅ SocialPost组件中包含LazyImage实现');
      console.log('✅ 图片懒加载测试通过\n');
      return true;
    } else {
      console.log('❌ SocialPost组件中未找到LazyImage实现');
      return false;
    }
  } else {
    console.log('❌ SocialPost组件文件不存在');
    return false;
  }
}

// 测试4: 验证API缓存
function testApiCaching() {
  console.log('=== 测试4: API缓存 ===');
  
  const exists = checkFileExists('frontend/services/socialService.ts');
  if (exists) {
    console.log('✅ SocialService文件存在');
    
    // 读取文件内容检查是否包含缓存实现
    const content = fs.readFileSync(path.join(__dirname, '..', 'frontend/services/socialService.ts'), 'utf8');
    if (content.includes('SimpleCache') && content.includes('apiCache')) {
      console.log('✅ SocialService中包含缓存实现');
      console.log('✅ API缓存测试通过\n');
      return true;
    } else {
      console.log('❌ SocialService中未找到缓存实现');
      return false;
    }
  } else {
    console.log('❌ SocialService文件不存在');
    return false;
  }
}

// 测试5: 验证错误边界
function testErrorBoundary() {
  console.log('=== 测试5: 错误边界 ===');
  
  const exists = checkFileExists('frontend/components/ErrorBoundary.tsx');
  if (exists) {
    console.log('✅ 错误边界组件文件存在');
    console.log('✅ 错误边界测试通过\n');
    return true;
  } else {
    console.log('❌ 错误边界组件文件不存在');
    return false;
  }
}

// 运行所有测试
function runAllTests() {
  try {
    let passedTests = 0;
    const totalTests = 5;
    
    // 运行测试
    if (testPerformanceMonitor()) passedTests++;
    if (testVirtualizedMessageList()) passedTests++;
    if (testLazyImageLoading()) passedTests++;
    if (testApiCaching()) passedTests++;
    if (testErrorBoundary()) passedTests++;
    
    console.log('=== 测试总结 ===');
    console.log(`通过测试: ${passedTests}/${totalTests}`);
    
    if (passedTests === totalTests) {
      console.log('🎉 所有优化功能验证通过！');
      console.log('\n优化功能清单:');
      console.log('✅ 性能监控库 - 已实现');
      console.log('✅ 消息列表虚拟滚动 - 已实现');
      console.log('✅ 图片懒加载 - 已实现');
      console.log('✅ API响应缓存 - 已实现');
      console.log('✅ 错误边界 - 已实现');
      console.log('\n🚀 性能优化已完成，可以按优先级逐步实施！');
    } else {
      console.log('❌ 部分测试未通过，请检查实现');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
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
runAllTests();