/**
 * WebSocket Client for Real-Time Community Features
 * Handles live petal counts, leaderboards, and community progress
 */

import { clientEnv } from '@/env/client';

export type WebSocketMessage =
  | { type: 'global-petals'; count: number; dailyCollectors: number }
  | { type: 'leaderboard'; data: LeaderboardEntry[] }
  | { type: 'community-progress'; progress: number; milestone: string }
  | { type: 'pong'; timestamp: number };

export interface LeaderboardEntry {
  rank: number;
  username: string;
  petals: number;
  avatar?: string;
}

type MessageHandler = (message: WebSocketMessage) => void;

class CommunityWebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private handlers: Map<string, Set<MessageHandler>> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private isMockMode = false;

  constructor() {
    // Check if we should use mock mode
    this.isMockMode = clientEnv.NEXT_PUBLIC_ENABLE_MOCK_COMMUNITY_WS === 'true';
  }

  /**
   * Connect to WebSocket server (or mock)
   */
  connect(): void {
    // If mock mode, start mock data generation
    if (this.isMockMode) {
      this.startMockMode();
      return;
    }

    const wsUrl = clientEnv.NEXT_PUBLIC_COMMUNITY_WS_URL;
    if (!wsUrl) {
      console.warn('WebSocket URL not configured, falling back to mock mode');
      this.startMockMode();
      return;
    }

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.warn('✅ WebSocket connected');
        this.reconnectAttempts = 0;
        this.startHeartbeat();
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage;
          this.handleMessage(message);
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      this.ws.onclose = () => {
        console.warn('WebSocket disconnected');
        this.stopHeartbeat();
        this.attemptReconnect();
      };
    } catch (err) {
      console.error('Failed to create WebSocket connection:', err);
      this.startMockMode();
    }
  }

  /**
   * Mock mode for development/fallback
   */
  private startMockMode(): void {
    console.warn('📡 Starting WebSocket mock mode');
    this.isMockMode = true;

    // Simulate real-time global petal updates with realistic growth
    let globalPetalCount = 750000; // Starting count
    let dailyCollectorCount = 2500; // Starting collector count

    setInterval(() => {
      // Realistic increment based on time of day and activity
      const hour = new Date().getHours();
      const isPeakTime = hour >= 18 && hour <= 23; // Evening peak hours
      const baseIncrement = Math.floor(Math.random() * 8) + 2; // 2-9 petals
      const peakMultiplier = isPeakTime ? 2.5 : 1;
      const randomIncrement = Math.floor(baseIncrement * peakMultiplier);

      // Apply increment to global count
      globalPetalCount += randomIncrement;

      // Occasionally add new collectors (1-3 per update)
      if (Math.random() < 0.3) {
        dailyCollectorCount += Math.floor(Math.random() * 3) + 1;
      }

      this.handleMessage({
        type: 'global-petals',
        count: globalPetalCount,
        dailyCollectors: dailyCollectorCount,
      });
    }, 5000);

    // Simulate leaderboard updates
    setInterval(() => {
      const mockLeaderboard: LeaderboardEntry[] = Array.from({ length: 10 }, (_, i) => ({
        rank: i + 1,
        username: `Traveler${Math.floor(Math.random() * 9999)}`,
        petals: Math.floor(Math.random() * 10000) + 1000,
      })).sort((a, b) => b.petals - a.petals);

      this.handleMessage({
        type: 'leaderboard',
        data: mockLeaderboard,
      });
    }, 10000);

    // Simulate community progress
    setInterval(() => {
      this.handleMessage({
        type: 'community-progress',
        progress: Math.random() * 100,
        milestone: `${Math.floor(Math.random() * 10)}M petals collected!`,
      });
    }, 15000);
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Subscribe to specific message types
   */
  on(type: WebSocketMessage['type'], handler: MessageHandler): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.handlers.get(type)?.delete(handler);
    };
  }

  /**
   * Unsubscribe from specific message types
   */
  removeListener(type: WebSocketMessage['type'], handler: MessageHandler): void {
    this.handlers.get(type)?.delete(handler);
  }

  /**
   * Send message to server
   */
  send(data: unknown): void {
    if (this.isMockMode) {
      console.warn('Mock mode: Message not sent', data);
      return;
    }

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket not connected');
    }
  }

  /**
   * Handle incoming messages
   */
  private handleMessage(message: WebSocketMessage): void {
    const handlers = this.handlers.get(message.type);
    if (handlers) {
      handlers.forEach((handler) => handler(message));
    }
  }

  /**
   * Heartbeat to keep connection alive
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.send({ type: 'ping', timestamp: Date.now() });
    }, 30000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Reconnection logic
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn('Max reconnection attempts reached, switching to mock mode');
      this.startMockMode();
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.warn(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      this.connect();
    }, delay);
  }
}

// Singleton instance
export const communityWS = new CommunityWebSocketClient();
