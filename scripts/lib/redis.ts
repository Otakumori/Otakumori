// DEPRECATED: This component is a duplicate. Use lib\redis.ts instead.
import { createClient } from 'redis';
import { env } from '@/env';

export const redis = createClient({
  url: env.UPSTASH_REDIS_REST_URL,
  password: env.UPSTASH_REDIS_REST_TOKEN,
});

redis.on('error', (err) => console.error('Redis Client Error', err));

(async () => {
  if (!redis.isOpen) {
    await redis.connect();
  }
})();
