// lib/redis.ts
import { logger } from '@/app/lib/logger';
import { assertServer } from './server-only';
import { env } from '@/env.mjs';
import type { Redis } from 'ioredis';

let _client: Redis | null = null;

export async function getRedis() {
  assertServer();
  if (_client) return _client;

  // Lazy import so nothing runs at build time
  const { default: IORedis } = await import('ioredis');

  // Properly handle environment variables with potential newlines/whitespace
  const url = env.UPSTASH_REDIS_REST_URL?.trim().replace(/\r?\n/g, '');
  const token = env.UPSTASH_REDIS_REST_TOKEN?.trim().replace(/\r?\n/g, '');

  if (!url || !token) {
    logger.warn(
      'Redis not configured - UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN missing',
    );
    throw new Error('Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN');
  }

  // For Upstash Redis, we need to use the REST API format
  const redisUrl = `rediss://:${token}@${url.replace('https://', '')}`;

  _client = new IORedis(redisUrl, {
    // Fast connect, no DNS at import time
    lazyConnect: true,
    maxRetriesPerRequest: 2,
    enableReadyCheck: true,
  });

  if (_client.status === 'wait') await _client.connect();
  return _client;
}

export async function redisPing() {
  const r = await getRedis();
  return r.ping();
}

// Legacy wrapper for existing code - but now build-time safe
export const redis = {
  get: async (key: string) => {
    const client = await getRedis();
    return client.get(key);
  },
  set: async (key: string, value: any, options?: any) => {
    const client = await getRedis();
    return client.set(key, value, options);
  },
  del: async (key: string) => {
    const client = await getRedis();
    return client.del(key);
  },
  ttl: async (key: string) => {
    const client = await getRedis();
    return client.ttl(key);
  },
  incr: async (key: string) => {
    const client = await getRedis();
    return client.incr(key);
  },
  expire: async (key: string, seconds: number) => {
    const client = await getRedis();
    return client.expire(key, seconds);
  },
  multi: () => {
    // Return a promise-based multi for build-time safety
    return Promise.resolve().then(async () => {
      const client = await getRedis();
      return client.multi();
    });
  },
  pipeline: () => {
    return Promise.resolve().then(async () => {
      const client = await getRedis();
      return client.pipeline();
    });
  },
};
