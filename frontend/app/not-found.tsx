// app/not-found.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '页面未找到 - 私密聊天',
  description: '抱歉，您访问的页面不存在',
}

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">页面未找到</p>
        <a 
          href="/"
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
        >
          返回首页
        </a>
      </div>
    </div>
  )
}