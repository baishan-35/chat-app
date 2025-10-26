// build-artifact-analysis.js
// 构建产物分析脚本

const fs = require('fs');
const path = require('path');

console.log('开始构建产物分析...\n');

// 检查.next目录结构
console.log('1. .next目录结构检查:');
try {
  const nextDir = path.join(__dirname, '..', '.next');
  if (fs.existsSync(nextDir)) {
    console.log('  ✅ .next目录存在');
    
    // 检查关键子目录
    const requiredDirs = ['static', 'server', 'cache'];
    for (const dir of requiredDirs) {
      const dirPath = path.join(nextDir, dir);
      if (fs.existsSync(dirPath)) {
        console.log(`  ✅ ${dir}目录存在`);
      } else {
        console.log(`  ⚠️  ${dir}目录缺失`);
      }
    }
    
    // 检查关键文件
    const requiredFiles = [
      'BUILD_ID',
      'build-manifest.json',
      'prerender-manifest.json',
      'routes-manifest.json'
    ];
    
    for (const file of requiredFiles) {
      const filePath = path.join(nextDir, file);
      if (fs.existsSync(filePath)) {
        console.log(`  ✅ ${file}文件存在`);
      } else {
        console.log(`  ⚠️  ${file}文件缺失`);
      }
    }
  } else {
    console.log('  ❌ .next目录缺失');
  }
} catch (error) {
  console.log('  ❌ .next目录结构检查失败:', error.message);
}

console.log();

// 检查静态资源
console.log('2. 静态资源检查:');
try {
  const staticDir = path.join(__dirname, '..', '.next', 'static');
  if (fs.existsSync(staticDir)) {
    console.log('  ✅ static目录存在');
    
    // 检查chunks目录
    const chunksDir = path.join(staticDir, 'chunks');
    if (fs.existsSync(chunksDir)) {
      console.log('  ✅ chunks目录存在');
      
      // 列出主要的chunk文件
      const chunkFiles = fs.readdirSync(chunksDir);
      console.log(`  📦 发现${chunkFiles.length}个chunk文件`);
      
      // 检查是否有过大的chunk文件
      let largeChunks = 0;
      for (const file of chunkFiles) {
        if (file.endsWith('.js')) {
          const filePath = path.join(chunksDir, file);
          const stats = fs.statSync(filePath);
          const sizeInKB = stats.size / 1024;
          
          if (sizeInKB > 200) { // 大于200KB的chunk文件
            console.log(`  ⚠️  大型chunk文件: ${file} (${sizeInKB.toFixed(2)}KB)`);
            largeChunks++;
          }
        }
      }
      
      if (largeChunks === 0) {
        console.log('  ✅ 无过大的chunk文件');
      }
    } else {
      console.log('  ⚠️  chunks目录缺失');
    }
    
    // 检查CSS目录
    const cssDir = path.join(staticDir, 'css');
    if (fs.existsSync(cssDir)) {
      console.log('  ✅ css目录存在');
      const cssFiles = fs.readdirSync(cssDir);
      console.log(`  📦 发现${cssFiles.length}个CSS文件`);
    } else {
      console.log('  ⚠️  css目录缺失');
    }
  } else {
    console.log('  ⚠️  static目录缺失');
  }
} catch (error) {
  console.log('  ❌ 静态资源检查失败:', error.message);
}

console.log();

// 检查public目录静态资源
console.log('3. public目录静态资源检查:');
try {
  const publicDir = path.join(__dirname, '..', 'public');
  if (fs.existsSync(publicDir)) {
    console.log('  ✅ public目录存在');
    
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
        console.log(`  ✅ ${asset}存在`);
      } else {
        console.log(`  ❌ ${asset}缺失`);
      }
    }
    
    // 检查icons目录
    const iconsDir = path.join(publicDir, 'icons');
    if (fs.existsSync(iconsDir)) {
      const iconFiles = fs.readdirSync(iconsDir);
      console.log(`  📦 icons目录包含${iconFiles.length}个文件`);
    }
  } else {
    console.log('  ❌ public目录缺失');
  }
} catch (error) {
  console.log('  ❌ public目录静态资源检查失败:', error.message);
}

console.log();

// 检查依赖完整性
console.log('4. 依赖完整性检查:');
try {
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  const packageLockPath = path.join(__dirname, '..', 'package-lock.json');
  
  if (fs.existsSync(packageJsonPath)) {
    console.log('  ✅ package.json存在');
  } else {
    console.log('  ❌ package.json缺失');
  }
  
  if (fs.existsSync(packageLockPath)) {
    console.log('  ✅ package-lock.json存在');
  } else {
    console.log('  ⚠️  package-lock.json缺失');
  }
} catch (error) {
  console.log('  ❌ 依赖完整性检查失败:', error.message);
}

console.log();

// 最终检查结果
console.log('✅ 构建产物分析完成！');

console.log('\n建议的优化措施:');
console.log('1. 监控chunk文件大小，避免过大文件影响加载性能');
console.log('2. 确保所有静态资源文件完整且可访问');
console.log('3. 定期检查依赖完整性');
console.log('4. 验证构建产物在不同环境中的兼容性');

console.log('\n分析完成。');