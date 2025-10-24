"use client";

import { useState, useRef, useEffect } from "react";
import { useWebSocket } from "@/lib/websocket";
import { useAuthStore } from "@/stores/useAuthStore";
import { useMessageStore } from "@/stores/useMessageStore";

interface SendMessageProps {
  onSendMessage?: (message: any) => void;
}

export default function SendMessage({ onSendMessage }: SendMessageProps) {
  const { accessToken, user } = useAuthStore();
  const { isConnected, sendChatMessage } = useWebSocket(accessToken);
  const { addMessage } = useMessageStore();
  const [inputMessage, setInputMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 生成简单的UUID
  const generateId = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  // 自动调整文本框高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputMessage]);

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !isConnected || !user) {
      return;
    }

    // 创建消息对象
    const message = {
      id: generateId(),
      content: inputMessage.trim(),
      senderId: user.id,
      senderName: user.name || '未知用户',
      timestamp: new Date().toISOString(),
      status: 'sending' as const
    };

    // 乐观更新：立即添加到本地状态
    addMessage(message);

    // 清空输入框
    setInputMessage("");

    // 通过WebSocket发送消息
    sendChatMessage(message.content);

    // 调用回调函数（如果提供）
    if (onSendMessage) {
      onSendMessage(message);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="border-t border-gray-200 p-4 bg-white">
      <div className="flex items-end space-x-2">
        <textarea
          ref={textareaRef}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="输入消息..."
          className="flex-1 border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none min-h-[40px] max-h-[120px]"
          rows={1}
          disabled={!isConnected}
        />
        <button
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() || !isConnected}
          className={`inline-flex items-center justify-center h-10 w-10 rounded-full ${
            inputMessage.trim() && isConnected
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          } transition-colors duration-200`}
          aria-label="发送消息"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
      
      {!isConnected && (
        <div className="mt-2 text-sm text-red-600 flex items-center">
          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          请先连接到服务器才能发送消息
        </div>
      )}
    </div>
  );
}