/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable-line @next/next/no-img-element */
import { Redis } from '@upstash/redis';
import { env } from '@/env';

let redisSingleton: Redis | null = null;

export function getRedis(): Redis | null {
  const url = env.UPSTASH_REDIS_REST_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  if (redisSingleton) return redisSingleton;
  redisSingleton = new Redis({ url, token });
  return redisSingleton;
}

// Export the singleton instance for direct use
export const redis = getRedis();
