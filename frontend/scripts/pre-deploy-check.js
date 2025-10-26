// pre-deploy-check.js
// 部署前检查脚本

const fs = require('fs');
const path = require('path');

console.log('开始部署前检查...\n');

// 检查必要的文件
const requiredFiles = [
  'next.config.js',
  'vercel.json',
  'public/manifest.json',
  'public/sw.js',
  'public/icons/icon-192x192.png',
  'public/icons/icon-512x512.png'
];

let allFilesExist = true;
console.log('1. 检查必要文件是否存在:');
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} (缺失)`);
    allFilesExist = false;
  }
});

console.log();

// 检查配置文件内容
console.log('2. 检查配置文件内容:');

// 检查 next.config.js
try {
  const nextConfig = fs.readFileSync(path.join(__dirname, '..', 'next.config.js'), 'utf8');
  if (nextConfig.includes('next-pwa')) {
    console.log('  ✅ next.config.js 包含 PWA 配置');
  } else {
    console.log('  ❌ next.config.js 缺少 PWA 配置');
  }
} catch (error) {
  console.log('  ❌ 无法读取 next.config.js');
}

// 检查 vercel.json
try {
  const vercelConfig = fs.readFileSync(path.join(__dirname, '..', 'vercel.json'), 'utf8');
  const vercelJson = JSON.parse(vercelConfig);
  if (vercelJson.routes) {
    console.log('  ❌ vercel.json 包含 routes 属性（应使用 rewrites 替代）');
  } else {
    console.log('  ✅ vercel.json 配置正确');
  }
} catch (error) {
  console.log('  ❌ 无法读取或解析 vercel.json');
}

// 检查 layout.tsx
try {
  const layoutFile = fs.readFileSync(path.join(__dirname, '..', 'app', 'layout.tsx'), 'utf8');
  if (layoutFile.includes('"use client"')) {
    console.log('  ❌ layout.tsx 包含 "use client"（应该移除）');
  } else {
    console.log('  ✅ layout.tsx 不包含 "use client"');
  }
  
  if (layoutFile.includes('useEffect')) {
    console.log('  ❌ layout.tsx 包含 useEffect（应该移除）');
  } else {
    console.log('  ✅ layout.tsx 不包含 useEffect');
  }
} catch (error) {
  console.log('  ❌ 无法读取 app/layout.tsx');
}

console.log();

// 检查 ServiceWorkerRegister 组件
try {
  const swRegisterFile = fs.readFileSync(path.join(__dirname, '..', 'components', 'ServiceWorkerRegister.tsx'), 'utf8');
  if (swRegisterFile.includes('"use client"')) {
    console.log('  ✅ ServiceWorkerRegister.tsx 正确标记为客户端组件');
  } else {
    console.log('  ❌ ServiceWorkerRegister.tsx 缺少 "use client" 标记');
  }
} catch (error) {
  console.log('  ❌ 无法读取 components/ServiceWorkerRegister.tsx');
}

console.log();

// 最终检查结果
if (allFilesExist) {
  console.log('✅ 所有检查通过！可以尝试重新部署。');
  console.log('\n部署命令:');
  console.log('  cd frontend');
  console.log('  vercel --prod');
} else {
  console.log('❌ 检查失败！请修复上述问题后再尝试部署。');
}

console.log('\n检查完成。');