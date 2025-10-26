// next-config-check.js
// Next.js配置Vercel兼容性检查脚本

const fs = require('fs');
const path = require('path');

console.log('开始Next.js配置Vercel兼容性检查...\n');

// 检查 next.config.js
console.log('1. 检查 next.config.js 配置:');
try {
  const nextConfigPath = path.join(__dirname, '..', 'next.config.js');
  const nextConfigContent = fs.readFileSync(nextConfigPath, 'utf8');
  
  // 检查是否包含next-pwa
  if (nextConfigContent.includes('next-pwa')) {
    console.log('  ✅ 包含 next-pwa 配置');
  } else {
    console.log('  ❌ 缺少 next-pwa 配置');
  }
  
  // 检查是否包含华为设备优化配置
  if (nextConfigContent.includes('cacheStartUrl') && 
      nextConfigContent.includes('dynamicStartUrl')) {
    console.log('  ✅ 包含华为设备优化配置');
  } else {
    console.log('  ⚠️  可能缺少华为设备优化配置');
  }
  
  // 检查是否移除了API路由重写（避免与Vercel配置冲突）
  if (nextConfigContent.includes('rewrites') && 
      nextConfigContent.includes('api')) {
    console.log('  ❌ 可能包含与Vercel冲突的API路由重写');
  } else {
    console.log('  ✅ 未包含与Vercel冲突的API路由重写');
  }
} catch (error) {
  console.log('  ❌ 无法读取 next.config.js');
}

console.log();

// 检查 vercel.json
console.log('2. 检查 vercel.json 配置:');
try {
  const vercelConfigPath = path.join(__dirname, '..', 'vercel.json');
  const vercelConfigContent = fs.readFileSync(vercelConfigPath, 'utf8');
  const vercelConfig = JSON.parse(vercelConfigContent);
  
  // 检查是否包含routes（与rewrites冲突）
  if (vercelConfig.routes) {
    console.log('  ❌ 包含 routes 属性（应使用 rewrites 替代）');
  } else {
    console.log('  ✅ 未包含与 rewrites 冲突的 routes 属性');
  }
  
  // 检查是否包含rewrites
  if (vercelConfig.rewrites) {
    console.log('  ✅ 包含 rewrites 配置');
  } else {
    console.log('  ⚠️  缺少 rewrites 配置');
  }
  
  // 检查是否包含headers
  if (vercelConfig.headers) {
    console.log('  ✅ 包含 headers 配置');
  } else {
    console.log('  ⚠️  缺少 headers 配置');
  }
  
  // 检查环境变量配置
  if (vercelConfig.env) {
    console.log('  ✅ 包含 env 配置');
  } else {
    console.log('  ⚠️  缺少 env 配置');
  }
} catch (error) {
  console.log('  ❌ 无法读取或解析 vercel.json');
}

console.log();

// 检查 package.json 构建脚本
console.log('3. 检查 package.json 构建脚本:');
try {
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
  const packageJson = JSON.parse(packageJsonContent);
  
  // 检查构建脚本
  if (packageJson.scripts && packageJson.scripts.build) {
    console.log('  ✅ 包含 build 脚本:', packageJson.scripts.build);
  } else {
    console.log('  ❌ 缺少 build 脚本');
  }
  
  // 检查开发脚本
  if (packageJson.scripts && packageJson.scripts.dev) {
    console.log('  ✅ 包含 dev 脚本:', packageJson.scripts.dev);
  } else {
    console.log('  ❌ 缺少 dev 脚本');
  }
} catch (error) {
  console.log('  ❌ 无法读取或解析 package.json');
}

console.log();

// 检查输出模式配置建议
console.log('4. 输出模式配置建议:');
console.log('  Next.js App Router项目通常不需要显式设置output模式');
console.log('  Vercel会自动处理构建输出');

console.log();

// 检查图像优化配置建议
console.log('5. 图像优化配置建议:');
console.log('  Next.js内置图像优化默认启用');
console.log('  如需禁用，应在next.config.js中设置:');
console.log('  images: { unoptimized: true }');

console.log();

// 检查环境变量配置建议
console.log('6. 环境变量配置建议:');
console.log('  ✅ 敏感环境变量应通过Vercel项目设置配置');
console.log('  ✅ 避免在代码中硬编码API URL');
console.log('  ✅ 使用NEXT_PUBLIC_前缀暴露必要的环境变量');

console.log();

// 最终检查结果
console.log('✅ Next.js配置Vercel兼容性检查完成！');
console.log('\n建议的优化措施:');
console.log('1. 确保在Vercel项目设置中配置环境变量');
console.log('2. 验证图像优化是否符合项目需求');
console.log('3. 检查重定向和头部设置是否满足应用需求');

console.log('\n检查完成。');