import { env } from '@/env';

const URL_ = (env as any).UPSTASH_REDIS_REST_URL;
const TOKEN = (env as any).UPSTASH_REDIS_REST_TOKEN;
export function ensureRedis() {
  if (!URL_ || !TOKEN) throw new Error('Redis not configured');
}
export const redis = {
  async setNX(key: string, value: string, exSeconds: number) {
    if (!URL_ || !TOKEN) throw new Error('Redis not configured');
    const url = new URL(`${URL_}/set/${encodeURIComponent(key)}/${encodeURIComponent(value)}`);
    url.searchParams.set('nx', 'true');
    url.searchParams.set('ex', String(exSeconds));
    const r = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
    const j = await r.json();
    return j?.result === 'OK';
  },
};
