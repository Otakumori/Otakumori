import fs from 'node:fs';
import path from 'node:path';
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { db } from '@/app/lib/db';

vi.mock('@/app/lib/db', () => ({
  db: {
    product: {
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
    },
  },
}));

vi.mock('@/app/lib/printify/service', () => ({
  getPrintifyService: vi.fn(() => ({
    getProduct: vi.fn(),
  })),
}));

vi.mock('@/lib/catalog/e2eFallback', () => ({
  getE2EFallbackProducts: vi.fn(() => []),
  getCatalogFallbackProduct: vi.fn(() => null),
  shouldUseCatalogFallback: vi.fn(() => false),
}));

vi.mock('@/app/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('hidden Merchize products remain public-route safe', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(db.product.findMany).mockResolvedValue([]);
    vi.mocked(db.product.count).mockResolvedValue(0);
    vi.mocked(db.product.findUnique).mockResolvedValue(null);
    vi.mocked(db.product.findFirst).mockResolvedValue(null);
  });

  it('/api/v1/catalog queries only active visible products', async () => {
    const mod = await import('../../app/api/v1/catalog/route');

    const response = await mod.GET(new NextRequest('http://localhost/api/v1/catalog?limit=20'));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data.pagination.total).toBe(0);
    expect(db.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { active: true, visible: true },
      }),
    );
  });

  it('/api/v1/products queries only active visible products', async () => {
    const mod = await import('../../app/api/v1/products/route');

    const response = await mod.GET(new NextRequest('http://localhost/api/v1/products?limit=20'));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data.pagination.total).toBe(0);
    expect(db.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ active: true, visible: true }),
      }),
    );
  });

  it('/api/v1/products/[id] rejects hidden Merchize products', async () => {
    vi.mocked(db.product.findUnique).mockResolvedValue({
      id: 'hidden-merchize-product',
      name: 'Hidden Merchize Tee',
      active: false,
      visible: false,
      printifyProductId: null,
      integrationRef: 'merchize:mz-product-1',
      ProductVariant: [],
      ProductImage: [],
    } as never);
    const mod = await import('../../app/api/v1/products/[id]/route');

    const response = await mod.GET(
      new NextRequest('http://localhost/api/v1/products/hidden-merchize-product'),
      { params: Promise.resolve({ id: 'hidden-merchize-product' }) },
    );
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.error.code).toBe('NOT_FOUND');
  });

  it('/api/v1/catalog-product/[id] does not expose merchize provider refs publicly', async () => {
    const mod = await import('../../app/api/v1/catalog-product/[id]/route');

    const response = await mod.GET(
      new NextRequest('http://localhost/api/v1/catalog-product/merchize:mz-product-1'),
      { params: Promise.resolve({ id: 'merchize:mz-product-1' }) },
    );
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.error.code).toBe('NOT_FOUND');
    expect(db.product.findUnique).not.toHaveBeenCalled();
  });

  it('checkout session and Stripe webhook paths contain provider fail-closed guards', () => {
    const repoRoot = process.cwd();
    const v1Session = fs.readFileSync(
      path.join(repoRoot, 'app/api/v1/checkout/session/route.ts'),
      'utf8',
    );
    const legacySession = fs.readFileSync(
      path.join(repoRoot, 'app/api/checkout/session/route.ts'),
      'utf8',
    );
    const stripeWebhook = fs.readFileSync(
      path.join(repoRoot, 'app/api/webhooks/stripe/route.ts'),
      'utf8',
    );
    const legacyStripeWebhook = fs.readFileSync(
      path.join(repoRoot, 'app/api/stripe/webhook/route.ts'),
      'utf8',
    );

    expect(v1Session).toContain("resolveCatalogProvider(product) !== 'printify'");
    expect(legacySession).toContain("resolveCatalogProvider(product) !== 'printify'");
    expect(stripeWebhook).toContain('unsupported-provider-fulfillment-skipped');
    expect(legacyStripeWebhook).toContain(
      'Skipping Printify order creation for unsupported provider order',
    );
  });
});
