const { PrismaClient } = require('@prisma/client');

async function testDatabaseConnection() {
  const prisma = new PrismaClient();
  
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('数据库连接成功');
  } catch (error) {
    console.error('数据库连接失败:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseConnection();