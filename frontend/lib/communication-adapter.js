import { useWebSocket } from './websocket';
import { useRealtimeCommunication } from './realtime';

/**
 * 通信适配器Hook
 * 根据环境自动选择使用WebSocket或轮询
 * @param {string} token - JWT认证令牌
 * @returns {object} 通信状态和控制函数
 */
export function useCommunication(token) {
  // 检查是否在Vercel环境中
  const isVercel = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';
  
  // 在Vercel生产环境中使用轮询，在其他环境中使用WebSocket
  if (isVercel) {
    // 使用轮询实现实时通信
    return useRealtimeCommunication(token);
  } else {
    // 使用WebSocket实现实时通信
    return useWebSocket(token);
  }
}

/**
 * 消息监听适配器Hook
 * @param {string} messageType - 要监听的消息类型
 * @param {function} handler - 消息处理函数
 */
export function useCommunicationMessage(messageType, handler) {
  const isVercel = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';
  
  if (isVercel) {
    // 使用轮询消息监听
    // 注意：这里需要根据实际实现调整事件名称
    // 暂时使用相同的事件名称，但在实际实现中可能需要调整
    window.addEventListener('websocketMessage', (event) => {
      if (event.detail.type === messageType) {
        handler(event.detail);
      }
    });
  } else {
    // 使用WebSocket消息监听
    window.addEventListener('websocketMessage', (event) => {
      if (event.detail.type === messageType) {
        handler(event.detail);
      }
    });
  }
}

/**
 * 聊天消息监听适配器Hook
 * @param {function} handler - 消息处理函数
 */
export function useChatMessage(handler) {
  const isVercel = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';
  
  if (isVercel) {
    // 使用轮询聊天消息监听
    window.addEventListener('websocketChatMessage', (event) => {
      handler(event.detail);
    });
  } else {
    // 使用WebSocket聊天消息监听
    window.addEventListener('websocketChatMessage', (event) => {
      handler(event.detail);
    });
  }
}

// 导出类型定义（用于TypeScript）
export default {
  useCommunication,
  useCommunicationMessage,
  useChatMessage
};