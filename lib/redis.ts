import { Redis } from '@upstash/redis';
import { env } from '@/env.mjs';

// Create Redis client for caching and rate limiting
export const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

// Cache helper functions
export const cache = {
  // Get cached data
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key);
      return data as T;
    } catch (error) {
      console.warn('Redis get error:', error);
      return null;
    }
  },

  // Set cached data with TTL
  async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    try {
      await redis.setex(key, ttlSeconds, JSON.stringify(value));
    } catch (error) {
      console.warn('Redis set error:', error);
    }
  },

  // Delete cached data
  async del(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      console.warn('Redis del error:', error);
    }
  },

  // Check if key exists
  async exists(key: string): Promise<boolean> {
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      console.warn('Redis exists error:', error);
      return false;
    }
  },

  // Increment counter (for rate limiting)
  async incr(key: string): Promise<number> {
    try {
      return await redis.incr(key);
    } catch (error) {
      console.warn('Redis incr error:', error);
      return 0;
    }
  },

  // Set TTL on existing key
  async expire(key: string, ttlSeconds: number): Promise<void> {
    try {
      await redis.expire(key, ttlSeconds);
    } catch (error) {
      console.warn('Redis expire error:', error);
    }
  }
};

// Rate limiting helper
export const rateLimit = {
  async check(key: string, limit: number, windowSeconds: number): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
  }> {
    const current = await cache.incr(key);
    
    if (current === 1) {
      await cache.expire(key, windowSeconds);
    }

    const allowed = current <= limit;
    const remaining = Math.max(0, limit - current);
    const resetTime = Date.now() + (windowSeconds * 1000);

    return { allowed, remaining, resetTime };
  }
};

// Cache keys for different data types
export const cacheKeys = {
  shop: {
    products: (category?: string, limit?: number, offset?: number) => 
      `shop:products:${category || 'all'}:${limit || 50}:${offset || 0}`,
    product: (id: string) => `shop:product:${id}`,
    categories: () => 'shop:categories'
  },
  games: {
    stats: (userId: string) => `games:stats:${userId}`,
    leaderboard: (game: string, difficulty?: string) => 
      `games:leaderboard:${game}:${difficulty || 'all'}`
  },
  achievements: {
    user: (userId: string) => `achievements:user:${userId}`,
    all: () => 'achievements:all'
  },
  petals: {
    balance: (userId: string) => `petals:balance:${userId}`,
    ledger: (userId: string) => `petals:ledger:${userId}`
  }
};
