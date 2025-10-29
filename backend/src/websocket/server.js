const WebSocket = require('ws');
const url = require('url');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// 延迟加载Prisma客户端
let prisma;
let databaseAvailable = true;

try {
  const { PrismaClient } = require('@prisma/client');
  prisma = new PrismaClient();
} catch (error) {
  console.log('数据库不可用，使用模拟模式');
  databaseAvailable = false;
}

// 存储所有活跃的WebSocket连接
const clients = new Map();

// 存储消息历史
const messageHistory = [];

// WebSocket服务器配置
const WS_PORT = 3010; // WebSocket服务器端口改为3010
const HEARTBEAT_INTERVAL = 30000; // 心跳检测间隔(毫秒)
const MAX_HISTORY = 100; // 最大消息历史数量

// 创建WebSocket服务器
const wss = new WebSocket.Server({ port: WS_PORT });

/**
 * 验证JWT令牌
 * @param {string} token - JWT令牌
 * @returns {object|null} 解码后的用户信息或null
 */
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret_key_for_development');
    return decoded;
  } catch (error) {
    console.error('令牌验证失败:', error);
    return null;
  }
}

/**
 * 处理心跳检测
 * @param {WebSocket} ws - WebSocket连接
 */
function heartbeat(ws) {
  ws.isAlive = true;
}

/**
 * 发送消息给客户端
 * @param {WebSocket} ws - WebSocket连接
 * @param {object} message - 消息对象
 */
function sendMessage(ws, message) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

/**
 * 广播消息给所有连接的客户端
 * @param {object} message - 消息对象
 * @param {function} filter - 过滤函数，可选
 */
function broadcast(message, filter = () => true) {
  const messageString = JSON.stringify(message);
  clients.forEach((client, clientId) => {
    if (client.ws.readyState === WebSocket.OPEN && filter(client)) {
      client.ws.send(messageString);
    }
  });
}

/**
 * 发送消息给特定用户
 * @param {string} userId - 用户ID
 * @param {object} message - 消息对象
 */
function sendToUser(userId, message) {
  clients.forEach((client, clientId) => {
    if (client.userId === userId && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  });
}

/**
 * 清理断开的连接
 * @param {string} clientId - 客户端ID
 */
function cleanupConnection(clientId) {
  const client = clients.get(clientId);
  if (client) {
    console.log(`客户端 ${clientId} 已断开连接`);
    clients.delete(clientId);
    
    // 广播用户离线消息
    broadcast({
      type: 'user_offline',
      data: {
        userId: client.userId,
        timestamp: new Date().toISOString()
      }
    });
  }
}

/**
 * 保存消息到历史记录
 * @param {object} message - 消息对象
 */
function saveMessageToHistory(message) {
  messageHistory.push(message);
  
  // 保持历史记录在最大数量范围内
  if (messageHistory.length > MAX_HISTORY) {
    messageHistory.shift();
  }
}

/**
 * 发送历史消息给客户端
 * @param {WebSocket} ws - WebSocket连接
 */
function sendHistoryMessages(ws) {
  messageHistory.forEach(message => {
    sendMessage(ws, {
      type: 'chat_message',
      data: message
    });
  });
}

// 处理新的WebSocket连接
wss.on('connection', (ws, req) => {
  // 解析URL参数
  const parsedUrl = url.parse(req.url, true);
  const token = parsedUrl.query.token;
  
  // 验证令牌
  if (!token) {
    console.log('连接拒绝：缺少认证令牌');
    ws.close(4001, '缺少认证令牌');
    return;
  }
  
  const decoded = verifyToken(token);
  if (!decoded) {
    console.log('连接拒绝：无效的认证令牌');
    ws.close(4002, '无效的认证令牌');
    return;
  }
  
  // 设置客户端信息
  const clientId = `${decoded.userId}-${Date.now()}`;
  ws.clientId = clientId;
  ws.isAlive = true;
  
  // 存储客户端连接
  clients.set(clientId, {
    ws: ws,
    userId: decoded.userId,
    userName: decoded.name || `用户${decoded.userId}`,
    connectedAt: new Date(),
    lastHeartbeat: new Date()
  });
  
  console.log(`客户端 ${clientId} 已连接，用户ID: ${decoded.userId}`);
  
  // 发送连接确认消息
  sendMessage(ws, {
    type: 'connection_ack',
    data: {
      message: '连接成功',
      clientId: clientId,
      timestamp: new Date().toISOString()
    }
  });
  
  // 发送历史消息
  sendHistoryMessages(ws);
  
  // 广播用户上线消息
  broadcast({
    type: 'user_online',
    data: {
      userId: decoded.userId,
      userName: decoded.name || `用户${decoded.userId}`,
      timestamp: new Date().toISOString()
    }
  });
  
  // 监听心跳响应
  ws.on('pong', () => {
    heartbeat(ws);
    const client = clients.get(clientId);
    if (client) {
      client.lastHeartbeat = new Date();
    }
  });
  
  // 监听消息
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      
      // 处理心跳消息
      if (message.type === 'heartbeat') {
        sendMessage(ws, {
          type: 'heartbeat_ack',
          data: {
            timestamp: new Date().toISOString()
          }
        });
        return;
      }
      
      // 处理聊天消息
      if (message.type === 'chat_message') {
        const client = clients.get(ws.clientId);
        if (!client) return;
        
        // 创建消息对象
        const chatMessage = {
          id: message.data.id || uuidv4(), // 使用提供的ID或生成新ID
          content: message.data.content,
          senderId: client.userId,
          senderName: client.userName,
          timestamp: new Date().toISOString(),
          status: 'sent'
        };
        
        console.log(`收到来自 ${client.userId} 的消息:`, chatMessage);
        
        // 保存消息到历史记录
        saveMessageToHistory(chatMessage);
        
        // 广播消息给所有连接的客户端
        broadcast({
          type: 'chat_message',
          data: chatMessage
        });
        
        return;
      }
      
      // 回显未识别的消息类型
      sendMessage(ws, {
        type: 'echo',
        data: {
          originalMessage: message,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('处理消息时出错:', error);
      sendMessage(ws, {
        type: 'error',
        data: {
          message: '消息格式错误',
          timestamp: new Date().toISOString()
        }
      });
    }
  });
  
  // 监听连接关闭
  ws.on('close', (code, reason) => {
    console.log(`客户端 ${clientId} 断开连接，代码: ${code}, 原因: ${reason}`);
    cleanupConnection(clientId);
  });
  
  // 监听错误
  ws.on('error', (error) => {
    console.error(`客户端 ${clientId} 发生错误:`, error);
    cleanupConnection(clientId);
  });
});

// 定期心跳检测
const heartbeatInterval = setInterval(() => {
  clients.forEach((client, clientId) => {
    const ws = client.ws;
    
    // 如果客户端没有响应心跳，则断开连接
    if (!ws.isAlive) {
      console.log(`客户端 ${clientId} 心跳超时，断开连接`);
      ws.terminate();
      cleanupConnection(clientId);
      return;
    }
    
    // 发送心跳请求
    ws.isAlive = false;
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping();
    }
  });
}, HEARTBEAT_INTERVAL);

// 监听服务器错误
wss.on('error', (error) => {
  console.error('WebSocket服务器错误:', error);
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('正在关闭WebSocket服务器...');
  
  // 清理所有连接
  clients.forEach((client, clientId) => {
    client.ws.close();
    console.log(`已断开客户端 ${clientId}`);
  });
  
  // 清理心跳检测
  clearInterval(heartbeatInterval);
  
  // 关闭服务器
  wss.close(() => {
    console.log('WebSocket服务器已关闭');
    process.exit(0);
  });
});

// 提供连接状态监控接口
function getConnectionStats() {
  return {
    totalConnections: clients.size,
    connections: Array.from(clients.values()).map(client => ({
      userId: client.userId,
      userName: client.userName,
      connectedAt: client.connectedAt,
      lastHeartbeat: client.lastHeartbeat,
      connectionDuration: Date.now() - client.connectedAt.getTime()
    }))
  };
}

// 导出服务器实例和工具函数
module.exports = {
  wss,
  getConnectionStats,
  broadcast
};

console.log(`WebSocket服务器正在端口 ${WS_PORT} 上运行`);