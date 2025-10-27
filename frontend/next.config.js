const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 移除可能引起问题的实验性功能
  experimental: {
    // 暂时禁用所有实验性功能
  },

  // 确保输出模式正确
  output: 'standalone',

  // 简化图像配置
  images: {
    domains: [],
    unoptimized: true, // Vercel会自动优化
  },

  // 移除可能冲突的编译器选项
  compiler: {
    // removeConsole: false // 暂时禁用
  },

  // 确保TypeScript严格模式适中
  typescript: {
    ignoreBuildErrors: false,
  },

  // 保持基本配置
  reactStrictMode: true,
  swcMinify: true,
}

module.exports = withPWA(nextConfig);