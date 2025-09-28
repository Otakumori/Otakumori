import { describe, it, expect } from 'vitest';
import { redis, ensureRedis } from '@/src/lib/redis.safe';

describe('redis disabled', () => {
  it('throws error when UPSTASH_REDIS_REST_URL is missing', async () => {
    const old = process.env.UPSTASH_REDIS_REST_URL;
    delete (process.env as any).UPSTASH_REDIS_REST_URL;
    expect(() => ensureRedis()).toThrow('Redis not configured');
    await expect(redis.setNX('test', '1', 60)).rejects.toThrow('Redis not configured');
    process.env.UPSTASH_REDIS_REST_URL = old;
  });

  it('throws error when UPSTASH_REDIS_REST_TOKEN is missing', async () => {
    const old = process.env.UPSTASH_REDIS_REST_TOKEN;
    delete (process.env as any).UPSTASH_REDIS_REST_TOKEN;
    expect(() => ensureRedis()).toThrow('Redis not configured');
    await expect(redis.setNX('test', '1', 60)).rejects.toThrow('Redis not configured');
    process.env.UPSTASH_REDIS_REST_TOKEN = old;
  });
});
