"use client";

import { useEffect, useRef, useState } from "react";
import { useMessageStore } from "@/stores/useMessageStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useWebSocketChatMessage } from "@/lib/websocket";
import VirtualizedMessageList from "./VirtualizedMessageList";

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  timestamp: string;
  status: 'sending' | 'sent' | 'delivered' | 'read';
}

export default function MessageList() {
  const { messages } = useMessageStore();
  const { user } = useAuthStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [useVirtualization, setUseVirtualization] = useState(true); // 默认启用虚拟滚动

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
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 格式化时间
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // 切换虚拟滚动
  const toggleVirtualization = () => {
    setUseVirtualization(!useVirtualization);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
      {/* 调试控制 */}
      <div className="mb-2 text-right">
        <button 
          onClick={toggleVirtualization}
          className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
        >
          {useVirtualization ? '禁用虚拟滚动' : '启用虚拟滚动'}
        </button>
      </div>
      
      {useVirtualization ? (
        <VirtualizedMessageList />
      ) : messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">暂无消息</h3>
            <p className="mt-1 text-sm text-gray-500">开始发送消息吧</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.senderId === user?.id ? 'justify-end' : 'justify-start'
              }`}
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
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
}