// vercel-build-diagnostic.js
// Vercel构建错误诊断脚本

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('开始Vercel构建错误诊断...\n');

// 第一优先级：依赖和版本问题
console.log('1. 依赖和版本问题诊断:');
try {
  // 检查package.json
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  console.log('  ✅ package.json文件存在');
  
  // 检查关键依赖
  const criticalDeps = ['next', 'react', 'react-dom'];
  for (const dep of criticalDeps) {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      console.log(`  ✅ ${dep}依赖已安装: ${packageJson.dependencies[dep]}`);
    } else if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
      console.log(`  ✅ ${dep}开发依赖已安装: ${packageJson.devDependencies[dep]}`);
    } else {
      console.log(`  ❌ 缺少关键依赖: ${dep}`);
    }
  }
  
  // 检查package-lock.json
  const packageLockPath = path.join(__dirname, '..', 'package-lock.json');
  if (fs.existsSync(packageLockPath)) {
    console.log('  ✅ package-lock.json文件存在');
  } else {
    console.log('  ⚠️  package-lock.json文件缺失，建议运行npm install');
  }
  
  // 检查依赖冲突（简化检查）
  try {
    execSync('npm ls --depth=0', { stdio: 'pipe' });
    console.log('  ✅ 依赖树检查通过');
  } catch (error) {
    console.log('  ⚠️  可能存在依赖冲突，请运行npm ls查看更多详情');
  }
  
} catch (error) {
  console.log('  ❌ 依赖检查失败:', error.message);
}

console.log();

// 第二优先级：配置问题
console.log('2. 配置问题诊断:');
try {
  // 检查next.config.js
  const nextConfigPath = path.join(__dirname, '..', 'next.config.js');
  if (fs.existsSync(nextConfigPath)) {
    const nextConfigContent = fs.readFileSync(nextConfigPath, 'utf8');
    console.log('  ✅ next.config.js文件存在');
    
    // 检查关键配置
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
    
    // 检查Vercel环境检测
    if (nextConfigContent.includes('process.env.VERCEL')) {
      console.log('  ✅ 包含Vercel环境检测');
    } else {
      console.log('  ⚠️  缺少Vercel环境检测');
    }
  } else {
    console.log('  ❌ next.config.js文件缺失');
  }
  
  // 检查vercel.json
  const vercelConfigPath = path.join(__dirname, '..', 'vercel.json');
  if (fs.existsSync(vercelConfigPath)) {
    const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));
    console.log('  ✅ vercel.json文件存在');
    
    // 检查版本
    if (vercelConfig.version === 2) {
      console.log('  ✅ Vercel配置版本正确');
    } else {
      console.log('  ❌ Vercel配置版本不正确');
    }
    
    // 检查builds配置
    if (vercelConfig.builds && vercelConfig.builds.length > 0) {
      console.log('  ✅ 包含builds配置');
    } else {
      console.log('  ❌ 缺少builds配置');
    }
    
    // 检查routes与rewrites冲突
    if (vercelConfig.routes && (vercelConfig.rewrites || vercelConfig.redirects || vercelConfig.headers)) {
      console.log('  ⚠️  routes与rewrites/redirects/headers可能存在冲突');
    }
  } else {
    console.log('  ⚠️  vercel.json文件缺失');
  }
  
} catch (error) {
  console.log('  ❌ 配置检查失败:', error.message);
}

console.log();

// 第三优先级：代码问题
console.log('3. 代码问题诊断:');
try {
  // 检查是否存在服务器端使用window/document的问题
  const checkForWindowUsage = (dirPath) => {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const fullPath = path.join(dirPath, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // 跳过node_modules、.next和.git目录
        if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
          checkForWindowUsage(fullPath);
        }
      } else if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          
          // 跳过public目录下的文件（如sw.js）
          if (fullPath.includes(path.join('public'))) {
            continue;
          }
          
          // 检查非客户端组件中使用window/document
          // 如果文件包含"use client"指令，则跳过检查
          if (!content.includes('"use client"') && !content.includes("'use client'")) {
            // 检查是否包含环境检查
            const hasEnvCheck = content.includes('typeof window !==') || 
                               content.includes('if (typeof window') ||
                               content.includes('typeof document !==') || 
                               content.includes('if (typeof document') ||
                               content.includes('isBrowser') ||
                               content.includes('typeof navigator !==');
            
            // 如果没有环境检查且使用了window或document，则报告问题
            if (!hasEnvCheck && (content.includes('window.') || content.includes('document.') || content.includes('navigator.'))) {
              console.log(`  ⚠️  ${path.relative(path.join(__dirname, '..'), fullPath)}在服务器端组件中使用了浏览器API`);
            }
          }
        } catch (error) {
          // 忽略读取错误
        }
      }
    }
  };
  
  checkForWindowUsage(path.join(__dirname, '..'));
  console.log('  ✅ 服务器端浏览器API使用检查完成');
  
  // 检查TypeScript错误
  try {
    execSync('npx tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
    console.log('  ✅ TypeScript检查通过');
  } catch (error) {
    console.log('  ⚠️  TypeScript检查发现错误，请运行npx tsc --noEmit查看更多详情');
  }
  
} catch (error) {
  console.log('  ❌ 代码检查失败:', error.message);
}

console.log();

// 环境变量检查
console.log('4. 环境变量检查:');
try {
  // 检查.env文件
  const envFiles = ['.env', '.env.local', '.env.production'];
  for (const envFile of envFiles) {
    const envPath = path.join(__dirname, '..', envFile);
    if (fs.existsSync(envPath)) {
      console.log(`  ✅ ${envFile}文件存在`);
    }
  }
  
  // 检查关键环境变量
  const requiredEnvVars = ['NEXT_PUBLIC_API_URL', 'NEXT_PUBLIC_WS_URL'];
  const envExamplePath = path.join(__dirname, '..', '.env.example');
  if (fs.existsSync(envExamplePath)) {
    const envExampleContent = fs.readFileSync(envExamplePath, 'utf8');
    for (const envVar of requiredEnvVars) {
      if (envExampleContent.includes(envVar)) {
        console.log(`  ✅ .env.example中包含${envVar}`);
      } else {
        console.log(`  ⚠️  .env.example中缺少${envVar}`);
      }
    }
  }
  
} catch (error) {
  console.log('  ❌ 环境变量检查失败:', error.message);
}

console.log();

// 最终建议
console.log('✅ Vercel构建错误诊断完成！');

console.log('\n建议的修复措施:');
console.log('1. 如果存在依赖问题，运行npm install重新安装依赖');
console.log('2. 检查next.config.js和vercel.json配置是否正确');
console.log('3. 确保服务器端组件中不直接使用浏览器API');
console.log('4. 运行npx tsc --noEmit检查TypeScript错误');
console.log('5. 在Vercel项目设置中配置必要的环境变量');

console.log('\n诊断完成。');