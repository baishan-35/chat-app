'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useRealtimeCommunication } from '@/lib/realtime';

export default function TestPollingPage() {
  const { accessToken: token } = useAuthStore();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const realtime = useRealtimeCommunication(token || '');

  // 监听实时消息
  useEffect(() => {
    const handleMessage = (event: CustomEvent) => {
      setMessages(prev => [...prev, event.detail]);
    };

    window.addEventListener('realtimeMessage', handleMessage as EventListener);
    window.addEventListener('realtimeChatMessage', handleMessage as EventListener);
    
    return () => {
      window.removeEventListener('realtimeMessage', handleMessage as EventListener);
      window.removeEventListener('realtimeChatMessage', handleMessage as EventListener);
    };
  }, []);

  const handleSendMessage = async () => {
    if (newMessage.trim() && realtime && 'sendChatMessage' in realtime && typeof (realtime as any).sendChatMessage === 'function') {
      try {
        await (realtime as any).sendChatMessage(newMessage);
        setNewMessage('');
      } catch (error) {
        console.error('发送消息失败:', error);
      }
    }
  };

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-6">轮询测试</h1>
      
      <div className="mb-6 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-2">连接状态</h2>
        <p>连接状态: {(realtime as any).isConnected ? '已连接' : (realtime as any).isConnecting ? '连接中...' : '未连接'}</p>
        <p>错误信息: {(realtime as any).error || '无'}</p>
        
        <div className="mt-4 flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="输入消息..."
            className="flex-1 px-4 py-2 border rounded-l"
          />
          <button 
            onClick={handleSendMessage}
            disabled={!(realtime as any).isConnected || !newMessage.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-r disabled:bg-gray-400"
          >
            发送
          </button>
        </div>
      </div>

      <div className="border rounded p-4">
        <h2 className="text-xl font-semibold mb-2">消息记录</h2>
        <div className="max-h-96 overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-gray-500">暂无消息</p>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className="mb-2 p-2 bg-gray-100 rounded">
                <pre className="text-sm">{JSON.stringify(msg, null, 2)}</pre>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}