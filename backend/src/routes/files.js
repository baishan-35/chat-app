const express = require('express');
const multer = require('multer');
const { authenticateToken } = require('../middleware/auth');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// 创建上传目录
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 文件类型白名单
const allowedFileTypes = [
  'image/jpeg',
  'image/png',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

// 文件大小限制 (10MB)
const maxFileSize = 10 * 1024 * 1024;

// 配置文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: maxFileSize // 限制10MB
  },
  fileFilter: (req, file, cb) => {
    // 检查文件类型
    if (allowedFileTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('不支持的文件类型。支持的类型: JPG, PNG, PDF, DOC'));
    }
  }
});

// 通用文件上传端点
router.post('/upload', authenticateToken, upload.array('files', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: '没有文件被上传'
      });
    }

    // 返回上传文件的信息
    const uploadedFiles = req.files.map(file => ({
      originalName: file.originalname,
      fileName: file.filename,
      size: file.size,
      mimetype: file.mimetype,
      path: `/uploads/${file.filename}`
    }));

    res.status(201).json({
      success: true,
      message: '文件上传成功',
      data: {
        files: uploadedFiles
      }
    });
  } catch (error) {
    console.error('文件上传错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 获取用户存储使用情况
router.get('/storage', authenticateToken, async (req, res) => {
  try {
    // 在实际应用中，这里应该查询数据库获取用户的存储使用情况
    // 目前返回模拟数据
    res.json({
      success: true,
      data: {
        used: 0, // 已使用存储空间（字节）
        limit: 100 * 1024 * 1024, // 存储空间限制（100MB）
        remaining: 100 * 1024 * 1024 // 剩余存储空间
      }
    });
  } catch (error) {
    console.error('获取存储信息错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

module.exports = router;