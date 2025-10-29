const jwt = require('jsonwebtoken');

// 生成测试令牌
const token = jwt.sign(
  { 
    userId: 'test_user',
    name: 'Test User'
  },
  'default_secret_key_for_development',
  { expiresIn: '1h' }
);

console.log('测试令牌:', token);

// 验证令牌
try {
  const decoded = jwt.verify(token, 'default_secret_key_for_development');
  console.log('解码后的令牌:', decoded);
} catch (error) {
  console.error('令牌验证失败:', error);
}