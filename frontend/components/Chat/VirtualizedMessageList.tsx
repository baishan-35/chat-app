// VirtualizedMessageList.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useMessageStore } from "@/stores/useMessageStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useWebSocketChatMessage } from "@/lib/websocket";

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  timestamp: string;
  status: 'sending' | 'sent' | 'delivered' | 'read';
}

interface VirtualizedMessageListProps {
  itemHeight?: number; // 每个消息项的高度
  windowHeight?: number; // 可视窗口高度
}

export default function VirtualizedMessageList({
  itemHeight = 80,
  windowHeight = 500
}: VirtualizedMessageListProps) {
  const { messages } = useMessageStore();
  const { user } = useAuthStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  // 计算可视区域内的消息项
  const visibleMessageCount = Math.ceil(windowHeight / itemHeight) + 2; // 多渲染2个以避免空白
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 1);
  const endIndex = Math.min(messages.length, startIndex + visibleMessageCount);
  const visibleMessages = messages.slice(startIndex, endIndex);

  // 处理滚动事件
  const handleScroll = () => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
      setIsScrolling(true);
      
      // 延迟重置滚动状态
      setTimeout(() => setIsScrolling(false), 150);
    }
  };

  // 滚动到最新消息
  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  };

  // 监听WebSocket聊天消息
  useWebSocketChatMessage((message: any) => {
    console.log('收到聊天消息:', message);
    
    // 检查消息是否已存在（避免重复）
    const existingMessage = messages.find(msg => msg.id === message.data.id);
    
    if (!existingMessage) {
      // 这是新消息，添加到消息列表
      useMessageStore.getState().addMessage({
        id: message.data.id,
        content: message.data.content,
        senderId: message.data.senderId,
        senderName: message.data.senderName,
        timestamp: message.data.timestamp,
        status: message.data.senderId === user?.id ? 'sent' : 'delivered'
      });
    } else if (existingMessage.senderId === user?.id && existingMessage.status === 'sending') {
      // 这是自己发送的消息的确认，更新状态为已发送
      useMessageStore.getState().updateMessageStatus(message.data.id, 'sent');
    }
  });

  // 滚动到最新消息
  useEffect(() => {
    // 只有在用户没有手动滚动时才自动滚动到底部
    if (!isScrolling) {
      scrollToBottom();
    }
  }, [messages, isScrolling]);

  // 格式化时间
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto p-4 bg-gray-50"
      onScroll={handleScroll}
      style={{ height: windowHeight }}
    >
      {/* 占位符用于保持滚动位置 */}
      <div style={{ height: messages.length * itemHeight }} />
      
      {/* 可视区域内的消息 */}
      <div 
        className="absolute inset-0"
        style={{ 
          transform: `translateY(${startIndex * itemHeight}px)`,
          top: 0,
          left: 0,
          right: 0
        }}
      >
        {visibleMessages.map((message) => (
          <div
            key={message.id}
            className={`flex mb-4 ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
            style={{ height: itemHeight }}
          >
            <div
              className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg shadow-sm ${
                message.senderId === user?.id
                  ? 'bg-indigo-500 text-white rounded-br-none'
                  : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
              }`}
            >
              {message.senderId !== user?.id && (
                <div className="text-xs font-medium text-gray-600 mb-1">
                  {message.senderName}
                </div>
              )}
              <div className="text-sm break-words">{message.content}</div>
              <div className="flex items-center justify-end mt-1">
                <span className="text-xs opacity-70">
                  {formatTime(message.timestamp)}
                </span>
                {message.senderId === user?.id && (
                  <span className="ml-1 text-xs">
                    {message.status === 'sending' ? (
                      <span className="flex items-center">
                        <span className="flex h-2 w-2">
                          <span className="animate-ping absolute h-2 w-2 rounded-full bg-white opacity-75"></span>
                          <span className="relative h-2 w-2 rounded-full bg-white"></span>
                        </span>
                      </span>
                    ) : message.status === 'sent' ? (
                      <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : message.status === 'delivered' ? (
                      <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : null}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div ref={messagesEndRef} />
    </div>
  );
}