/**
 * WebSocket Manager
 *
 * Handles real-time communication with proper connection management,
 * message queuing, and reconnection logic.
 */

import { logger } from '@/app/lib/logger';
import { newRequestId } from '@/app/lib/requestId';
import { WebSocket } from 'ws';
import { redisPool } from './redis-connection-pool';

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
  id: string;
}

export interface WebSocketConnection {
  id: string;
  userId: string;
  ws: WebSocket;
  lastPing: number;
  isAlive: boolean;
}

export class WebSocketManager {
  private static instance: WebSocketManager;
  private connections: Map<string, WebSocketConnection> = new Map();
  private messageQueue: Map<string, WebSocketMessage[]> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private heartbeatIntervalMs: number = 30000; // 30 seconds
  private maxMessageQueueSize: number = 100;

  static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  constructor() {
    this.startHeartbeat();
  }

  /**
   * Connect a new WebSocket
   */
  connect(userId: string, ws: WebSocket): void {
    const connectionId = this.generateConnectionId();

    const connection: WebSocketConnection = {
      id: connectionId,
      userId,
      ws,
      lastPing: Date.now(),
      isAlive: true,
    };

    this.connections.set(connectionId, connection);

    // Set up event handlers
    ws.on('message', (data) => {
      this.handleMessage(connectionId, Buffer.from(data as ArrayBuffer));
    });

    ws.on('close', () => {
      this.handleDisconnect(connectionId);
    });

    ws.on('pong', () => {
      const conn = this.connections.get(connectionId);
      if (conn) {
        conn.isAlive = true;
        conn.lastPing = Date.now();
      }
    });

    // Send queued messages
    this.sendQueuedMessages(connectionId);

    // WebSocket connected
  }

  /**
   * Send message to a specific user
   */
  async sendToUser(userId: string, message: WebSocketMessage): Promise<void> {
    const userConnections = Array.from(this.connections.values()).filter(
      (conn) => conn.userId === userId,
    );

    if (userConnections.length === 0) {
      // Queue message for when user reconnects
      await this.queueMessage(userId, message);
      return;
    }

    for (const connection of userConnections) {
      this.sendMessage(connection.id, message);
    }
  }

  /**
   * Broadcast message to all connected users
   */
  broadcast(message: WebSocketMessage, excludeUserId?: string): void {
    for (const connection of this.connections.values()) {
      if (excludeUserId && connection.userId === excludeUserId) {
        continue;
      }
      this.sendMessage(connection.id, message);
    }
  }

  /**
   * Broadcast message to users in a specific room/channel
   */
  async broadcastToRoom(roomId: string, message: WebSocketMessage): Promise<void> {
    // Get users in room from Redis
    const roomUsers = await redisPool.execute(async (redis) => {
      return await redis.smembers(`room:${roomId}:users`);
    });

    for (const userId of roomUsers) {
      await this.sendToUser(userId, message);
    }
  }

  /**
   * Join a room
   */
  async joinRoom(userId: string, roomId: string): Promise<void> {
    await redisPool.execute(async (redis) => {
      await redis.sadd(`room:${roomId}:users`, userId);
      await redis.sadd(`user:${userId}:rooms`, roomId);
    });
  }

  /**
   * Leave a room
   */
  async leaveRoom(userId: string, roomId: string): Promise<void> {
    await redisPool.execute(async (redis) => {
      await redis.srem(`room:${roomId}:users`, userId);
      await redis.srem(`user:${userId}:rooms`, roomId);
    });
  }

  /**
   * Get connection statistics
   */
  getStats(): {
    totalConnections: number;
    uniqueUsers: number;
    queuedMessages: number;
  } {
    const uniqueUsers = new Set(Array.from(this.connections.values()).map((c) => c.userId));
    const queuedMessages = Array.from(this.messageQueue.values()).reduce(
      (sum, msgs) => sum + msgs.length,
      0,
    );

    return {
      totalConnections: this.connections.size,
      uniqueUsers: uniqueUsers.size,
      queuedMessages,
    };
  }

  /**
   * Handle incoming message
   */
  private handleMessage(connectionId: string, data: Buffer): void {
    try {
      const message: WebSocketMessage = JSON.parse(data.toString());

      // Validate message
      if (!message.type || !message.data) {
        logger.warn('Invalid message format:', undefined, { value: message });
        return;
      }

      // Add timestamp and ID if not present
      if (!message.timestamp) {
        message.timestamp = Date.now();
      }
      if (!message.id) {
        message.id = this.generateMessageId();
      }

      // Handle different message types
      switch (message.type) {
        case 'ping':
          this.handlePing(connectionId);
          break;
        case 'chat':
          this.handleChatMessage(connectionId, message);
          break;
        case 'join_room':
          this.handleJoinRoom(connectionId, message);
          break;
        case 'leave_room':
          this.handleLeaveRoom(connectionId, message);
          break;
        default:
          logger.warn('Unknown message type:', undefined, { value: message.type });
      }
    } catch (error) {
      logger.error('Error handling message:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Handle ping message
   */
  private handlePing(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.isAlive = true;
      connection.lastPing = Date.now();

      this.sendMessage(connectionId, {
        type: 'pong',
        data: { timestamp: Date.now() },
        timestamp: Date.now(),
        id: this.generateMessageId(),
      });
    }
  }

  /**
   * Handle chat message
   */
  private async handleChatMessage(connectionId: string, message: WebSocketMessage): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    // Broadcast to all users
    this.broadcast(message, connection.userId);
  }

  /**
   * Handle join room message
   */
  private async handleJoinRoom(connectionId: string, message: WebSocketMessage): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    const { roomId } = message.data;
    if (roomId) {
      await this.joinRoom(connection.userId, roomId);
    }
  }

  /**
   * Handle leave room message
   */
  private async handleLeaveRoom(connectionId: string, message: WebSocketMessage): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    const { roomId } = message.data;
    if (roomId) {
      await this.leaveRoom(connection.userId, roomId);
    }
  }

  /**
   * Handle disconnect
   */
  private handleDisconnect(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      // WebSocket disconnected
      this.connections.delete(connectionId);
    }
  }

  /**
   * Send message to connection
   */
  private sendMessage(connectionId: string, message: WebSocketMessage): void {
    const connection = this.connections.get(connectionId);
    if (!connection || connection.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    try {
      connection.ws.send(JSON.stringify(message));
    } catch (error) {
      logger.error('Error sending message:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
      this.handleDisconnect(connectionId);
    }
  }

  /**
   * Queue message for offline user
   */
  private async queueMessage(userId: string, message: WebSocketMessage): Promise<void> {
    if (!this.messageQueue.has(userId)) {
      this.messageQueue.set(userId, []);
    }

    const queue = this.messageQueue.get(userId)!;

    // Limit queue size
    if (queue.length >= this.maxMessageQueueSize) {
      queue.shift(); // Remove oldest message
    }

    queue.push(message);
  }

  /**
   * Send queued messages to user
   */
  private sendQueuedMessages(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    const queuedMessages = this.messageQueue.get(connection.userId) || [];

    for (const message of queuedMessages) {
      this.sendMessage(connectionId, message);
    }

    this.messageQueue.delete(connection.userId);
  }

  /**
   * Start heartbeat to check connection health
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      for (const [connectionId, connection] of this.connections) {
        if (!connection.isAlive) {
          // Terminating dead connection
          connection.ws.terminate();
          this.connections.delete(connectionId);
          continue;
        }

        connection.isAlive = false;
        connection.ws.ping();
      }
    }, this.heartbeatIntervalMs);
  }

  /**
   * Generate unique connection ID
   */
  private generateConnectionId(): string {
    return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique message ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    for (const connection of this.connections.values()) {
      connection.ws.close();
    }

    this.connections.clear();
    this.messageQueue.clear();
  }
}

// Export singleton instance
export const wsManager = WebSocketManager.getInstance();
