import { describe, it, expect } from 'vitest';
describe('easypost disabled', () => {
  it('returns 503 when FEATURE_EASYPOST is not enabled', async () => {
    const mod = await import('@/app/api/shipping/rates/route.safe');
    const old = process.env.FEATURE_EASYPOST;
    delete (process.env as any).FEATURE_EASYPOST;
    const res = await mod.POST(new Request('http://x', { method: 'POST', body: '{}' }) as any);
    expect(res.status).toBe(503);
    process.env.FEATURE_EASYPOST = old;
  });

  it('returns 503 when EASYPOST_API_KEY is missing', async () => {
    const mod = await import('@/app/api/shipping/rates/route.safe');
    const oldFeature = process.env.FEATURE_EASYPOST;
    const oldKey = process.env.EASYPOST_API_KEY;
    process.env.FEATURE_EASYPOST = 'true';
    delete (process.env as any).EASYPOST_API_KEY;
    const res = await mod.POST(new Request('http://x', { method: 'POST', body: '{}' }) as any);
    expect(res.status).toBe(503);
    process.env.FEATURE_EASYPOST = oldFeature;
    process.env.EASYPOST_API_KEY = oldKey;
  });
});
