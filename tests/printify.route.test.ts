import { describe, it, expect, vi } from 'vitest';
import { callGET } from './helpers/route';

// Mock the env module
vi.mock('@/env', () => ({
  env: {
    PRINTIFY_API_URL: 'https://api.printify.com/v1',
    PRINTIFY_API_KEY: 'pk_test_xxx',
    PRINTIFY_SHOP_ID: '12345',
  },
}));

describe('Printify products API', () => {
  it('calls Printify with correct headers and path', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify([{ id: 'p1', title: 'Test Product' }]), { status: 200 }),
      );

    const route = await import('../../app/api/printify/products/route');
    const { json } = await callGET(route);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringMatching(/printify\.com/i),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: expect.stringMatching(/^Bearer /) }),
      }),
    );
    expect(json).toBeTruthy();
    if ((json as any).ok !== undefined) {
      expect((json as any).ok).toBe(true);
    }
    const arr = (json as any)?.data?.products ?? (json as any)?.data?.items ?? json;
    expect(Array.isArray(arr)).toBe(true);
  });
});
