const { testConnection, closeConnection } = require('../lib/db');

/**
 * 数据库连接验证脚本
 * 运行方式: node src/utils/dbTest.js
 */
async function validateDatabaseConnection() {
  console.log('开始验证数据库连接...');
  
  try {
    // 测试数据库连接
    const isConnected = await testConnection();
    
    if (isConnected) {
      console.log('✓ 数据库连接验证成功');
    } else {
      console.log('✗ 数据库连接验证失败');
      process.exit(1);
    }
  } catch (error) {
    console.error('数据库连接验证过程中发生错误:', error);
    process.exit(1);
  } finally {
    // 关闭数据库连接
    await closeConnection();
  }
}

// 如果直接运行此脚本，则执行验证
if (require.main === module) {
  validateDatabaseConnection();
}

module.exports = {
  validateDatabaseConnection
};