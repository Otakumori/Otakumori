import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.resetModules();
  vi.restoreAllMocks();
});

async function loadRoute(options: { authorized: boolean }) {
  const requireAdminOrThrow = options.authorized
    ? vi.fn().mockResolvedValue({ userId: 'admin_test' })
    : vi.fn().mockRejectedValue(new Response('Unauthorized', { status: 401 }));
  const providerModuleLoads = vi.fn();
  const validateAllProductLinks = vi.fn().mockResolvedValue({
    productsChecked: 0,
    issueCount: 0,
    invalidProductCount: 0,
    issues: [],
    checkedAt: '2026-11-09T00:00:00.000Z',
  });
  const syncProductsWithValidation = vi.fn().mockResolvedValue({
    productsChecked: 0,
    issueCount: 0,
    invalidProductCount: 0,
    issues: [],
    checkedAt: '2026-11-09T00:00:00.000Z',
    syncedAt: '2026-11-09T00:00:00.000Z',
  });

  vi.doMock('@/lib/adminGuard', () => ({ requireAdminOrThrow }));
  vi.doMock('@/app/lib/logger', () => ({
    logger: {
      warn: vi.fn(),
      error: vi.fn(),
    },
  }));
  vi.doMock('@/app/lib/printify/enhanced-service', () => {
    providerModuleLoads();
    return {
      enhancedPrintifyService: {
        validateAllProductLinks,
        syncProductsWithValidation,
      },
    };
  });

  const fetchSpy = vi.spyOn(globalThis, 'fetch');
  const route = await import('@/app/api/v1/printify/enhanced-sync/route');

  return {
    route,
    requireAdminOrThrow,
    providerModuleLoads,
    validateAllProductLinks,
    syncProductsWithValidation,
    fetchSpy,
  };
}

describe('enhanced Printify sync initialization', () => {
  it('imports without credentials, provider initialization, or network access', async () => {
    const { route, providerModuleLoads, fetchSpy } = await loadRoute({ authorized: false });

    expect(route.GET).toBeTypeOf('function');
    expect(route.POST).toBeTypeOf('function');
    expect(providerModuleLoads).not.toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('rejects unauthorized GET and POST before loading the provider service', async () => {
    const { route, requireAdminOrThrow, providerModuleLoads, fetchSpy } = await loadRoute({
      authorized: false,
    });

    const getResponse = await route.GET();
    const postResponse = await route.POST(
      new Request('http://localhost/api/v1/printify/enhanced-sync', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ fullSync: true }),
      }) as never,
    );

    expect(getResponse.status).toBe(500);
    expect(postResponse.status).toBe(500);
    expect(requireAdminOrThrow).toHaveBeenCalledTimes(2);
    expect(providerModuleLoads).not.toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('loads the provider only after authorization and preserves GET and POST behavior', async () => {
    const {
      route,
      requireAdminOrThrow,
      providerModuleLoads,
      validateAllProductLinks,
      syncProductsWithValidation,
    } = await loadRoute({ authorized: true });

    const getResponse = await route.GET();
    const validateResponse = await route.POST(
      new Request('http://localhost/api/v1/printify/enhanced-sync', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ fullSync: false }),
      }) as never,
    );
    const syncResponse = await route.POST(
      new Request('http://localhost/api/v1/printify/enhanced-sync', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ fullSync: true }),
      }) as never,
    );

    expect(getResponse.status).toBe(200);
    expect(validateResponse.status).toBe(200);
    expect(syncResponse.status).toBe(200);
    expect(requireAdminOrThrow).toHaveBeenCalledTimes(3);
    expect(providerModuleLoads).toHaveBeenCalledTimes(1);
    expect(validateAllProductLinks).toHaveBeenCalledTimes(2);
    expect(syncProductsWithValidation).toHaveBeenCalledTimes(1);
  });
});
