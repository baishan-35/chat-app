// offline/page.tsx
// 华为友好的离线提示页面

"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function OfflinePage() {
  const [isHuaweiDevice, setIsHuaweiDevice] = useState(false);

  useEffect(() => {
    // 检测是否为华为设备
    const userAgent = navigator.userAgent.toLowerCase();
    const isHuawei = userAgent.includes('huawei') || 
                     userAgent.includes('honor') || 
                     userAgent.includes('huaweibrowser');
    setIsHuaweiDevice(isHuawei);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.iconContainer}>
          <div className={styles.iconBackground}>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-12 w-12 text-gray-600" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" 
              />
            </svg>
          </div>
        </div>
        
        <h1 className={styles.title}>
          {isHuaweiDevice ? '网络连接异常' : '离线模式'}
        </h1>
        
        <p className={styles.description}>
          {isHuaweiDevice 
            ? '检测到您的设备网络连接不稳定，请检查网络设置后重试。' 
            : '您当前处于离线状态，无法访问最新内容。'}
        </p>
        
        <div className={styles.tipsContainer}>
          <h2 className={styles.tipsTitle}>您可以尝试：</h2>
          <ul className={styles.tipsList}>
            <li className={styles.tipsListItem}>• 检查设备的网络连接设置</li>
            <li className={styles.tipsListItem}>• 切换到其他网络（如Wi-Fi或移动数据）</li>
            <li className={styles.tipsListItem}>• 重启网络连接</li>
            {isHuaweiDevice && (
              <>
                <li className={styles.tipsListItem}>• 检查华为浏览器的离线设置</li>
                <li className={styles.tipsListItem}>• 清理浏览器缓存后重试</li>
              </>
            )}
          </ul>
        </div>
        
        <div className={styles.buttonContainer}>
          <button
            onClick={() => window.location.reload()}
            className={styles.retryButton}
          >
            重新加载页面
          </button>
          
          <Link 
            href="/dashboard/chat" 
            className={styles.chatButton}
          >
            返回聊天
          </Link>
        </div>
        
        {isHuaweiDevice && (
          <div className={styles.huaweiTips}>
            <p>华为设备优化提示：如问题持续存在，请尝试清除浏览器数据</p>
          </div>
        )}
      </div>
      
      <div className={styles.footer}>
        <p>© 2023 私密聊天 - 我们的空间</p>
      </div>
    </div>
  );
}