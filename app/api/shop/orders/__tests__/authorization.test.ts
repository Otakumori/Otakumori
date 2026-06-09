import { beforeEach, describe, expect, it, vi } from 'vitest';

const authorizeProviderWriteMock = vi.fn();
const providerFetchMock = vi.fn();

vi.mock('@/env', () => ({
  env: {
    PRINTIFY_API_KEY: 'test-disabled',
    PRINTIFY_SHOP_ID: 'test-disabled',
  },
}));

vi.mock('@/app/lib/security/providerWriteGuard', () => ({
  authorizeProviderWrite: authorizeProviderWriteMock,
}));

vi.mock('@/app/lib/logger', () => ({
  logger: { error: vi.fn() },
}));

describe('POST /api/shop/orders authorization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', providerFetchMock);
  });

  it('does not execute the provider request after authorization denial', async () => {
    authorizeProviderWriteMock.mockResolvedValue({
      ok: false,
      response: Response.json({ ok: false, error: 'AUTH_REQUIRED' }, { status: 401 }),
    });
    const { POST } = await import('../route');
    const request = new Request('https://otaku-mori.test/api/shop/orders', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ items: [], shippingAddress: {} }),
    });

    const response = await POST(request as Parameters<typeof POST>[0]);

    expect(response.status).toBe(401);
    expect(providerFetchMock).not.toHaveBeenCalled();
  });
});
