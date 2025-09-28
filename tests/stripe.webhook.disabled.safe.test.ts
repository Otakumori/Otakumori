import { describe, it, expect } from 'vitest';
describe('stripe webhook disabled', () => {
  it('returns 503 when STRIPE_WEBHOOK_SECRET missing', async () => {
    const mod = await import('@/app/api/webhooks/stripe/route.safe');
    // Simulate missing env by deleting at runtime
    const old = process.env.STRIPE_WEBHOOK_SECRET;
    delete (process.env as any).STRIPE_WEBHOOK_SECRET;
    const res = await mod.POST(new Request('http://x', { method: 'POST', body: '' }) as any);
    expect(res.status).toBe(503);
    process.env.STRIPE_WEBHOOK_SECRET = old;
  });
});
