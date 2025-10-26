// build-error-check.js
// 构建错误检测脚本

const fs = require('fs');
const path = require('path');

console.log('开始构建错误预诊断检查...\n');

// 检查依赖冲突
console.log('1. 依赖冲突检测:');
try {
  // 检查 package.json
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // 检查 React 和 Next.js 版本兼容性
  const reactVersion = packageJson.dependencies?.react;
  const nextVersion = packageJson.dependencies?.next;
  
  if (reactVersion && nextVersion) {
    console.log('  ✅ React 和 Next.js 版本已定义');
    console.log('     React 版本:', reactVersion);
    console.log('     Next.js 版本:', nextVersion);
  } else {
    console.log('  ❌ 缺少 React 或 Next.js 版本定义');
  }
  
  // 检查类型定义冲突
  const typeDependencies = Object.keys(packageJson.dependencies || {}).filter(dep => dep.startsWith('@types/'));
  if (typeDependencies.length > 0) {
    console.log('  ✅ 检测到类型定义依赖:', typeDependencies.join(', '));
  } else {
    console.log('  ⚠️  未检测到类型定义依赖');
  }
  
  // 检查原生模块依赖
  const nativeModules = Object.keys(packageJson.dependencies || {}).filter(dep => 
    dep.includes('native') || dep.includes('node-') || dep.includes('bindings')
  );
  if (nativeModules.length > 0) {
    console.log('  ⚠️  检测到可能的原生模块依赖:', nativeModules.join(', '));
  } else {
    console.log('  ✅ 未检测到原生模块依赖');
  }
} catch (error) {
  console.log('  ❌ 依赖冲突检测失败:', error.message);
}

console.log();

// TypeScript/JavaScript 错误检测
console.log('2. TypeScript/JavaScript 错误检测:');
try {
  // 检查 tsconfig.json
  const tsconfigPath = path.join(__dirname, '..', 'tsconfig.json');
  if (fs.existsSync(tsconfigPath)) {
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
    console.log('  ✅ tsconfig.json 配置存在');
    
    // 检查关键配置
    if (tsconfig.compilerOptions?.strict) {
      console.log('  ✅ 启用了严格模式');
    } else {
      console.log('  ⚠️  未启用严格模式');
    }
    
    if (tsconfig.compilerOptions?.noEmit) {
      console.log('  ✅ 配置为不生成输出文件');
    } else {
      console.log('  ⚠️  可能会生成输出文件');
    }
  } else {
    console.log('  ⚠️  未找到 tsconfig.json');
  }
  
  // 检查关键文件是否存在
  const keyFiles = [
    'app/layout.tsx',
    'app/page.tsx',
    'stores/useAuthStore.ts',
    'stores/useMessageStore.ts',
    'components/ServiceWorkerRegister.tsx'
  ];
  
  for (const file of keyFiles) {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
      console.log(`  ✅ ${file} 存在`);
    } else {
      console.log(`  ❌ ${file} 缺失`);
    }
  }
  
  // 检查导入/导出路径
  const checkImports = (dirPath) => {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const fullPath = path.join(dirPath, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        checkImports(fullPath);
      } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          // 检查相对导入路径
          if (content.includes('@/')) {
            // 检查是否存在对应的文件
            const importMatches = content.match(/import\s+.*\s+from\s+['"]@\/([^'"]+)['"]/g);
            if (importMatches) {
              for (const match of importMatches) {
                const importPath = match.match(/@\/([^'"]+)/)[1];
                const resolvedPath = path.join(__dirname, '..', importPath);
                // 检查文件或目录是否存在
                if (!fs.existsSync(resolvedPath)) {
                  // 检查是否有 .ts 或 .tsx 扩展名
                  if (!fs.existsSync(resolvedPath + '.ts') && !fs.existsSync(resolvedPath + '.tsx')) {
                    // 检查是否是目录
                    if (!fs.existsSync(resolvedPath) || !fs.statSync(resolvedPath).isDirectory()) {
                      console.log(`  ⚠️  可能的导入路径问题: ${file} -> ${importPath}`);
                    }
                  }
                }
              }
            }
          }
        } catch (error) {
          console.log(`  ❌ 读取文件时出错: ${file}`);
        }
      }
    }
  };
  
  checkImports(path.join(__dirname, '..', 'app'));
  checkImports(path.join(__dirname, '..', 'components'));
  checkImports(path.join(__dirname, '..', 'stores'));
  
} catch (error) {
  console.log('  ❌ TypeScript/JavaScript 错误检测失败:', error.message);
}

console.log();

// 静态资源检测
console.log('3. 静态资源检测:');
try {
  // 检查 public 目录
  const publicDir = path.join(__dirname, '..', 'public');
  if (fs.existsSync(publicDir)) {
    console.log('  ✅ public 目录存在');
    
    // 检查关键文件
    const keyAssets = [
      'manifest.json',
      'sw.js',
      'icons/icon-192x192.png',
      'icons/icon-512x512.png'
    ];
    
    for (const asset of keyAssets) {
      const assetPath = path.join(publicDir, asset);
      if (fs.existsSync(assetPath)) {
        console.log(`  ✅ ${asset} 存在`);
      } else {
        console.log(`  ❌ ${asset} 缺失`);
      }
    }
  } else {
    console.log('  ❌ public 目录缺失');
  }
  
  // 检查 favicon
  const faviconPath = path.join(publicDir, 'favicon.ico');
  if (fs.existsSync(faviconPath)) {
    console.log('  ✅ favicon.ico 存在');
  } else {
    console.log('  ⚠️  favicon.ico 缺失');
  }
  
} catch (error) {
  console.log('  ❌ 静态资源检测失败:', error.message);
}

console.log();

// 最终检查结果
console.log('✅ 构建错误预诊断检查完成！');

console.log('\n建议的优化措施:');
console.log('1. 定期运行 TypeScript 编译检查');
console.log('2. 检查依赖版本兼容性');
console.log('3. 验证静态资源文件完整性');
console.log('4. 确保所有导入路径正确');

console.log('\n检查完成。');