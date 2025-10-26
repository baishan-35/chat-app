import { useEffect, useRef, useState } from 'react';

// WebSocket配置 - 使用相对路径以支持PWA
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || (typeof window !== 'undefined' ? (window.location.protocol === 'https:' ? 'wss://' : 'ws://') + window.location.host : '');
const MAX_RECONNECT_ATTEMPTS = 3;
const RECONNECT_INTERVAL = 3000; // 3秒

/**
 * WebSocket管理Hook
 * @param {string} token - JWT认证令牌
 * @returns {object} WebSocket状态和控制函数
 */
export function useWebSocket(token) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);
  const pendingMessagesRef = useRef(new Map()); // 用于跟踪待处理的消息

  /**
   * 建立WebSocket连接
   */
  const connect = () => {
    // 如果已经连接或正在连接，则不执行任何操作
    if (isConnected || isConnecting) return;

    // 如果没有提供令牌，则不连接
    if (!token) {
      setError('缺少认证令牌');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // 确定WebSocket URL
      let wsUrl = WS_URL;
      if (!wsUrl) {
        // 如果没有配置环境变量，使用当前页面的协议和主机
        const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
        const host = window.location.host;
        wsUrl = `${protocol}${host}`;
      }
      
      // 创建WebSocket连接
      const ws = new WebSocket(`${wsUrl}/api/ws?token=${token}`);
      wsRef.current = ws;

      // 连接成功
      ws.onopen = () => {
        console.log('WebSocket连接已建立');
        setIsConnected(true);
        setIsConnecting(false);
        reconnectAttemptsRef.current = 0;

        // 启动心跳检测
        startHeartbeat();
      };

      // 收到消息
      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('收到WebSocket消息:', message);

          // 处理心跳响应
          if (message.type === 'heartbeat_ack') {
            console.log('收到心跳响应');
            return;
          }

          // 处理连接确认
          if (message.type === 'connection_ack') {
            console.log('连接确认:', message.data.message);
            return;
          }

          // 处理聊天消息
          if (message.type === 'chat_message') {
            // 触发聊天消息事件
            window.dispatchEvent(new CustomEvent('websocketChatMessage', { detail: message }));
            return;
          }

          // 触发自定义消息事件
          window.dispatchEvent(new CustomEvent('websocketMessage', { detail: message }));
        } catch (error) {
          console.error('解析WebSocket消息时出错:', error);
        }
      };

      // 连接错误
      ws.onerror = (error) => {
        console.error('WebSocket连接错误:', error);
        setError('WebSocket连接错误');
        setIsConnecting(false);
      };

      // 连接关闭
      ws.onclose = (event) => {
        console.log('WebSocket连接已关闭', event.code, event.reason);
        setIsConnected(false);
        setIsConnecting(false);
        stopHeartbeat();

        // 清理资源
        wsRef.current = null;

        // 根据关闭代码决定是否重连
        if (event.code !== 4001 && event.code !== 4002) {
          // 不是认证错误才尝试重连
          attemptReconnect();
        } else {
          setError('认证失败，请重新登录');
        }
      };
    } catch (error) {
      console.error('创建WebSocket连接时出错:', error);
      setError('无法建立WebSocket连接');
      setIsConnecting(false);
    }
  };

  /**
   * 启动心跳检测
   */
  const startHeartbeat = () => {
    stopHeartbeat(); // 先清除现有的心跳检测

    heartbeatIntervalRef.current = setInterval(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'heartbeat' }));
      }
    }, 25000); // 每25秒发送一次心跳（略小于服务器的30秒超时）
  };

  /**
   * 停止心跳检测
   */
  const stopHeartbeat = () => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  };

  /**
   * 尝试重新连接
   */
  const attemptReconnect = () => {
    // 如果已达到最大重连次数，则停止重连
    if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
      setError('无法连接到服务器，请检查网络连接');
      return;
    }

    // 增加重连次数
    reconnectAttemptsRef.current += 1;
    console.log(`尝试重新连接 (${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})`);

    // 设置重连定时器
    reconnectTimeoutRef.current = setTimeout(() => {
      connect();
    }, RECONNECT_INTERVAL);
  };

  /**
   * 发送消息
   * @param {object} message - 要发送的消息对象
   */
  const sendMessage = (message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket未连接，无法发送消息');
    }
  };

  /**
   * 发送聊天消息
   * @param {string} content - 消息内容
   * @param {string} messageId - 消息ID（用于跟踪状态）
   */
  const sendChatMessage = (content, messageId = null) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const message = {
        type: 'chat_message',
        data: {
          content: content,
          ...(messageId && { id: messageId }) // 如果提供了消息ID，则包含它
        }
      };
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket未连接，无法发送消息');
    }
  };

  /**
   * 断开连接
   */
  const disconnect = () => {
    // 清除重连定时器
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // 停止心跳检测
    stopHeartbeat();

    // 关闭WebSocket连接
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // 重置状态
    setIsConnected(false);
    setIsConnecting(false);
    reconnectAttemptsRef.current = 0;
  };

  /**
   * 重置重连尝试次数
   */
  const resetReconnectAttempts = () => {
    reconnectAttemptsRef.current = 0;
  };

  // 在组件挂载时建立连接
  useEffect(() => {
    connect();

    // 在组件卸载时断开连接
    return () => {
      disconnect();
    };
  }, [token]); // 依赖token变化重新连接

  // 返回状态和控制函数
  return {
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    sendMessage,
    sendChatMessage,
    resetReconnectAttempts
  };
}

/**
 * WebSocket消息监听Hook
 * @param {string} messageType - 要监听的消息类型
 * @param {function} handler - 消息处理函数
 */
export function useWebSocketMessage(messageType, handler) {
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.detail.type === messageType) {
        handler(event.detail);
      }
    };

    window.addEventListener('websocketMessage', handleMessage);

    return () => {
      window.removeEventListener('websocketMessage', handleMessage);
    };
  }, [messageType, handler]);
}

/**
 * WebSocket聊天消息监听Hook
 * @param {function} handler - 消息处理函数
 */
export function useWebSocketChatMessage(handler) {
  useEffect(() => {
    const handleMessage = (event) => {
      handler(event.detail);
    };

    window.addEventListener('websocketChatMessage', handleMessage);

    return () => {
      window.removeEventListener('websocketChatMessage', handleMessage);
    };
  }, [handler]);
}

// 导出类型定义（用于TypeScript）
export default {
  useWebSocket,
  useWebSocketMessage,
  useWebSocketChatMessage
};