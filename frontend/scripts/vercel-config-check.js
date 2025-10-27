// vercel-config-check.js
// Vercel配置检查脚本

const fs = require('fs');
const path = require('path');

console.log('开始Vercel配置检查...\n');

// 检查 vercel.json 文件
console.log('1. 检查 vercel.json 文件:');
try {
  const vercelConfigPath = path.join(__dirname, '..', 'vercel.json');
  const vercelConfigContent = fs.readFileSync(vercelConfigPath, 'utf8');
  const vercelConfig = JSON.parse(vercelConfigContent);
  
  // 检查必需的配置项
  const requiredKeys = ['version', 'buildCommand', 'outputDirectory', 'framework'];
  const missingKeys = requiredKeys.filter(key => !vercelConfig[key]);
  
  if (missingKeys.length === 0) {
    console.log('  ✅ vercel.json 包含所有必需配置项');
  } else {
    console.log('  ❌ vercel.json 缺少以下配置项:', missingKeys.join(', '));
  }
  
  // 检查配置值是否正确
  if (vercelConfig.version === 2) {
    console.log('  ✅ vercel.json version 配置正确');
  } else {
    console.log('  ❌ vercel.json version 应为 2');
  }
  
  if (vercelConfig.buildCommand === 'npm run build') {
    console.log('  ✅ vercel.json buildCommand 配置正确');
  } else {
    console.log('  ❌ vercel.json buildCommand 应为 "npm run build"');
  }
  
  if (vercelConfig.outputDirectory === '.next') {
    console.log('  ✅ vercel.json outputDirectory 配置正确');
  } else {
    console.log('  ❌ vercel.json outputDirectory 应为 ".next"');
  }
  
  if (vercelConfig.framework === 'nextjs') {
    console.log('  ✅ vercel.json framework 配置正确');
  } else {
    console.log('  ❌ vercel.json framework 应为 "nextjs"');
  }
  
  // 检查regions配置
  if (vercelConfig.regions && Array.isArray(vercelConfig.regions)) {
    console.log('  ✅ vercel.json regions 配置存在');
  } else {
    console.log('  ⚠️  vercel.json 缺少 regions 配置');
  }
  
} catch (error) {
  console.log('  ❌ 无法读取或解析 vercel.json 文件');
}

console.log();

// 检查 package.json 中的脚本
console.log('2. 检查 package.json 脚本:');
try {
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
  const packageJson = JSON.parse(packageJsonContent);
  
  // 检查必需的脚本
  const requiredScripts = ['dev', 'build', 'start'];
  const missingScripts = requiredScripts.filter(script => !packageJson.scripts[script]);
  
  if (missingScripts.length === 0) {
    console.log('  ✅ package.json 包含所有必需脚本');
  } else {
    console.log('  ❌ package.json 缺少以下脚本:', missingScripts.join(', '));
  }
  
  // 检查脚本值是否正确
  if (packageJson.scripts.dev === 'next dev') {
    console.log('  ✅ package.json dev 脚本配置正确');
  } else {
    console.log('  ❌ package.json dev 脚本应为 "next dev"');
  }
  
  if (packageJson.scripts.build === 'next build') {
    console.log('  ✅ package.json build 脚本配置正确');
  } else {
    console.log('  ❌ package.json build 脚本应为 "next build"');
  }
  
  if (packageJson.scripts.start === 'next start') {
    console.log('  ✅ package.json start 脚本配置正确');
  } else {
    console.log('  ❌ package.json start 脚本应为 "next start"');
  }
  
} catch (error) {
  console.log('  ❌ 无法读取或解析 package.json 文件');
}

console.log();

// 检查环境变量文件
console.log('3. 检查环境变量文件:');
try {
  const envFiles = ['.env.production', '.env.local', '.env.example'];
  
  for (const envFile of envFiles) {
    const envPath = path.join(__dirname, '..', envFile);
    if (fs.existsSync(envPath)) {
      console.log(`  ✅ ${envFile} 文件存在`);
    } else {
      console.log(`  ⚠️  ${envFile} 文件不存在`);
    }
  }
  
  // 检查 .env.example 中是否包含必要的环境变量
  const envExamplePath = path.join(__dirname, '..', '.env.example');
  if (fs.existsSync(envExamplePath)) {
    const envExampleContent = fs.readFileSync(envExamplePath, 'utf8');
    
    const requiredEnvVars = ['NEXT_PUBLIC_API_URL', 'NEXT_PUBLIC_WS_URL', 'BACKEND_URL', 'JWT_SECRET'];
    const missingEnvVars = requiredEnvVars.filter(varName => !envExampleContent.includes(varName));
    
    if (missingEnvVars.length === 0) {
      console.log('  ✅ .env.example 包含所有必需的环境变量示例');
    } else {
      console.log('  ⚠️  .env.example 缺少以下环境变量示例:', missingEnvVars.join(', '));
    }
  }
  
} catch (error) {
  console.log('  ❌ 检查环境变量文件时出错');
}

console.log();

// 检查 .gitignore 文件
console.log('4. 检查 .gitignore 文件:');
try {
  const gitignorePath = path.join(__dirname, '..', '.gitignore');
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  
  // 检查是否忽略了敏感环境变量文件
  const sensitiveFiles = ['.env.local', '.env.production', '.env.development'];
  const missingFiles = sensitiveFiles.filter(fileName => !gitignoreContent.includes(fileName));
  
  if (missingFiles.length === 0) {
    console.log('  ✅ .gitignore 正确忽略了敏感环境变量文件');
  } else {
    console.log('  ❌ .gitignore 缺少以下敏感文件的忽略规则:', missingFiles.join(', '));
  }
} catch (error) {
  console.log('  ❌ 无法读取 .gitignore 文件');
}

console.log();

// 检查 next.config.js 配置
console.log('5. 检查 next.config.js 配置:');
try {
  const nextConfigPath = path.join(__dirname, '..', 'next.config.js');
  const nextConfigContent = fs.readFileSync(nextConfigPath, 'utf8');
  
  // 检查是否包含必要的配置
  if (nextConfigContent.includes('output: \'standalone\'')) {
    console.log('  ✅ next.config.js 包含 standalone 输出配置');
  } else {
    console.log('  ⚠️  next.config.js 建议包含 output: \'standalone\' 配置');
  }
  
  if (nextConfigContent.includes('next-pwa')) {
    console.log('  ✅ next.config.js 包含 PWA 配置');
  } else {
    console.log('  ⚠️  next.config.js 建议包含 PWA 配置');
  }
  
} catch (error) {
  console.log('  ❌ 无法读取 next.config.js 文件');
}

console.log();

// 最终检查结果
console.log('✅ Vercel配置检查完成！');

console.log('\n建议的优化措施:');
console.log('1. 确保在Vercel仪表板中配置所有必需的环境变量');
console.log('2. 定期检查并更新Vercel配置');
console.log('3. 使用Vercel的性能监控工具');
console.log('4. 配置适当的错误通知机制');

console.log('\n运行以下命令进行部署:');
console.log('  开发环境部署: npx vercel');
console.log('  生产环境部署: npx vercel --prod');

console.log('\n检查完成。');