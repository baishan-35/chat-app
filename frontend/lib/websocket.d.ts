export type WebSocketHook = {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connect: () => void;
  disconnect: () => void;
  sendMessage: (message: any) => void;
  sendChatMessage: (content: string, messageId?: string | null) => void;
  resetReconnectAttempts: () => void;
};

export function useWebSocket(token: string | null): WebSocketHook;

export function useWebSocketMessage(messageType: string, handler: (data: any) => void): void;

export function useWebSocketChatMessage(handler: (data: any) => void): void;