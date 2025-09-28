import { env } from '@/env.mjs';

export const redis = {
  async set(key: string, value: string, opts?: { nx?: boolean; ex?: number }) {
    // Properly handle environment variables with potential newlines/whitespace
    const baseUrl = env.UPSTASH_REDIS_REST_URL?.trim().replace(/\r?\n/g, '');
    if (!baseUrl) throw new Error('Missing UPSTASH_REDIS_REST_URL');

    const url = new URL(`${baseUrl}/set/${encodeURIComponent(key)}/${encodeURIComponent(value)}`);
    if (opts?.nx) url.searchParams.set('nx', 'true');
    if (opts?.ex) url.searchParams.set('ex', String(opts.ex));
    const r = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN?.trim().replace(/\r?\n/g, '')}`,
      },
    });
    const j = await r.json();
    return j?.result; // "OK" or null
  },
  async get(key: string) {
    // Properly handle environment variables with potential newlines/whitespace
    const baseUrl = env.UPSTASH_REDIS_REST_URL?.trim().replace(/\r?\n/g, '');
    if (!baseUrl) throw new Error('Missing UPSTASH_REDIS_REST_URL');

    const r = await fetch(`${baseUrl}/get/${encodeURIComponent(key)}`, {
      headers: {
        Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN?.trim().replace(/\r?\n/g, '')}`,
      },
    });
    const j = await r.json();
    return j?.result as string | null;
  },
};
