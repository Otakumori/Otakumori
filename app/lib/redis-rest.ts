import { env } from '@/env.mjs';

export const redis = {
  async set(key: string, value: string, opts?: { nx?: boolean; ex?: number }) {
    const url = new URL(
      `${env.UPSTASH_REDIS_REST_URL}/set/${encodeURIComponent(key)}/${encodeURIComponent(value)}`,
    );
    if (opts?.nx) url.searchParams.set('nx', 'true');
    if (opts?.ex) url.searchParams.set('ex', String(opts.ex));
    const r = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}` },
    });
    const j = await r.json();
    return j?.result; // "OK" or null
  },
  async get(key: string) {
    const r = await fetch(`${env.UPSTASH_REDIS_REST_URL}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}` },
    });
    const j = await r.json();
    return j?.result as string | null;
  },
};
