const { PrismaClient } = require('@prisma/client');

// 初始化Prisma客户端
const prisma = new PrismaClient();

/**
 * 数据库连接测试
 * @returns {Promise<boolean>} 连接是否成功
 */
async function testConnection() {
  try {
    // 执行简单的查询来测试连接
    await prisma.$queryRaw`SELECT 1`;
    console.log('数据库连接成功');
    return true;
  } catch (error) {
    console.error('数据库连接失败:', error);
    return false;
  }
}

/**
 * 关闭数据库连接
 */
async function closeConnection() {
  try {
    await prisma.$disconnect();
    console.log('数据库连接已关闭');
  } catch (error) {
    console.error('关闭数据库连接时出错:', error);
  }
}

module.exports = {
  prisma,
  testConnection,
  closeConnection
};