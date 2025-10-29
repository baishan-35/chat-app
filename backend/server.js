const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./src/routes/auth');
const postsRoutes = require('./src/routes/posts');
const filesRoutes = require('./src/routes/files'); // 添加文件路由
const path = require('path');
const fs = require('fs');
const multer = require('multer'); // 添加 multer 导入

// 延迟加载Prisma客户端
let prisma;
let databaseAvailable = true;

try {
  const { PrismaClient } = require('@prisma/client');
  prisma = new PrismaClient();
} catch (error) {
  console.log('数据库不可用，使用模拟模式');
  databaseAvailable = false;
}

const app = express();
const PORT = 3011; // 更改端口为3011

// 创建上传目录
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 中间件
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3002', // 保持前端URL为3002
  credentials: true
}));

// 增加body-parser配置
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// 添加请求日志中间件
app.use((req, res, next) => {
  console.log('收到请求:', req.method, req.url);
  console.log('请求头:', req.headers);
  console.log('原始请求体:', req.rawBody);
  next();
});

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/files', filesRoutes); // 添加文件路由

// 健康检查端点
app.get('/health', async (req, res) => {
  try {
    // 检查数据库连接
    if (databaseAvailable && prisma) {
      await prisma.$queryRaw`SELECT 1`;
      res.status(200).json({
        success: true,
        message: '服务器运行正常',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(200).json({
        success: true,
        message: '服务器运行正常（模拟模式）',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('健康检查失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器健康检查失败'
    });
  }
});

// 根路径处理
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '后端服务运行正常',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      posts: '/api/posts',
      health: '/health',
      uploads: '/uploads'
    }
  });
});

// 全局错误处理中间件
app.use((err, req, res, next) => {
  console.error('未处理的错误:', err);
  
  // 特殊处理multer错误
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: '文件大小超出限制（最大10MB）'
      });
    }
  }
  
  // 特殊处理JSON解析错误
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: '请求体格式错误，请检查JSON格式是否正确'
    });
  }
  
  res.status(500).json({
    success: false,
    message: '服务器内部错误'
  });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '请求的资源不存在'
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器正在端口 ${PORT} 上运行`);
});

// 优雅关闭
process.on('SIGINT', async () => {
  console.log('正在关闭服务器...');
  if (databaseAvailable && prisma) {
    await prisma.$disconnect();
  }
  process.exit(0);
});