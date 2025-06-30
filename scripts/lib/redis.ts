import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const redisPassword = process.env.REDIS_PASSWORD || undefined;

export const redis = createClient({
  url: redisUrl,
  password: redisPassword,
});

redis.on('error', err => console.error('Redis Client Error', err));

(async () => {
  if (!redis.isOpen) {
    await redis.connect();
  }
})();
