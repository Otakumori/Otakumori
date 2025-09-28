import { redis } from './redis.safe';
import { env } from '@/env';

export async function claimIdempotency(
  key: string,
  ttlSeconds = Number((env as any).IDEMPOTENCY_TTL_SECONDS || 86400),
) {
  return redis.setNX(`idemp:${key}`, '1', ttlSeconds);
}
