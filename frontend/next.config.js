/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  trailingSlash: false, // 设置为false以避免与Vercel重写规则冲突
  images: {
    unoptimized: process.env.NODE_ENV === 'production',
    domains: ['your-domain.vercel.app'],
  },
  experimental: {
    optimizeCss: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  reactStrictMode: true,
  swcMinify: true,
  
  // 添加API代理配置
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*'
      }
    ];
  }
}

const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  // 华为设备优化
  cacheStartUrl: true,
  dynamicStartUrl: false,
  dynamicStartUrlRedirect: '/',
});

module.exports = withPWA(nextConfig);