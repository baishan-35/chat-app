'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useWebSocket } from '@/lib/websocket';

export default function WebSocketTestPage() {
  const { accessToken: token } = useAuthStore();
  const [messages, setMessages] = useState<any[]>([]);
  const wsHook = useWebSocket(token || '');

  // 监听WebSocket消息
  useEffect(() => {
    const handleMessage = (event: CustomEvent) => {
      setMessages(prev => [...prev, event.detail]);
    };

    window.addEventListener('websocketMessage', handleMessage as EventListener);
    return () => {
      window.removeEventListener('websocketMessage', handleMessage as EventListener);
    };
  }, []);

  const handleSendMessage = () => {
    if (typeof wsHook.sendMessage === 'function') {
      wsHook.sendMessage({
        type: 'test_message',
        data: {
          text: 'Hello from client',
          timestamp: new Date().toISOString()
        }
      });
    }
  };

  const handleSendHeartbeat = () => {
    if (typeof wsHook.sendMessage === 'function') {
      wsHook.sendMessage({
        type: 'heartbeat'
      });
    }
  };

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-6">WebSocket测试</h1>
      
      <div className="mb-6 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-2">连接状态</h2>
        <p>连接状态: {wsHook.isConnected ? '已连接' : wsHook.isConnecting ? '连接中...' : '未连接'}</p>
        <p>错误信息: {wsHook.error || '无'}</p>
        <button 
          onClick={handleSendMessage}
          disabled={!wsHook.isConnected}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
        >
          发送测试消息
        </button>
        <button 
          onClick={handleSendHeartbeat}
          disabled={!wsHook.isConnected}
          className="mt-2 ml-2 px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-400"
        >
          发送心跳
        </button>
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