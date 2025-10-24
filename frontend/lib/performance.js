// performance.js
// 性能监控库

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      pageLoadTime: null,
      memoryUsage: null,
      messageLatency: [],
      apiResponseTimes: []
    };
    this.startTime = null;
    this.messageTimers = new Map();
  }

  // 记录页面加载开始时间
  startPageLoad() {
    this.startTime = performance.now();
  }

  // 记录页面加载完成时间
  endPageLoad() {
    if (this.startTime !== null) {
      this.metrics.pageLoadTime = performance.now() - this.startTime;
      this.startTime = null;
      console.log(`页面加载时间: ${this.metrics.pageLoadTime.toFixed(2)}ms`);
    }
  }

  // 记录消息发送时间
  startMessageTimer(messageId) {
    this.messageTimers.set(messageId, performance.now());
  }

  // 记录消息接收时间并计算延迟
  endMessageTimer(messageId) {
    const startTime = this.messageTimers.get(messageId);
    if (startTime) {
      const latency = performance.now() - startTime;
      this.metrics.messageLatency.push({
        messageId,
        latency,
        timestamp: Date.now()
      });
      this.messageTimers.delete(messageId);
      console.log(`消息延迟: ${latency.toFixed(2)}ms`);
      return latency;
    }
    return null;
  }

  // 记录API请求开始时间
  startApiTimer(apiName) {
    return performance.now();
  }

  // 记录API请求结束时间并计算响应时间
  endApiTimer(apiName, startTime) {
    const responseTime = performance.now() - startTime;
    this.metrics.apiResponseTimes.push({
      apiName,
      responseTime,
      timestamp: Date.now()
    });
    console.log(`${apiName} 响应时间: ${responseTime.toFixed(2)}ms`);
    return responseTime;
  }

  // 获取内存使用情况
  getMemoryUsage() {
    if (performance.memory) {
      this.metrics.memoryUsage = {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      };
      return this.metrics.memoryUsage;
    }
    return null;
  }

  // 获取平均消息延迟
  getAverageMessageLatency() {
    if (this.metrics.messageLatency.length === 0) return 0;
    const total = this.metrics.messageLatency.reduce((sum, item) => sum + item.latency, 0);
    return total / this.metrics.messageLatency.length;
  }

  // 获取平均API响应时间
  getAverageApiResponseTime() {
    if (this.metrics.apiResponseTimes.length === 0) return 0;
    const total = this.metrics.apiResponseTimes.reduce((sum, item) => sum + item.responseTime, 0);
    return total / this.metrics.apiResponseTimes.length;
  }

  // 获取所有指标
  getAllMetrics() {
    return {
      pageLoadTime: this.metrics.pageLoadTime,
      memoryUsage: this.getMemoryUsage(),
      averageMessageLatency: this.getAverageMessageLatency(),
      averageApiResponseTime: this.getAverageApiResponseTime(),
      messageLatencyCount: this.metrics.messageLatency.length,
      apiResponseTimeCount: this.metrics.apiResponseTimes.length
    };
  }

  // 重置指标
  resetMetrics() {
    this.metrics = {
      pageLoadTime: null,
      memoryUsage: null,
      messageLatency: [],
      apiResponseTimes: []
    };
    this.messageTimers.clear();
  }

  // 输出性能报告
  printReport() {
    const metrics = this.getAllMetrics();
    console.log('=== 性能报告 ===');
    console.log(`页面加载时间: ${metrics.pageLoadTime ? metrics.pageLoadTime.toFixed(2) + 'ms' : '未记录'}`);
    console.log(`平均消息延迟: ${metrics.averageMessageLatency.toFixed(2)}ms`);
    console.log(`平均API响应时间: ${metrics.averageApiResponseTime.toFixed(2)}ms`);
    console.log(`消息延迟记录数: ${metrics.messageLatencyCount}`);
    console.log(`API响应时间记录数: ${metrics.apiResponseTimeCount}`);
    
    if (metrics.memoryUsage) {
      console.log(`内存使用: ${(metrics.memoryUsage.used / 1024 / 1024).toFixed(2)}MB / ${(metrics.memoryUsage.total / 1024 / 1024).toFixed(2)}MB`);
    }
  }
}

// 创建单例实例
const performanceMonitor = new PerformanceMonitor();

// 页面加载时间监控
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    performanceMonitor.endPageLoad();
  });
}

export default performanceMonitor;