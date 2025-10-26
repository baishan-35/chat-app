// vercel-deploy-check.js
// Vercel部署前检查脚本

const fs = require('fs');
const path = require('path');

console.log('开始Vercel部署前检查...\n');

// 检查vercel.json配置
console.log('1. 检查vercel.json配置:');
try {
  const vercelConfigPath = path.join(__dirname, '..', 'vercel.json');
  const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));
  
  // 检查版本
  if (vercelConfig.version === 2) {
    console.log('  ✅ Vercel配置版本正确');
  } else {
    console.log('  ❌ Vercel配置版本不正确，应为2');
  }
  
  // 检查builds配置
  if (vercelConfig.builds && vercelConfig.builds.length > 0) {
    const nextBuild = vercelConfig.builds.find(build => build.use === '@vercel/next');
    if (nextBuild) {
      console.log('  ✅ 包含Next.js构建配置');
    } else {
      console.log('  ❌ 缺少Next.js构建配置');
    }
  } else {
    console.log('  ❌ 缺少builds配置');
  }
  
  // 检查routes配置
  if (vercelConfig.routes) {
    console.log('  ✅ 包含routes配置');
  } else {
    console.log('  ⚠️  缺少routes配置');
  }
  
  // 检查环境变量配置
  if (vercelConfig.env) {
    console.log('  ✅ 包含环境变量配置');
  } else {
    console.log('  ⚠️  缺少环境变量配置');
  }
} catch (error) {
  console.log('  ❌ 无法读取或解析vercel.json:', error.message);
}

console.log();

// 检查next.config.js配置
console.log('2. 检查next.config.js配置:');
try {
  const nextConfigPath = path.join(__dirname, '..', 'next.config.js');
  const nextConfigContent = fs.readFileSync(nextConfigPath, 'utf8');
  
  // 检查是否包含Vercel优化配置
  if (nextConfigContent.includes('output:')) {
    console.log('  ✅ 包含output配置');
  } else {
    console.log('  ⚠️  缺少output配置');
  }
  
  if (nextConfigContent.includes('trailingSlash:')) {
    console.log('  ✅ 包含trailingSlash配置');
  } else {
    console.log('  ⚠️  缺少trailingSlash配置');
  }
  
  if (nextConfigContent.includes('images:')) {
    console.log('  ✅ 包含images配置');
  } else {
    console.log('  ⚠️  缺少images配置');
  }
  
  // 检查是否包含PWA配置
  if (nextConfigContent.includes('next-pwa')) {
    console.log('  ✅ 包含PWA配置');
  } else {
    console.log('  ⚠️  缺少PWA配置');
  }
} catch (error) {
  console.log('  ❌ 无法读取next.config.js:', error.message);
}

console.log();

// 检查关键文件
console.log('3. 检查关键文件:');
const keyFiles = [
  'public/manifest.json',
  'public/sw.js',
  'public/icons/icon-192x192.png',
  'public/icons/icon-512x512.png'
];

for (const file of keyFiles) {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ ${file} 存在`);
  } else {
    console.log(`  ❌ ${file} 缺失`);
  }
}

console.log();

// 检查环境变量
console.log('4. 检查环境变量:');
const requiredEnvVars = [
  'NEXT_PUBLIC_API_URL',
  'NEXT_PUBLIC_WS_URL'
];

// 检查.env.production文件
const envProdPath = path.join(__dirname, '..', '.env.production');
if (fs.existsSync(envProdPath)) {
  const envContent = fs.readFileSync(envProdPath, 'utf8');
  console.log('  ✅ .env.production 文件存在');
  
  for (const envVar of requiredEnvVars) {
    if (envContent.includes(envVar)) {
      console.log(`  ✅ ${envVar} 已配置`);
    } else {
      console.log(`  ⚠️  ${envVar} 未配置`);
    }
  }
} else {
  console.log('  ⚠️  .env.production 文件缺失');
}

console.log();

// 最终检查结果
console.log('✅ Vercel部署前检查完成！');

console.log('\n建议的优化措施:');
console.log('1. 确保所有环境变量在Vercel项目设置中正确配置');
console.log('2. 验证所有静态资源文件完整性');
console.log('3. 检查Next.js配置是否符合Vercel最佳实践');
console.log('4. 确保PWA功能在Vercel环境中正常工作');

console.log('\n检查完成。');