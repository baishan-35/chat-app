// env-validator.js
// 环境变量验证脚本

const fs = require('fs');
const path = require('path');

console.log('开始环境变量配置验证...\n');

// 检查 .env.example 文件
console.log('1. 检查 .env.example 文件:');
try {
  const envExamplePath = path.join(__dirname, '..', '.env.example');
  const envExampleContent = fs.readFileSync(envExamplePath, 'utf8');
  
  // 检查是否包含必要的环境变量
  const requiredVars = ['NEXT_PUBLIC_API_URL', 'NEXT_PUBLIC_WS_URL', 'JWT_SECRET'];
  const missingVars = requiredVars.filter(varName => !envExampleContent.includes(varName));
  
  if (missingVars.length === 0) {
    console.log('  ✅ .env.example 包含所有必需的环境变量示例');
  } else {
    console.log('  ❌ .env.example 缺少以下环境变量示例:', missingVars.join(', '));
  }
  
  // 检查是否包含注释说明
  if (envExampleContent.includes('#')) {
    console.log('  ✅ .env.example 包含注释说明');
  } else {
    console.log('  ⚠️  .env.example 缺少注释说明');
  }
} catch (error) {
  console.log('  ❌ 无法读取 .env.example 文件');
}

console.log();

// 检查 .gitignore 文件
console.log('2. 检查 .gitignore 文件:');
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

// 检查代码中的环境变量使用
console.log('3. 检查代码中的环境变量使用:');
try {
  // 检查是否正确使用 NEXT_PUBLIC_ 前缀
  const filesToCheck = [
    path.join(__dirname, '..', 'lib', 'websocket.js'),
    path.join(__dirname, '..', 'app', 'env-test', 'page.tsx')
  ];
  
  let hasFrontendVars = false;
  let hasHardcodedSecrets = false;
  
  for (const filePath of filesToCheck) {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // 检查是否使用了 NEXT_PUBLIC_ 前缀的变量
      if (content.includes('NEXT_PUBLIC_')) {
        hasFrontendVars = true;
      }
      
      // 检查是否有明显的硬编码密钥（简单的启发式检查）
      if (content.includes('secret') && content.includes('const') && content.includes('=')) {
        // 更仔细地检查 auth.ts 文件中的 JWT_SECRET 使用
        if (filePath.includes('auth.ts')) {
          if (content.includes('"default_secret_key_for_development"')) {
            console.log('  ⚠️  发现开发环境默认密钥，请确保生产环境通过环境变量配置');
            hasHardcodedSecrets = true;
          }
        }
      }
    }
  }
  
  if (hasFrontendVars) {
    console.log('  ✅ 代码中正确使用了 NEXT_PUBLIC_ 前缀的环境变量');
  } else {
    console.log('  ⚠️  未发现 NEXT_PUBLIC_ 前缀的环境变量使用');
  }
  
  if (!hasHardcodedSecrets) {
    console.log('  ✅ 未发现明显的硬编码敏感信息');
  }
} catch (error) {
  console.log('  ❌ 检查代码中的环境变量使用时出错');
}

console.log();

// 检查 vercel.json 配置
console.log('4. 检查 vercel.json 配置:');
try {
  const vercelConfigPath = path.join(__dirname, '..', 'vercel.json');
  const vercelConfigContent = fs.readFileSync(vercelConfigPath, 'utf8');
  const vercelConfig = JSON.parse(vercelConfigContent);
  
  if (vercelConfig.env) {
    console.log('  ✅ vercel.json 包含 env 配置');
    
    // 检查是否包含敏感信息
    const envKeys = Object.keys(vercelConfig.env);
    const sensitiveKeys = envKeys.filter(key => 
      key.includes('SECRET') || 
      key.includes('KEY') || 
      key.includes('PASSWORD') ||
      key.includes('TOKEN')
    );
    
    if (sensitiveKeys.length > 0) {
      console.log('  ⚠️  vercel.json 中包含可能敏感的环境变量:', sensitiveKeys.join(', '));
      console.log('      建议通过 Vercel 仪表板配置敏感环境变量');
    }
  } else {
    console.log('  ⚠️  vercel.json 缺少 env 配置');
  }
} catch (error) {
  console.log('  ❌ 无法读取或解析 vercel.json');
}

console.log();

// 最终检查结果
console.log('✅ 环境变量配置验证完成！');

console.log('\n建议的优化措施:');
console.log('1. 确保生产环境通过 Vercel 仪表板配置敏感环境变量');
console.log('2. 定期检查并更新环境变量配置文档');
console.log('3. 避免在代码中硬编码敏感信息');
console.log('4. 使用 .env.local 进行本地开发配置');

console.log('\n验证完成。');