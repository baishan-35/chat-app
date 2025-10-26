// 首页
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Home() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    // 处理PWA安装提示
    const handleBeforeInstallPrompt = (e: any) => {
      // 阻止默认的安装提示
      e.preventDefault();
      // 保存事件以便稍后触发
      setDeferredPrompt(e);
      // 显示安装按钮
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      // 显示安装提示
      deferredPrompt.prompt();
      // 等待用户响应
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        // 清除保存的事件
        setDeferredPrompt(null);
        setShowInstallButton(false);
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">欢迎使用聊天应用</h1>
        <p className="text-lg text-gray-600 mb-8">这是一个实时聊天应用的演示</p>
        
        <div className="space-y-4">
          <Link 
            href="/login" 
            className="inline-block w-full py-3 px-6 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors duration-200"
          >
            登录
          </Link>
          
          {showInstallButton && (
            <button
              onClick={handleInstallClick}
              className="inline-block w-full py-3 px-6 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors duration-200"
            >
              安装应用
            </button>
          )}
          
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">功能特性</h2>
            <ul className="text-left space-y-2 text-gray-600">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                实时消息传递
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                用户认证系统
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                WebSocket连接
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                响应式设计
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                离线支持 (PWA)
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                移动端优化
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}