import { useEffect, useRef, useState } from 'react';

// 实时通信配置
const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
const MAX_RECONNECT_ATTEMPTS = 3;
const RECONNECT_INTERVAL = 3000; // 3秒
const POLLING_INTERVAL = 5000; // 5秒轮询间隔

/**
 * 实时通信管理Hook（兼容Vercel）
 * 使用轮询方式实现实时通信，避免WebSocket在Vercel上的限制
 * @param {string} token - JWT认证令牌
 * @returns {object} 实时通信状态和控制函数
 */
export function useRealtimeCommunication(token) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const lastMessageIdRef = useRef(null);

  /**
   * 开始轮询
   */
  const startPolling = () => {
    stopPolling(); // 先清除现有的轮询

    // 设置轮询定时器
    pollingIntervalRef.current = setInterval(async () => {
      if (!token) return;

      try {
        // 获取新消息
        const response = await fetch(`${API_URL}/api/messages?lastMessageId=${lastMessageIdRef.current || ''}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          
          // 更新连接状态
          if (!isConnected) {
            setIsConnected(true);
            setIsConnecting(false);
            reconnectAttemptsRef.current = 0;
          }

          // 处理收到的消息
          if (data.messages && data.messages.length > 0) {
            data.messages.forEach(message => {
              // 更新最后消息ID
              if (message.id) {
                lastMessageIdRef.current = message.id;
              }

              // 触发消息事件
              if (message.type === 'chat_message') {
                window.dispatchEvent(new CustomEvent('realtimeChatMessage', { detail: message }));
              } else {
                window.dispatchEvent(new CustomEvent('realtimeMessage', { detail: message }));
              }
            });
          }
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        console.error('轮询错误:', error);
        setError('连接错误: ' + error.message);
        
        // 停止轮询并尝试重连
        stopPolling();
        attemptReconnect();
      }
    }, POLLING_INTERVAL);
  };

  /**
   * 停止轮询
   */
  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  /**
   * 尝试重新连接
   */
  const attemptReconnect = () => {
    // 如果已达到最大重连次数，则停止重连
    if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
      setError('无法连接到服务器，请检查网络连接');
      setIsConnected(false);
      setIsConnecting(false);
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
   * 建立连接
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
      // 开始轮询
      startPolling();
    } catch (error) {
      console.error('建立连接时出错:', error);
      setError('无法建立连接: ' + error.message);
      setIsConnecting(false);
    }
  };

  /**
   * 发送消息
   * @param {object} message - 要发送的消息对象
   */
  const sendMessage = async (message) => {
    if (!token) {
      console.warn('缺少认证令牌，无法发送消息');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('消息发送成功:', data);
      return data;
    } catch (error) {
      console.error('发送消息时出错:', error);
      setError('发送消息失败: ' + error.message);
      throw error;
    }
  };

  /**
   * 发送聊天消息
   * @param {string} content - 消息内容
   * @param {string} messageId - 消息ID（用于跟踪状态）
   */
  const sendChatMessage = async (content, messageId = null) => {
    const message = {
      type: 'chat_message',
      data: {
        content: content,
        ...(messageId && { id: messageId })
      }
    };
    
    return await sendMessage(message);
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

    // 停止轮询
    stopPolling();

    // 重置状态
    setIsConnected(false);
    setIsConnecting(false);
    setError(null);
    reconnectAttemptsRef.current = 0;
    lastMessageIdRef.current = null;
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
 * 实时消息监听Hook
 * @param {string} messageType - 要监听的消息类型
 * @param {function} handler - 消息处理函数
 */
export function useRealtimeMessage(messageType, handler) {
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.detail.type === messageType) {
        handler(event.detail);
      }
    };

    window.addEventListener('realtimeMessage', handleMessage);

    return () => {
      window.removeEventListener('realtimeMessage', handleMessage);
    };
  }, [messageType, handler]);
}

/**
 * 实时聊天消息监听Hook
 * @param {function} handler - 消息处理函数
 */
export function useRealtimeChatMessage(handler) {
  useEffect(() => {
    const handleMessage = (event) => {
      handler(event.detail);
    };

    window.addEventListener('realtimeChatMessage', handleMessage);

    return () => {
      window.removeEventListener('realtimeChatMessage', handleMessage);
    };
  }, [handler]);
}

// 导出类型定义（用于TypeScript）
export default {
  useRealtimeCommunication,
  useRealtimeMessage,
  useRealtimeChatMessage
};