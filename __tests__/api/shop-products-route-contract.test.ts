import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ loggerError: vi.fn() }));

vi.mock('@/app/lib/logger', () => ({
  logger: { error: mocks.loggerError },
}));

import { GET } from '@/app/api/shop/products/route';

const request = () => new NextRequest('http://localhost/api/shop/products');

describe('shop product availability contract', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mocks.loggerError.mockReset();
  });

  it('preserves an intentional not-configured catalog response for UI fallback', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      Response.json({
        ok: true,
        data: { products: [] },
        source: 'not-configured',
        message: 'Products temporarily unavailable.',
      }),
    );

    const response = await GET(request());
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(payload).toMatchObject({
      products: [],
      source: 'not-configured',
      count: 0,
      message: 'Products temporarily unavailable.',
    });
  });

  it('returns a sanitized 503 for an unexpected upstream failure', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(
      new Error('sensitive-provider-host.example secret diagnostic'),
    );

    const response = await GET(request());
    const payload = await response.json();

    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(payload).toMatchObject({
      products: [],
      source: 'unavailable',
      code: 'PRODUCT_CATALOG_UNAVAILABLE',
      message: 'Products are temporarily unavailable.',
    });
    expect(JSON.stringify(payload)).not.toMatch(/sensitive-provider-host|secret diagnostic/);
  });

  it('does not convert an upstream error-fallback into HTTP 200', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      Response.json({
        ok: true,
        data: { products: [] },
        source: 'error-fallback',
        error: 'provider request failed',
      }),
    );

    const response = await GET(request());
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      code: 'PRODUCT_CATALOG_UNAVAILABLE',
      source: 'unavailable',
    });
  });
});
