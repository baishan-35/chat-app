// runtime-error-prevention.js
// 生产环境运行时错误预防检测脚本

const fs = require('fs');
const path = require('path');

console.log('开始生产环境运行时错误预防检测...\n');

// 第一步：API路由检测
console.log('1. API路由检测:');
try {
  // 检查后端API路由文件
  const backendRoutesDir = path.join(__dirname, '..', '..', 'backend', 'src', 'routes');
  if (fs.existsSync(backendRoutesDir)) {
    const routeFiles = fs.readdirSync(backendRoutesDir);
    console.log('  ✅ 后端路由目录存在');
    
    for (const file of routeFiles) {
      const filePath = path.join(backendRoutesDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // 检查是否使用了Node.js特定模块
      const nodeSpecificModules = ['fs', 'path', 'os', 'cluster', 'child_process', 'crypto'];
      const usedModules = nodeSpecificModules.filter(module => 
        content.includes(`require('${module}')`) || 
        content.includes(`import ${module}`)
      );
      
      if (usedModules.length > 0) {
        console.log(`  ⚠️  ${file} 使用了Node.js特定模块: ${usedModules.join(', ')}`);
      } else {
        console.log(`  ✅ ${file} 未使用Node.js特定模块`);
      }
      
      // 检查错误处理
      if (content.includes('try') && content.includes('catch')) {
        console.log(`  ✅ ${file} 包含错误处理机制`);
      } else {
        console.log(`  ⚠️  ${file} 可能缺少错误处理机制`);
      }
      
      // 检查CORS配置
      if (content.includes('cors') || content.includes('CORS')) {
        console.log(`  ✅ ${file} 包含CORS配置`);
      } else {
        console.log(`  ⚠️  ${file} 可能缺少CORS配置`);
      }
    }
  } else {
    console.log('  ⚠️  后端路由目录不存在');
  }
  
  // 检查前端API调用
  const checkFrontendApiCalls = (dirPath) => {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const fullPath = path.join(dirPath, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        checkFrontendApiCalls(fullPath);
      } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          
          // 检查fetch调用的错误处理
          if (content.includes('fetch(')) {
            const fetchMatches = content.match(/fetch\([^)]+\)/g);
            if (fetchMatches) {
              for (const match of fetchMatches) {
                // 检查是否有对应的catch或错误处理
                const lines = content.split('\n');
                let found = false;
                for (let i = 0; i < lines.length; i++) {
                  if (lines[i].includes(match)) {
                    // 检查接下来的几行是否有catch或错误处理
                    for (let j = i; j < Math.min(i + 15, lines.length); j++) {
                      if (lines[j].includes('catch') || 
                          lines[j].includes('error') ||
                          lines[j].includes('try') ||
                          (lines[j].includes('response') && lines[j].includes('ok'))) {
                        found = true;
                        break;
                      }
                    }
                    break;
                  }
                }
                
                if (!found) {
                  console.log(`  ⚠️  ${file} 中的fetch调用可能缺少错误处理: ${match.substring(0, 50)}...`);
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
  
  checkFrontendApiCalls(path.join(__dirname, '..', 'app'));
  checkFrontendApiCalls(path.join(__dirname, '..', 'services'));
  
} catch (error) {
  console.log('  ❌ API路由检测失败:', error.message);
}

console.log();

// 第二步：客户端兼容性检测
console.log('2. 客户端兼容性检测:');
try {
  // 检查是否存在window/document的服务器端使用
  const checkServerSideWindowUsage = (dirPath) => {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const fullPath = path.join(dirPath, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        checkServerSideWindowUsage(fullPath);
      } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          
          // 检查是否在非客户端组件中使用window/document
          if (!content.includes('"use client"') && !file.includes('client')) {
            if ((content.includes('window.') || content.includes('document.')) &&
                !content.includes('typeof window !==') && 
                !content.includes('if (typeof window') &&
                !content.includes('typeof document !==') && 
                !content.includes('if (typeof document')) {
              console.log(`  ⚠️  ${file} 在服务器端组件中使用了window/document`);
            }
          }
          
          // 检查localStorage/sessionStorage使用
          if ((content.includes('localStorage') || content.includes('sessionStorage')) &&
              !content.includes('typeof window !==') && 
              !content.includes('typeof localStorage !==') &&
              !content.includes('if (typeof window') &&
              !content.includes('if (typeof localStorage') &&
              !content.includes('typeof sessionStorage !==') &&
              !content.includes('if (typeof sessionStorage')) {
            // 检查是否在客户端组件中
            if (content.includes('"use client"')) {
              console.log(`  ⚠️  ${file} 中localStorage/sessionStorage使用可能不安全`);
            } else {
              console.log(`  ⚠️  ${file} 在服务器端组件中使用localStorage/sessionStorage`);
            }
          }
        } catch (error) {
          console.log(`  ❌ 读取文件时出错: ${file}`);
        }
      }
    }
  };
  
  checkServerSideWindowUsage(path.join(__dirname, '..', 'app'));
  checkServerSideWindowUsage(path.join(__dirname, '..', 'components'));
  checkServerSideWindowUsage(path.join(__dirname, '..', 'lib'));
  
  // 检查WebSocket连接处理
  const websocketFile = path.join(__dirname, '..', 'lib', 'websocket.js');
  if (fs.existsSync(websocketFile)) {
    const content = fs.readFileSync(websocketFile, 'utf8');
    
    // 检查WebSocket URL配置
    if (content.includes('process.env.NEXT_PUBLIC_WS_URL') || 
        content.includes('window.location.protocol') ||
        content.includes('window.location.host')) {
      console.log('  ✅ WebSocket连接处理正确');
    } else {
      console.log('  ⚠️  WebSocket连接配置可能不正确');
    }
    
    // 检查错误处理
    if (content.includes('onerror') && content.includes('onclose')) {
      console.log('  ✅ WebSocket包含错误处理机制');
    } else {
      console.log('  ⚠️  WebSocket可能缺少错误处理机制');
    }
  }
  
} catch (error) {
  console.log('  ❌ 客户端兼容性检测失败:', error.message);
}

console.log();

// 第三步：PWA配置验证
console.log('3. PWA配置验证:');
try {
  // 检查Service Worker文件
  const swFile = path.join(__dirname, '..', 'public', 'sw.js');
  if (fs.existsSync(swFile)) {
    console.log('  ✅ Service Worker文件存在');
  } else {
    console.log('  ❌ Service Worker文件缺失');
  }
  
  // 检查Manifest文件
  const manifestFile = path.join(__dirname, '..', 'public', 'manifest.json');
  if (fs.existsSync(manifestFile)) {
    const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
    console.log('  ✅ Manifest文件存在');
    
    // 检查必要字段
    const requiredFields = ['name', 'short_name', 'start_url', 'display', 'background_color', 'theme_color'];
    const missingFields = requiredFields.filter(field => !manifest[field]);
    
    if (missingFields.length === 0) {
      console.log('  ✅ Manifest包含所有必要字段');
    } else {
      console.log(`  ⚠️  Manifest缺少字段: ${missingFields.join(', ')}`);
    }
  } else {
    console.log('  ❌ Manifest文件缺失');
  }
  
  // 检查图标文件
  const iconsDir = path.join(__dirname, '..', 'public', 'icons');
  if (fs.existsSync(iconsDir)) {
    const iconFiles = fs.readdirSync(iconsDir);
    console.log(`  ✅ 图标目录存在，包含${iconFiles.length}个文件`);
    
    // 检查必要尺寸的图标
    const requiredSizes = ['192x192', '512x512'];
    const missingIcons = requiredSizes.filter(size => 
      !iconFiles.some(file => file.includes(size))
    );
    
    if (missingIcons.length === 0) {
      console.log('  ✅ 包含所有必要尺寸的图标');
    } else {
      console.log(`  ⚠️  缺少必要尺寸的图标: ${missingIcons.join(', ')}`);
    }
  } else {
    console.log('  ❌ 图标目录缺失');
  }
  
} catch (error) {
  console.log('  ❌ PWA配置验证失败:', error.message);
}

console.log();

// 最终检查结果
console.log('✅ 生产环境运行时错误预防检测完成！');

console.log('\n建议的优化措施:');
console.log('1. 确保所有API调用都有适当的错误处理');
console.log('2. 验证服务器端组件中不使用window/document');
console.log('3. 确保localStorage/sessionStorage使用安全');
console.log('4. 验证WebSocket连接处理正确');
console.log('5. 检查PWA相关文件完整性和正确性');

console.log('\n检测完成。');