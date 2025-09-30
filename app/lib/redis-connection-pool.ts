/**
 * Redis Connection Pool
 *
 * Manages Redis connections efficiently to prevent connection exhaustion
 * and improve performance.
 */

import { Redis } from 'ioredis';
import { env } from '@/env.mjs';

export class RedisConnectionPool {
  private static instance: RedisConnectionPool;
  private pool: Redis[] = [];
  private maxConnections: number = 10;
  private currentConnections: number = 0;
  private waitingQueue: Array<{
    resolve: (redis: Redis) => void;
    reject: (error: Error) => void;
  }> = [];

  static getInstance(): RedisConnectionPool {
    if (!RedisConnectionPool.instance) {
      RedisConnectionPool.instance = new RedisConnectionPool();
    }
    return RedisConnectionPool.instance;
  }

  /**
   * Get a Redis connection from the pool
   */
  async getConnection(): Promise<Redis> {
    // Return existing connection from pool
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }

    // Create new connection if under limit
    if (this.currentConnections < this.maxConnections) {
      const redis = new Redis({
        host: env.UPSTASH_REDIS_REST_URL,
        port: 6379,
        password: env.UPSTASH_REDIS_REST_TOKEN,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        keepAlive: 30000,
        connectTimeout: 10000,
        commandTimeout: 5000,
      });

      this.currentConnections++;
      return redis;
    }

    // Wait for available connection
    return new Promise((resolve, reject) => {
      this.waitingQueue.push({ resolve, reject });
    });
  }

  /**
   * Return a connection to the pool
   */
  returnConnection(redis: Redis): void {
    if (this.waitingQueue.length > 0) {
      const { resolve } = this.waitingQueue.shift()!;
      resolve(redis);
    } else {
      this.pool.push(redis);
    }
  }

  /**
   * Execute a Redis command with automatic connection management
   */
  async execute<T>(command: (redis: Redis) => Promise<T>): Promise<T> {
    const redis = await this.getConnection();

    try {
      const result = await command(redis);
      return result;
    } finally {
      this.returnConnection(redis);
    }
  }

  /**
   * Get pool statistics
   */
  getStats(): {
    availableConnections: number;
    currentConnections: number;
    maxConnections: number;
    waitingQueue: number;
  } {
    return {
      availableConnections: this.pool.length,
      currentConnections: this.currentConnections,
      maxConnections: this.maxConnections,
      waitingQueue: this.waitingQueue.length,
    };
  }

  /**
   * Close all connections
   */
  async closeAll(): Promise<void> {
    // Close all pooled connections
    for (const redis of this.pool) {
      await redis.quit();
    }

    this.pool = [];
    this.currentConnections = 0;

    // Reject all waiting requests
    for (const { reject } of this.waitingQueue) {
      reject(new Error('Connection pool closed'));
    }

    this.waitingQueue = [];
  }
}

// Export singleton instance
export const redisPool = RedisConnectionPool.getInstance();
