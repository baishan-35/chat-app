"use client";

import { useState, useEffect } from "react";
import { useWebSocket } from "@/lib/websocket";
import { useAuthStore } from "@/stores/useAuthStore";
import MessageList from "./MessageList";
import SendMessage from "./SendMessage";

export default function ChatContainer() {
  const { accessToken, user } = useAuthStore();
  const { isConnected, isConnecting, error } = useWebSocket(accessToken);

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] bg-white shadow sm:rounded-lg">
      {/* 聊天头部 */}
      <div className="px-4 py-3 border-b border-gray-200 sm:px-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">聊天室</h2>
          <div className="flex items-center">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isConnected 
                ? 'bg-green-100 text-green-800' 
                : isConnecting 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-red-100 text-red-800'
            }`}>
              {isConnected ? '已连接' : isConnecting ? '连接中...' : '未连接'}
            </span>
          </div>
        </div>
        {error && (
          <div className="mt-2 text-sm text-red-600">{error}</div>
        )}
      </div>
      
      {/* 消息列表 */}
      <MessageList />
      
      {/* 消息发送 */}
      <SendMessage />
    </div>
  );
}