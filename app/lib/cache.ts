/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable-line @next/next/no-img-element */
import { Redis } from '@upstash/redis';
import { env } from './env';

const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL || '',
  token: env.UPSTASH_REDIS_REST_TOKEN || '',
});

class Cache {
  async get(key: string): Promise<any> {
    try {
      return await redis.get(key);
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, options?: { ttl?: number }): Promise<void> {
    try {
      if (options?.ttl) {
        await redis.setex(key, options.ttl, JSON.stringify(value));
      } else {
        await redis.set(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      console.error('Cache del error:', error);
    }
  }
}

export const cache = new Cache();
