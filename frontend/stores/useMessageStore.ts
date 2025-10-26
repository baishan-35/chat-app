import { create } from "zustand";
import { persist } from "zustand/middleware";

// 消息类型定义
export interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  timestamp: string;
  status: 'sending' | 'sent' | 'delivered' | 'read'; // 消息状态
}

// 消息状态接口
interface MessageState {
  messages: Message[];
  addMessage: (message: Message) => void;
  updateMessageStatus: (id: string, status: 'sending' | 'sent' | 'delivered' | 'read') => void;
  removeMessage: (id: string) => void;
  clearMessages: () => void;
  loadMessages: (messages: Message[]) => void;
}

// 创建消息状态存储
export const useMessageStore = create<MessageState>()(
  persist(
    (set, get) => ({
      messages: [],
      
      // 添加消息
      addMessage: (message) => {
        set((state) => ({
          messages: [...state.messages, message]
        }));
      },
      
      // 更新消息状态
      updateMessageStatus: (id, status) => {
        set((state) => ({
          messages: state.messages.map((msg) => 
            msg.id === id ? { ...msg, status } : msg
          )
        }));
      },
      
      // 删除消息
      removeMessage: (id) => {
        set((state) => ({
          messages: state.messages.filter((msg) => msg.id !== id)
        }));
      },
      
      // 清空消息
      clearMessages: () => {
        set({ messages: [] });
      },
      
      // 加载消息
      loadMessages: (messages) => {
        set({ messages });
      }
    }),
    {
      name: "message-storage", // 存储在localStorage中的键名
      partialize: (state) => ({ messages: state.messages }),
    }
  )
);