import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL!,
  token: env.UPSTASH_REDIS_REST_TOKEN!,
});

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[];
}

export const cache = {
  async get(key: string) {
    try {
      return await redis.get(key);
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  },

  async set(key: string, value: any, options?: { ttl?: number }) {
    try {
      if (options?.ttl) {
        await redis.set(key, value, { ex: options.ttl });
      } else {
        await redis.set(key, value);
      }
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  },

  async del(key: string) {
    try {
      await redis.del(key);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  },

  async clear() {
    try {
      await redis.flushdb();
      return true;
    } catch (error) {
      console.error('Cache clear error:', error);
      return false;
    }
  },
};

export class Cache {
  private static instance: Cache;
  private redis: Redis;

  private constructor() {
    this.redis = redis;
  }

  public static getInstance(): Cache {
    if (!Cache.instance) {
      Cache.instance = new Cache();
    }
    return Cache.instance;
  }

  async invalidateByTags(tags: string[]): Promise<void> {
    try {
      const keys = await Promise.all(
        tags.map(tag => this.redis.smembers(`tag:${tag}`))
      );
      
      const uniqueKeys = [...new Set(keys.flat())];
      if (uniqueKeys.length) {
        await this.redis.del(...uniqueKeys);
      }

      await Promise.all(
        tags.map(tag => this.redis.del(`tag:${tag}`))
      );
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
  }
} 