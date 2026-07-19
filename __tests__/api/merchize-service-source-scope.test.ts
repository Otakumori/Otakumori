import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MerchizeService } from '@/app/lib/merchize/service';

vi.mock('@/env.mjs', () => ({
  env: {
    MERCHIZE_API_URL: 'https://merchize.example',
    MERCHIZE_STORE_API_URL: '',
    MERCHIZE_ACCESS_TOKEN: 'test-token',
    MERCHIZE_API_TOKEN: '',
  },
}));

function providerProduct(index: number) {
  return {
    _id: `provider-product-${index}`,
    title: `Blank Fulfillment Product ${index}`,
    sku: `BLANK-${index}`,
    status: 'active',
    images: [`https://cdn.example.com/blank-${index}.png`],
    variants: [
      {
        _id: `provider-variant-${index}`,
        sku: `BLANK-${index}-VARIANT`,
        title: 'Default',
        options: { Size: 'Default' },
        price: 20,
        currency: 'USD',
        available: true,
      },
    ],
  };
}

function providerResponse(input: {
  products: unknown[];
  total?: unknown;
  limit?: unknown;
  page?: unknown;
}) {
  const data: Record<string, unknown> = { products: input.products };
  if ('total' in input) data.total = input.total;
  if ('limit' in input) data.limit = input.limit;
  if ('page' in input) data.page = input.page;
  return { success: true, data };
}

function mockFetch(body: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: vi.fn().mockResolvedValue(JSON.stringify(body)),
    }),
  );
}

describe('Merchize service source scope and pagination', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('normalizes a complete fulfillment blank catalog but does not authorize import', async () => {
    const products = Array.from({ length: 50 }, (_, index) => providerProduct(index + 1));
    mockFetch(providerResponse({ products, total: 50, limit: 50, page: 1 }));

    const preflight = await new MerchizeService().preflightCatalog({ limit: 50, page: 1 });

    expect(preflight.catalogScope).toBe('fulfillment_blank_catalog');
    expect(preflight.completeness).toBe('complete');
    expect(preflight.pagination).toMatchObject({
      total: 50,
      limit: 50,
      page: 1,
      loadedCount: 50,
      completeness: 'complete',
    });
    expect(preflight.safeToNormalize).toBe(true);
    expect(preflight.safeToImport).toBe(false);
    expect(preflight.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'unsupported_provider_catalog_scope', count: 50 }),
      ]),
    );
    expect(JSON.stringify(preflight)).not.toContain('test-token');
  });

  it('marks pagination incomplete when provider total exceeds the loaded page', async () => {
    const products = Array.from({ length: 50 }, (_, index) => providerProduct(index + 1));
    mockFetch(providerResponse({ products, total: 51, limit: 50, page: 1 }));

    const preflight = await new MerchizeService().preflightCatalog({ limit: 51, page: 1 });

    expect(preflight.completeness).toBe('incomplete');
    expect(preflight.safeToImport).toBe(false);
    expect(JSON.stringify(preflight.issues)).toContain('provider_catalog_completeness_unverified');
  });

  it('keeps completeness unknown when pagination metadata is missing or malformed', async () => {
    const products = [providerProduct(1)];
    for (const body of [
      providerResponse({ products }),
      providerResponse({ products, total: -1, limit: 50, page: 1 }),
      providerResponse({ products, total: 1, limit: 0, page: 1 }),
      providerResponse({ products, total: 1, limit: 50, page: 0 }),
      providerResponse({ products, total: 1, limit: 50, page: 1.5 }),
    ]) {
      mockFetch(body);

      const preflight = await new MerchizeService().preflightCatalog({ limit: 51, page: 1 });

      expect(preflight.completeness).toBe('unknown');
      expect(preflight.safeToImport).toBe(false);
      expect(JSON.stringify(preflight.issues)).toContain(
        'provider_catalog_completeness_unverified',
      );
    }
  });
});
