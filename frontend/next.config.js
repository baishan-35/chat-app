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
    // 在Vercel环境中，API请求应该直接访问后端服务器
    if (process.env.VERCEL) {
      return [
        {
          source: '/api/:path*',
          destination: process.env.BACKEND_URL ? `${process.env.BACKEND_URL}/api/:path*` : 'http://localhost:3007/api/:path*'
        }
      ];
    } else {
      // 在本地开发环境中，代理到本地后端服务器
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:3007/api/:path*'
        }
      ];
    }
  },
  
  // 添加静态资源路由保护
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Content-Type', value: 'application/manifest+json' },
        ],
      },
    ]
  }
}

module.exports = nextConfig;