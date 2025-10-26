// pwa-test/page.tsx
// PWA功能测试页面

"use client";

import { useState, useEffect } from 'react';
import styles from './page.module.css';

interface TestResults {
  serviceWorker?: boolean;
  cacheAPI?: boolean;
  pushNotifications?: boolean;
  offlineSupport?: boolean;
  installSupport?: boolean;
  networkStatus?: string;
  storage?: string;
  screenOrientation?: string;
  huaweiOptimization?: string;
}

export default function PWATestPage() {
  const [testResults, setTestResults] = useState<TestResults>({});
  const [isHuaweiDevice, setIsHuaweiDevice] = useState(false);

  useEffect(() => {
    // 检测华为设备
    const userAgent = navigator.userAgent.toLowerCase();
    const isHuawei = userAgent.includes('huawei') || 
                     userAgent.includes('honor') || 
                     userAgent.includes('huaweibrowser');
    setIsHuaweiDevice(isHuawei);
    
    // 执行自动测试
    runAutoTests();
  }, []);

  // 自动运行测试
  const runAutoTests = async () => {
    const results: TestResults = {};
    
    // 测试Service Worker
    results.serviceWorker = 'serviceWorker' in navigator;
    
    // 测试缓存API
    results.cacheAPI = 'caches' in window;
    
    // 测试推送通知支持
    results.pushNotifications = 'PushManager' in window;
    
    // 测试离线支持
    results.offlineSupport = 'serviceWorker' in navigator && 'caches' in window;
    
    // 测试Web App安装支持
    results.installSupport = 'beforeinstallprompt' in window;
    
    setTestResults(results);
  };

  // 手动测试功能
  const runManualTests = async () => {
    const results: TestResults = { ...testResults };
    
    try {
      // 测试网络状态
      results.networkStatus = navigator.onLine ? '在线' : '离线';
      
      // 测试存储空间
      if (navigator.storage && navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        if (estimate.usage !== undefined && estimate.quota !== undefined) {
          results.storage = `${Math.round(estimate.usage / 1024 / 1024)}MB / ${Math.round(estimate.quota / 1024 / 1024)}MB`;
        }
      }
      
      // 测试屏幕方向
      results.screenOrientation = screen.orientation ? screen.orientation.type : '未知';
      
      // 测试华为特有功能
      if (isHuaweiDevice) {
        results.huaweiOptimization = '已检测到华为设备，已应用优化';
      } else {
        results.huaweiOptimization = '非华为设备';
      }
    } catch (error) {
      console.error('测试过程中出错:', error);
    }
    
    setTestResults(results);
  };

  // 触发安装提示
  const triggerInstallPrompt = () => {
    // 这里可以添加安装提示逻辑
    alert('在华为设备上，请通过浏览器菜单选择"添加到主屏幕"来安装应用');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>PWA功能测试</h1>
        <p className={styles.description}>
          {isHuaweiDevice 
            ? '华为设备PWA兼容性测试' 
            : 'PWA功能测试页面'}
        </p>
      </div>

      <div className={styles.content}>
        <div className={styles.testSection}>
          <h2 className={styles.sectionTitle}>自动测试结果</h2>
          <div className={styles.testGrid}>
            <div className={styles.testItem}>
              <span className={styles.testLabel}>Service Worker支持</span>
              <span className={styles.testValue}>
                {testResults.serviceWorker ? '✅ 支持' : '❌ 不支持'}
              </span>
            </div>
            
            <div className={styles.testItem}>
              <span className={styles.testLabel}>缓存API支持</span>
              <span className={styles.testValue}>
                {testResults.cacheAPI ? '✅ 支持' : '❌ 不支持'}
              </span>
            </div>
            
            <div className={styles.testItem}>
              <span className={styles.testLabel}>推送通知支持</span>
              <span className={styles.testValue}>
                {testResults.pushNotifications ? '✅ 支持' : '❌ 不支持'}
              </span>
            </div>
            
            <div className={styles.testItem}>
              <span className={styles.testLabel}>离线功能支持</span>
              <span className={styles.testValue}>
                {testResults.offlineSupport ? '✅ 支持' : '❌ 不支持'}
              </span>
            </div>
            
            <div className={styles.testItem}>
              <span className={styles.testLabel}>安装支持</span>
              <span className={styles.testValue}>
                {testResults.installSupport ? '✅ 支持' : '❌ 不支持'}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.testSection}>
          <h2 className={styles.sectionTitle}>手动测试</h2>
          <button 
            className={styles.testButton}
            onClick={runManualTests}
          >
            运行手动测试
          </button>
          
          {Object.keys(testResults).length > 5 && (
            <div className={styles.testGrid}>
              <div className={styles.testItem}>
                <span className={styles.testLabel}>网络状态</span>
                <span className={styles.testValue}>{testResults.networkStatus}</span>
              </div>
              
              <div className={styles.testItem}>
                <span className={styles.testLabel}>存储空间</span>
                <span className={styles.testValue}>{testResults.storage}</span>
              </div>
              
              <div className={styles.testItem}>
                <span className={styles.testLabel}>屏幕方向</span>
                <span className={styles.testValue}>{testResults.screenOrientation}</span>
              </div>
              
              <div className={styles.testItem}>
                <span className={styles.testLabel}>华为优化</span>
                <span className={styles.testValue}>{testResults.huaweiOptimization}</span>
              </div>
            </div>
          )}
        </div>

        <div className={styles.testSection}>
          <h2 className={styles.sectionTitle}>安装测试</h2>
          <button 
            className={styles.testButton}
            onClick={triggerInstallPrompt}
          >
            {isHuaweiDevice ? '华为安装说明' : '触发安装提示'}
          </button>
          
          <div className={styles.installGuide}>
            <h3 className={styles.guideTitle}>安装指南</h3>
            {isHuaweiDevice ? (
              <ul className={styles.guideList}>
                <li>1. 点击浏览器右上角菜单</li>
                <li>2. 选择"添加到主屏幕"</li>
                <li>3. 确认添加</li>
                <li>4. 在桌面找到应用图标并启动</li>
              </ul>
            ) : (
              <ul className={styles.guideList}>
                <li>1. 浏览器会自动提示安装</li>
                <li>2. 点击安装按钮</li>
                <li>3. 确认安装</li>
                <li>4. 在桌面找到应用图标并启动</li>
              </ul>
            )}
          </div>
        </div>

        <div className={styles.testSection}>
          <h2 className={styles.sectionTitle}>华为特调测试</h2>
          <div className={styles.huaweiTests}>
            <div className={styles.testItem}>
              <span className={styles.testLabel}>设备检测</span>
              <span className={styles.testValue}>
                {isHuaweiDevice ? '✅ 华为设备' : '📱 其他设备'}
              </span>
            </div>
            
            <div className={styles.testItem}>
              <span className={styles.testLabel}>优化状态</span>
              <span className={styles.testValue}>
                {isHuaweiDevice ? '🔧 已应用华为优化' : '⚙️ 标准优化'}
              </span>
            </div>
          </div>
          
          <div className={styles.huaweiGuide}>
            <h3 className={styles.guideTitle}>华为设备测试要点</h3>
            <ul className={styles.guideList}>
              <li>• 检查状态栏颜色适配</li>
              <li>• 验证输入法弹出布局</li>
              <li>• 测试手势操作流畅性</li>
              <li>• 验证推送通知显示</li>
              <li>• 检查离线功能表现</li>
            </ul>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <p>© 2023 私密聊天 - 我们的空间</p>
      </div>
    </div>
  );
}