const jwt = require('jsonwebtoken');
// const { PrismaClient } = require('@prisma/client');

// const prisma = new PrismaClient();

// 创建一个标志来检查数据库是否可用
let databaseAvailable = true;
let prisma;

try {
  prisma = new PrismaClient();
} catch (error) {
  console.log('数据库不可用，使用模拟模式');
  databaseAvailable = false;
}

/**
 * JWT认证中间件
 * 验证HTTP Only Cookie中的访问令牌
 */
async function authenticateToken(req, res, next) {
  try {
    // 从cookies中获取访问令牌
    const token = req.cookies.accessToken;
    
    // 检查令牌是否存在
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '未提供访问令牌'
      });
    }
    
    // 验证令牌
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret_key_for_development');
    
    if (databaseAvailable) {
      try {
        // 查找用户
        const user = await prisma.user.findUnique({
          where: {
            id: decoded.userId
          },
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
            createdAt: true,
            updatedAt: true
          }
        });
        
        // 检查用户是否存在
        if (!user) {
          return res.status(401).json({
            success: false,
            message: '无效的访问令牌'
          });
        }
        
        // 将用户信息添加到请求对象
        req.user = user;
      } catch (dbError) {
        console.error('数据库错误，回退到模拟模式:', dbError);
        // 数据库错误时使用模拟用户
        req.user = {
          id: decoded.userId,
          email: 'user@example.com',
          name: '测试用户',
          avatar: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }
    } else {
      // 数据库不可用时使用模拟用户
      req.user = {
        id: decoded.userId,
        email: 'user@example.com',
        name: '测试用户',
        avatar: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
    
    next();
  } catch (error) {
    console.error('认证错误:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: '无效的访问令牌'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: '访问令牌已过期'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
}

module.exports = {
  authenticateToken
};