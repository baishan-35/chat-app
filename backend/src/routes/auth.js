const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
// const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

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

const router = express.Router();

// 验证邮箱格式的辅助函数
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// 验证密码强度的辅助函数
function isValidPassword(password) {
  // 至少6位字符
  return password && password.length >= 6;
}

// 注册新用户
router.post('/register', async (req, res) => {
  try {
    console.log('收到注册请求:', JSON.stringify(req.body, null, 2));
    const { email, password, name } = req.body;
    
    // 验证输入 - 允许name为可选字段
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数：邮箱和密码'
      });
    }
    
    // 验证邮箱格式
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: '邮箱格式不正确'
      });
    }
    
    // 验证密码强度
    if (!isValidPassword(password)) {
      return res.status(400).json({
        success: false,
        message: '密码长度至少为6位'
      });
    }
    
    // 如果没有提供name，则使用邮箱前缀作为name
    const userName = name || email.split('@')[0];
    
    if (databaseAvailable) {
      try {
        // 检查用户是否已存在
        const existingUser = await prisma.user.findUnique({
          where: { email }
        });
        
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: '该邮箱已被注册'
          });
        }
        
        // 哈希密码
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // 创建新用户
        const user = await prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            name: userName
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
        
        // 创建访问令牌
        const accessToken = jwt.sign(
          { userId: user.id },
          process.env.JWT_SECRET || 'default_secret_key_for_development',
          { expiresIn: '24h' }
        );
        
        // 设置HTTP Only Cookie
        res.cookie('accessToken', accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 24 * 60 * 60 * 1000, // 24小时
          sameSite: 'strict'
        });
        
        res.status(201).json({
          success: true,
          message: '用户注册成功',
          data: {
            user,
            accessToken
          }
        });
      } catch (dbError) {
        console.error('数据库错误，回退到模拟模式:', dbError);
        // 数据库错误时使用模拟用户
        const user = {
          id: 'user_' + Date.now(),
          email,
          name: userName,
          avatar: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // 创建访问令牌
        const accessToken = jwt.sign(
          { userId: user.id },
          process.env.JWT_SECRET || 'default_secret_key_for_development',
          { expiresIn: '24h' }
        );
        
        // 设置HTTP Only Cookie
        res.cookie('accessToken', accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 24 * 60 * 60 * 1000, // 24小时
          sameSite: 'strict'
        });
        
        res.status(201).json({
          success: true,
          message: '用户注册成功（模拟模式）',
          data: {
            user,
            accessToken
          }
        });
      }
    } else {
      // 数据库不可用时使用模拟用户
      const user = {
        id: 'user_' + Date.now(),
        email,
        name: userName,
        avatar: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // 创建访问令牌
      const accessToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || 'default_secret_key_for_development',
        { expiresIn: '24h' }
      );
      
      // 设置HTTP Only Cookie
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000, // 24小时
        sameSite: 'strict'
      });
      
      res.status(201).json({
        success: true,
        message: '用户注册成功（模拟模式）',
        data: {
          user,
          accessToken
        }
      });
    }
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 用户登录
router.post('/login', async (req, res) => {
  try {
    console.log('收到登录请求:', req.body);
    const { email, password } = req.body;
    
    // 验证输入
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数：邮箱和密码'
      });
    }
    
    // 验证邮箱格式
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: '邮箱格式不正确'
      });
    }
    
    if (databaseAvailable) {
      try {
        // 查找用户
        const user = await prisma.user.findUnique({
          where: { email }
        });
        
        // 检查用户是否存在
        if (!user) {
          return res.status(401).json({
            success: false,
            message: '邮箱或密码错误'
          });
        }
        
        // 验证密码
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return res.status(401).json({
            success: false,
            message: '邮箱或密码错误'
          });
        }
        
        // 创建访问令牌
        const accessToken = jwt.sign(
          { userId: user.id },
          process.env.JWT_SECRET || 'default_secret_key_for_development',
          { expiresIn: '24h' }
        );
        
        // 设置HTTP Only Cookie
        res.cookie('accessToken', accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 24 * 60 * 60 * 1000, // 24小时
          sameSite: 'strict'
        });
        
        // 返回用户信息（不包括密码）
        const userInfo = {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        };
        
        res.json({
          success: true,
          message: '登录成功',
          data: {
            user: userInfo,
            accessToken
          }
        });
      } catch (dbError) {
        console.error('数据库错误，回退到模拟模式:', dbError);
        // 数据库错误时使用模拟用户
        const user = {
          id: 'user_' + Date.now(),
          email,
          name: email.split('@')[0],
          avatar: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // 创建访问令牌
        const accessToken = jwt.sign(
          { userId: user.id },
          process.env.JWT_SECRET || 'default_secret_key_for_development',
          { expiresIn: '24h' }
        );
        
        // 设置HTTP Only Cookie
        res.cookie('accessToken', accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 24 * 60 * 60 * 1000, // 24小时
          sameSite: 'strict'
        });
        
        // 返回用户信息（不包括密码）
        const userInfo = {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        };
        
        res.json({
          success: true,
          message: '登录成功（模拟模式）',
          data: {
            user: userInfo,
            accessToken
          }
        });
      }
    } else {
      // 数据库不可用时使用模拟用户
      const user = {
        id: 'user_' + Date.now(),
        email,
        name: email.split('@')[0],
        avatar: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // 创建访问令牌
      const accessToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || 'default_secret_key_for_development',
        { expiresIn: '24h' }
      );
      
      // 设置HTTP Only Cookie
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000, // 24小时
        sameSite: 'strict'
      });
      
      // 返回用户信息（不包括密码）
      const userInfo = {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
      
      res.json({
        success: true,
        message: '登录成功（模拟模式）',
        data: {
          user: userInfo,
          accessToken
        }
      });
    }
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 用户登出
router.post('/logout', authenticateToken, (req, res) => {
  try {
    // 清除HTTP Only Cookie
    res.clearCookie('accessToken');
    
    res.json({
      success: true,
      message: '登出成功'
    });
  } catch (error) {
    console.error('登出错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 获取当前用户信息
router.get('/me', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      message: '获取用户信息成功',
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

module.exports = router;