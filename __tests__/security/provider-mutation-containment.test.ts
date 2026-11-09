import crypto from 'node:crypto';

import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.resetModules();
  vi.restoreAllMocks();
});

describe('retired provider mutation routes', () => {
  it.each([
    ['shipping purchase', '@/app/api/shipping/buy/route', 'SHIPPING_PURCHASE_ROUTE_RETIRED'],
    ['shipping rates', '@/app/api/shipping/rates/route', 'SHIPPING_RATES_ROUTE_RETIRED'],
    [
      'generic Inngest bridge',
      '@/app/api/webhooks/inngest/route',
      'INNGEST_WEBHOOK_BRIDGE_RETIRED',
    ],
    [
      'Printify inventory sync',
      '@/app/api/v1/printify/inventory/sync/route',
      'PRINTIFY_INVENTORY_ROUTE_RETIRED',
    ],
  ])('retires %s without importing mutation providers', async (_label, routePath, error) => {
    vi.doMock('@/app/lib/easypost', () => {
      throw new Error('EasyPost provider must not load');
    });
    vi.doMock('@/app/lib/printify/advanced-service', () => {
      throw new Error('Printify provider must not load');
    });
    vi.doMock('@/inngest/client', () => {
      throw new Error('Inngest client must not load');
    });

    const route = await import(routePath);
    const responses = await Promise.all(
      Array.from({ length: 4 }, () =>
        route.POST(
          new Request(`http://localhost/${routePath}`, {
            method: 'POST',
            headers: { authorization: 'Bearer forged' },
            body: '{malformed',
          }),
        ),
      ),
    );

    for (const response of responses) {
      expect(response.status).toBe(410);
      await expect(response.json()).resolves.toEqual(expect.objectContaining({ ok: false, error }));
    }
  });

  it('retires read access to the stateful Printify inventory sync provider', async () => {
    const route = await import('@/app/api/v1/printify/inventory/sync/route');
    const response = await route.GET();

    expect(response.status).toBe(410);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({
        ok: false,
        error: 'PRINTIFY_INVENTORY_ROUTE_RETIRED',
        canonicalPath: '/api/v1/printify/sync-status',
      }),
    );
  });

  it('retires generic Inngest health claims while preserving the official route separately', async () => {
    const route = await import('@/app/api/webhooks/inngest/route');
    const response = await route.GET();

    expect(response.status).toBe(410);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({ canonicalPath: '/api/inngest' }),
    );
  });
});

async function loadEasyPostRoute(secret?: string) {
  vi.resetModules();
  vi.doMock('@/env.mjs', () => ({
    env: { EASYPOST_WEBHOOK_SECRET: secret },
  }));
  return import('@/app/api/webhooks/easypost/route');
}

function signedEasyPostRequest(
  body: string,
  secret: string,
  overrides: Record<string, string | undefined> = {},
) {
  const timestamp = overrides.timestamp ?? new Date().toUTCString();
  const path = overrides.path ?? '/api/webhooks/easypost';
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}POST${path}${body}`, 'utf8')
    .digest('hex');
  const headers = new Headers({
    'x-timestamp': timestamp,
    'x-path': path,
    'x-hmac-signature-v2': `hmac-sha256-hex=${signature}`,
  });

  for (const [name, value] of Object.entries(overrides)) {
    if (name === 'timestamp' || name === 'path') continue;
    if (value === undefined) headers.delete(name);
    else headers.set(name, value);
  }

  return new Request('http://localhost/api/webhooks/easypost', {
    method: 'POST',
    headers,
    body,
  });
}

describe('EasyPost webhook authenticity', () => {
  it('accepts a fresh webhook with the documented timestamped HMAC', async () => {
    const secret = 'synthetic-easypost-secret';
    const body = JSON.stringify({ id: 'evt_test', description: 'tracker.updated' });
    const { POST } = await loadEasyPostRoute(secret);
    const response = await POST(signedEasyPostRequest(body, secret));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
  });

  it('fails closed when the webhook secret is unavailable', async () => {
    const { POST } = await loadEasyPostRoute(undefined);
    const response = await POST(
      new Request('http://localhost/api/webhooks/easypost', { method: 'POST', body: '{}' }),
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: 'EASYPOST_WEBHOOK_UNAVAILABLE',
    });
  });

  it.each([
    ['missing signature', { 'x-hmac-signature-v2': undefined }],
    ['malformed signature', { 'x-hmac-signature-v2': 'not-a-signature' }],
    ['wrong request path', { path: '/api/webhooks/other' }],
    [
      'legacy signature header only',
      { 'x-hmac-signature-v2': undefined, 'x-ep-signature': 'forged' },
    ],
  ])('rejects %s', async (_label, overrides) => {
    const secret = 'synthetic-easypost-secret';
    const { POST } = await loadEasyPostRoute(secret);
    const response = await POST(signedEasyPostRequest('{}', secret, overrides));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: 'EASYPOST_WEBHOOK_UNAUTHORIZED',
    });
  });

  it.each([
    ['stale', new Date(Date.now() - 61_000).toUTCString()],
    ['too far in the future', new Date(Date.now() + 61_000).toUTCString()],
  ])('rejects a %s signed request to prevent replay', async (_label, timestamp) => {
    const secret = 'synthetic-easypost-secret';
    const { POST } = await loadEasyPostRoute(secret);
    const response = await POST(signedEasyPostRequest('{}', secret, { timestamp }));

    expect(response.status).toBe(401);
  });
});
