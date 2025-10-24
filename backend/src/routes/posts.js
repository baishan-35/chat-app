const express = require('express');
const multer = require('multer');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// 创建一个标志来检查数据库是否可用
let databaseAvailable = true;
let prisma;

try {
  const { PrismaClient } = require('@prisma/client');
  prisma = new PrismaClient();
  console.log('数据库连接成功');
} catch (error) {
  console.log('数据库不可用，使用模拟模式');
  databaseAvailable = false;
  prisma = null; // 明确设置为null
}

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

// 创建动态（表单数据）
router.post('/', authenticateToken, upload.array('images', 9), async (req, res) => {
  try {
    const { content } = req.body;
    const userId = req.user.id;
    
    // 验证输入
    if (!content && (!req.files || req.files.length === 0)) {
      return res.status(400).json({
        success: false,
        message: '内容或图片不能为空'
      });
    }
    
    console.log('Database available:', databaseAvailable);
    console.log('Prisma object:', prisma);
    console.log('Prisma post model:', prisma?.post);
    
    if (!databaseAvailable || !prisma || !prisma.post) {
      console.log('Using mock mode');
      // 模拟创建帖子
      const mockPost = {
        id: `post_${Date.now()}`,
        content: content || '',
        images: req.files ? req.files.map(file => `/uploads/${file.filename}`) : [],
        author: req.user,
        likes: [],
        comments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      return res.status(201).json({
        success: true,
        message: '动态发布成功（模拟模式）',
        data: mockPost
      });
    } else {
      console.log('Using database mode');
      // 只有在数据库可用时才执行以下代码
      // 处理图片路径
      const imagePaths = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
      
      // 创建帖子
      const post = await prisma.post.create({
        data: {
          content: content || '',
          images: imagePaths,
          author: {
            connect: { id: userId }
          }
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true
            }
          },
          likes: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          },
          comments: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      });
      
      res.status(201).json({
        success: true,
        message: '动态发布成功',
        data: post
      });
    }
  } catch (error) {
    console.error('创建动态错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 分页获取动态
router.get('/', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    if (!databaseAvailable || !prisma) {
      // 模拟返回帖子列表
      const mockPosts = [
        {
          id: 'post_1',
          content: '这是模拟的动态内容',
          images: [],
          author: {
            id: req.user.id,
            name: req.user.name,
            email: req.user.email,
            avatar: req.user.avatar
          },
          likes: [],
          comments: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      
      return res.json({
        success: true,
        message: '获取动态成功（模拟模式）',
        data: {
          posts: mockPosts,
          pagination: {
            page,
            limit,
            total: 1,
            totalPages: 1
          }
        }
      });
    }
    
    // 获取帖子列表
    const posts = await prisma.post.findMany({
      skip: skip,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        likes: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });
    
    // 获取总数
    const total = await prisma.post.count();
    
    res.json({
      success: true,
      message: '获取动态成功',
      data: {
        posts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('获取动态错误:', error);
    // 返回模拟数据而不是错误
    const mockPosts = [
      {
        id: 'post_1',
        content: '这是模拟的动态内容',
        images: [],
        author: {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email,
          avatar: req.user.avatar
        },
        likes: [],
        comments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    res.json({
      success: true,
      message: '获取动态成功（模拟模式）',
      data: {
        posts: mockPosts,
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1
        }
      }
    });
  }
});

// 点赞切换
router.post('/:id/likes', authenticateToken, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;
    
    if (!databaseAvailable || !prisma || !prisma.post) {
      // 模拟点赞操作
      return res.json({
        success: true,
        message: '点赞成功（模拟模式）',
        data: { liked: true }
      });
    }
    
    // 检查帖子是否存在
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: '动态不存在'
      });
    }
    
    // 检查是否已经点赞
    const existingLike = await prisma.like.findFirst({
      where: {
        postId: postId,
        userId: userId
      }
    });
    
    let result;
    if (existingLike) {
      // 取消点赞
      await prisma.like.delete({
        where: { id: existingLike.id }
      });
      result = { liked: false, message: '取消点赞成功' };
    } else {
      // 添加点赞
      await prisma.like.create({
        data: {
          post: {
            connect: { id: postId }
          },
          user: {
            connect: { id: userId }
          }
        }
      });
      result = { liked: true, message: '点赞成功' };
    }
    
    res.json({
      success: true,
      message: result.message,
      data: result
    });
  } catch (error) {
    console.error('点赞操作错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 添加评论
router.post('/:id/comments', authenticateToken, async (req, res) => {
  try {
    const postId = req.params.id;
    const { content, parentId } = req.body;
    const userId = req.user.id;
    
    // 验证输入
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: '评论内容不能为空'
      });
    }
    
    if (!databaseAvailable || !prisma) {
      // 模拟添加评论
      const mockComment = {
        id: `comment_${Date.now()}`,
        content: content.trim(),
        author: {
          id: userId,
          name: req.user.name,
          email: req.user.email,
          avatar: req.user.avatar
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      return res.status(201).json({
        success: true,
        message: '评论发表成功（模拟模式）',
        data: mockComment
      });
    }
    
    // 检查帖子是否存在
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: '动态不存在'
      });
    }
    
    // 创建评论
    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        post: {
          connect: { id: postId }
        },
        author: {
          connect: { id: userId }
        },
        ...(parentId && {
          parent: {
            connect: { id: parentId }
          }
        })
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      }
    });
    
    res.status(201).json({
      success: true,
      message: '评论发表成功',
      data: comment
    });
  } catch (error) {
    console.error('添加评论错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

module.exports = router;