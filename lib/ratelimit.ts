import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { env } from '@/env.mjs';

// Simple Upstash rate-limit helper for API routes
const url = env.UPSTASH_REDIS_REST_URL;
const token = env.UPSTASH_REDIS_REST_TOKEN;

export const rl =
  url && token
    ? new Ratelimit({
        // @ts-ignore type mismatch between libs in some TS setups
        redis: new (Redis as any)({ url, token }),
        limiter: Ratelimit.slidingWindow(20, '10 s'),
      })
    : null;

export async function limitApi(key: string) {
  if (!rl) return { success: true, limit: 0, reset: Date.now(), remaining: 0 };
  return rl.limit(key);
}
