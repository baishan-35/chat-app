const { validateDatabaseConnection } = require('../backend/src/utils/dbTest');

/**
 * 数据库连接验证脚本
 * 此脚本将测试Prisma与PostgreSQL数据库的连接
 */

async function runDatabaseConnectionTest() {
  console.log('=== 数据库连接验证测试 ===\n');
  
  try {
    // 运行数据库连接验证
    await validateDatabaseConnection();
    
    console.log('\n✓ 所有数据库连接测试通过');
    process.exit(0);
  } catch (error) {
    console.error('\n✗ 数据库连接测试失败:', error.message);
    process.exit(1);
  }
}

// 执行测试
runDatabaseConnectionTest();