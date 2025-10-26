// vercel-build-cache.config.js
// Vercel构建缓存优化配置

module.exports = {
  // 缓存策略配置
  cache: {
    // 缓存工作区
    workspaces: [
      '.next/cache',
      'node_modules/.cache',
      '.vercel'
    ],
    
    // 缓存依赖
    dependencies: {
      // Next.js相关缓存
      next: [
        '.next/cache/images',
        '.next/cache/fetch-cache',
        '.next/cache/webpack',
        '.next/cache/queries'
      ],
      
      // 其他依赖缓存
      swc: ['.next/cache/swc'],
      terser: ['.next/cache/terser-cache']
    },
    
    // 缓存生命周期配置
    ttl: {
      // 开发环境缓存时间（分钟）
      development: 30,
      // 生产环境缓存时间（分钟）
      production: 1440 // 24小时
    }
  },
  
  // 构建优化配置
  optimization: {
    // 并行构建
    parallel: true,
    
    // 内存限制（MB）
    memoryLimit: 2048,
    
    // 构建缓存键
    cacheKey: process.env.VERCEL_GIT_COMMIT_SHA || 'default'
  },
  
  // 环境特定配置
  environments: {
    development: {
      // 开发环境不使用缓存
      useCache: false,
      // 开发环境构建优化
      optimization: {
        minimize: false,
        sourceMap: true
      }
    },
    
    production: {
      // 生产环境使用缓存
      useCache: true,
      // 生产环境构建优化
      optimization: {
        minimize: true,
        sourceMap: false
      }
    }
  }
};