// ServiceWorkerRegister.tsx
// 专门用于注册Service Worker的客户端组件

"use client";

import { useEffect } from 'react';

// 华为友好的Service Worker注册
const registerServiceWorker = () => {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      // 华为浏览器优化：延迟注册以确保页面完全加载
      setTimeout(() => {
        navigator.serviceWorker
          .register('/sw.js')
          .then(registration => {
            console.log('华为友好的Service Worker registered: ', registration);
            
            // 检查是否有更新
            registration.onupdatefound = () => {
              const installingWorker = registration.installing;
              if (installingWorker == null) {
                return;
              }
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    // 新内容已可用，请刷新页面
                    console.log('华为浏览器：新内容已可用');
                  } else {
                    // 内容已缓存，可以离线使用
                    console.log('华为浏览器：内容已缓存，可离线使用');
                  }
                }
              };
            };
          })
          .catch(registrationError => {
            console.log('华为浏览器：Service Worker注册失败: ', registrationError);
          });
      }, 1000); // 华为优化：延迟1秒注册
    });
  }
};

export default function ServiceWorkerRegister() {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return null; // 这个组件不渲染任何UI
}