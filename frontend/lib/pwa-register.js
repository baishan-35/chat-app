// PWA注册文件
export function register() {
  // 只在浏览器环境中注册Service Worker
  if (typeof window !== 'undefined' && typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then(registration => {
          console.log('SW registered: ', registration);
          
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
                  console.log('New content is available and will be used when all tabs for this page are closed.');
                } else {
                  // 内容已缓存，可以离线使用
                  console.log('Content is cached for offline use.');
                }
              }
            };
          };
        })
        .catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
}

export function unregister() {
  // 只在浏览器环境中注销Service Worker
  if (typeof window !== 'undefined' && typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(registration => {
        registration.unregister();
      })
      .catch(error => {
        console.error(error.message);
      });
  }
}