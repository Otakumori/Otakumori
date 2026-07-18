import { auth, currentUser } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { db } from '@/app/lib/db';
import {
  buildMerchizeImportPreflightForProducts,
  buildMerchizeHiddenImportManifestForProducts,
  MERCHIZE_HIDDEN_IMPORT_MANIFEST_VERSION,
  verifyMerchizeImportPreflightSignature,
} from '@/app/lib/merchize/importPreflight';
import { getMerchizeService } from '@/app/lib/merchize/service';
import { limitApi } from '@/lib/ratelimit';

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
  currentUser: vi.fn(),
}));

vi.mock('@/app/lib/db', () => ({
  db: {
    product: {
      findMany: vi.fn(),
      upsert: vi.fn(),
    },
    productVariant: {
      findMany: vi.fn(),
      upsert: vi.fn(),
      updateMany: vi.fn(),
    },
    productImage: {
      upsert: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock('@/app/lib/merchize/service', () => ({
  getMerchizeService: vi.fn(),
}));

vi.mock('@/lib/ratelimit', () => ({
  limitApi: vi.fn(),
}));

vi.mock('@/app/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/env.mjs', () => ({
  env: {
    UPSTASH_REDIS_REST_URL: '',
    UPSTASH_REDIS_REST_TOKEN: '',
  },
}));

vi.mock('@/env/server', () => ({
  env: {
    get AUTH_SECRET() {
      return process.env.AUTH_SECRET;
    },
    get CLERK_SECRET_KEY() {
      return process.env.CLERK_SECRET_KEY;
    },
  },
}));

function adminSession() {
  vi.mocked(auth).mockResolvedValue({
    userId: 'admin_123',
    sessionClaims: { metadata: { role: 'admin' } },
  } as never);
  vi.mocked(currentUser).mockResolvedValue({
    id: 'admin_123',
    primaryEmailAddress: { emailAddress: 'admin@example.com' },
    emailAddresses: [],
  } as never);
}

function nonAdminSession() {
  vi.mocked(auth).mockResolvedValue({
    userId: 'user_123',
    sessionClaims: { metadata: { role: 'viewer' }, role: 'authenticated' },
  } as never);
}

function noSession() {
  vi.mocked(auth).mockResolvedValue({ userId: null } as never);
}

function merchizeProduct(overrides: Record<string, unknown> = {}) {
  return {
    provider: 'merchize',
    providerProductId: 'mz-product-1',
    id: 'mz-product-1',
    title: 'Merchize Tee',
    description: 'A hidden import candidate',
    sku: 'MZ-TEE',
    handle: 'merchize-tee',
    status: 'active',
    currency: 'USD',
    price: 25,
    priceRange: { min: 25, max: 29, currency: 'USD' },
    images: [{ url: 'https://cdn.example.com/merchize-tee.png' }],
    variants: [
      {
        provider: 'merchize',
        providerVariantId: 'MZ-VARIANT-1',
        sku: 'MZ-TEE-S',
        title: 'Small',
        options: [{ option: 'Size', value: 'S' }],
        price: 25,
        currency: 'USD',
        inStock: true,
        availability: 'available',
        printifyVariantId: null,
      },
    ],
    variantCount: 1,
    pricedVariantCount: 1,
    imageCount: 1,
    warnings: [],
    importReadiness: { ready: true, issues: [] },
    ...overrides,
  };
}

function serviceMock(products = [merchizeProduct()], overrides: Record<string, unknown> = {}) {
  return {
    getProducts: vi.fn().mockResolvedValue(products),
    createProduct: vi.fn(),
    updateProduct: vi.fn(),
    deleteProduct: vi.fn(),
    ...overrides,
  };
}

async function preflightRoute() {
  return import('../../app/api/admin/merchize/import/preflight/route');
}

async function callGET(mod: Record<string, unknown>) {
  const handler = mod.GET as (request: NextRequest) => Promise<Response>;
  const response = await handler(
    new NextRequest('http://localhost/api/admin/merchize/import/preflight'),
  );
  return { response, json: await response.json() };
}

describe('Merchize import preflight route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    adminSession();
    vi.mocked(limitApi).mockResolvedValue({
      success: true,
      limit: 20,
      remaining: 19,
      reset: Date.now() + 60_000,
    } as never);
    vi.mocked(db.product.findMany).mockResolvedValue([]);
    vi.mocked(db.productVariant.findMany).mockResolvedValue([]);
    vi.mocked(getMerchizeService).mockReturnValue(serviceMock() as never);
    process.env.AUTH_SECRET = 'vitest-preflight-signing-secret';
    delete process.env.CLERK_SECRET_KEY;
  });

  it('requires authentication', async () => {
    noSession();

    const { response, json } = await callGET(await preflightRoute());

    expect(response.status).toBe(401);
    expect(json.error).toBe('AUTH_REQUIRED');
  });

  it('requires admin authorization', async () => {
    nonAdminSession();

    const { response, json } = await callGET(await preflightRoute());

    expect(response.status).toBe(403);
    expect(json.error).toBe('FORBIDDEN');
  });

  it('returns dry-run counts for new Merchize products without DB writes', async () => {
    const service = serviceMock();
    vi.mocked(getMerchizeService).mockReturnValue(service as never);

    const { response, json } = await callGET(await preflightRoute());

    expect(response.status).toBe(200);
    expect(json.data).toMatchObject({
      provider: 'merchize',
      mode: 'import_preflight',
      manifestVersion: MERCHIZE_HIDDEN_IMPORT_MANIFEST_VERSION,
      productCount: 1,
      wouldInsert: 1,
      wouldUpdate: 0,
      wouldSkip: 0,
      wouldBlock: 0,
      safeToImport: true,
    });
    expect(json.data.preflightFingerprint).toMatch(/^[a-f0-9]{64}$/);
    expect(Date.parse(json.data.fingerprintExpiresAt)).toBeGreaterThan(Date.now());
    expect(json.data.preflightSignature).toMatch(/^[a-f0-9]{64}$/);
    expect(json.data.products[0]).toMatchObject({
      provider: 'merchize',
      providerProductId: 'mz-product-1',
      integrationRef: 'merchize:mz-product-1',
      action: 'inserted',
      public: false,
      purchasable: false,
    });
    expect(json.data.products[0].variants[0]).toMatchObject({
      provider: 'merchize',
      providerVariantId: 'MZ-VARIANT-1',
      printifyVariantId: null,
    });
    expect(service.getProducts).toHaveBeenCalledWith({ limit: 51, page: 1 });
    expect(db.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { integrationRef: { in: ['merchize:mz-product-1'] } },
      }),
    );
    expect(db.productVariant.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { providerVariantId: { in: ['MZ-VARIANT-1'] } },
      }),
    );
    expect(db.product.upsert).not.toHaveBeenCalled();
    expect(db.productVariant.upsert).not.toHaveBeenCalled();
    expect(db.productImage.upsert).not.toHaveBeenCalled();
    expect(db.$transaction).not.toHaveBeenCalled();
    expect(JSON.stringify(json)).not.toContain('raw');
    expect(JSON.stringify(json)).not.toContain('printifyProductId');
  });

  it('calculates wouldUpdate for existing merchize integration references', async () => {
    vi.mocked(db.product.findMany).mockResolvedValue([
      { id: 'product_1', integrationRef: 'merchize:mz-product-1' },
    ] as never);

    const { response, json } = await callGET(await preflightRoute());

    expect(response.status).toBe(200);
    expect(json.data.wouldInsert).toBe(0);
    expect(json.data.wouldUpdate).toBe(1);
    expect(json.data.products[0].action).toBe('updated');
  });

  it('blocks invalid products and duplicate provider identities', async () => {
    vi.mocked(getMerchizeService).mockReturnValue(
      serviceMock([
        merchizeProduct({ providerProductId: 'dup', id: 'dup' }),
        merchizeProduct({
          providerProductId: 'dup',
          id: 'dup',
          images: [],
          imageCount: 0,
          variants: [],
          variantCount: 0,
          pricedVariantCount: 0,
          warnings: ['product_missing_images', 'product_missing_variants', 'product_missing_price'],
          importReadiness: {
            ready: false,
            issues: ['product_missing_images', 'product_missing_variants', 'product_missing_price'],
          },
        }),
      ]) as never,
    );

    const { response, json } = await callGET(await preflightRoute());

    expect(response.status).toBe(200);
    expect(json.data.safeToImport).toBe(false);
    expect(json.data.wouldBlock).toBe(2);
    expect(JSON.stringify(json.data.issues)).toContain('duplicate_merchize_product_ids');
    expect(JSON.stringify(json.data.issues)).toContain('product_missing_images');
  });

  it('blocks duplicate provider variant IDs within a product', async () => {
    const duplicateVariant = {
      provider: 'merchize',
      providerVariantId: 'DUP-VARIANT',
      sku: 'DUP-1',
      title: 'Duplicate',
      options: [],
      price: 20,
      currency: 'USD',
      inStock: true,
      availability: 'available',
      printifyVariantId: null,
    };
    vi.mocked(getMerchizeService).mockReturnValue(
      serviceMock([
        merchizeProduct({
          variants: [duplicateVariant, { ...duplicateVariant, sku: 'DUP-2' }],
          variantCount: 2,
          pricedVariantCount: 2,
        }),
      ]) as never,
    );

    const { response, json } = await callGET(await preflightRoute());

    expect(response.status).toBe(200);
    expect(json.data.safeToImport).toBe(false);
    expect(JSON.stringify(json.data.issues)).toContain('duplicate_merchize_variant_ids');
  });

  it('generates deterministic fingerprints for the same normalized source data', async () => {
    const first = await callGET(await preflightRoute());
    const second = await callGET(await preflightRoute());

    expect(first.response.status).toBe(200);
    expect(second.response.status).toBe(200);
    expect(first.json.data.preflightFingerprint).toBe(second.json.data.preflightFingerprint);
  });

  it('blocks invalid prices, SKUs, unsupported options, and Printify-owned identity conflicts', async () => {
    vi.mocked(db.product.findMany)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ printifyProductId: 'printify-product-1' }] as never);
    vi.mocked(db.productVariant.findMany).mockResolvedValue([
      {
        providerVariantId: '101',
        Product: {
          integrationRef: 'printify:printify-product-1',
          printifyProductId: 'printify-product-1',
        },
      },
    ] as never);
    vi.mocked(getMerchizeService).mockReturnValue(
      serviceMock([
        merchizeProduct({
          providerProductId: 'printify-product-1',
          variants: [
            {
              provider: 'merchize',
              providerVariantId: '101',
              sku: 'bad<>sku',
              title: 'Conflicting Variant',
              options: [
                { option: 'Size', value: 'S' },
                { option: 'size', value: 'Small' },
              ],
              price: 0,
              currency: 'USD',
              inStock: true,
              availability: 'available',
              printifyVariantId: null,
            },
          ],
        }),
      ]) as never,
    );

    const { response, json } = await callGET(await preflightRoute());

    expect(response.status).toBe(200);
    expect(json.data.safeToImport).toBe(false);
    expect(JSON.stringify(json.data.issues)).toContain('variant_invalid_price');
    expect(JSON.stringify(json.data.issues)).toContain('invalid_sku');
    expect(JSON.stringify(json.data.issues)).toContain('unsupported_option_combination');
    expect(JSON.stringify(json.data.issues)).toContain(
      'provider_product_id_conflicts_with_printify',
    );
    expect(JSON.stringify(json.data.issues)).toContain(
      'provider_variant_id_conflicts_with_printify',
    );
  });

  it('blocks overlong mutation-relevant product and variant fields without truncating identities', async () => {
    const overlongProductId = `${'p'.repeat(200)}A`;
    const overlongVariantId = `${'v'.repeat(200)}A`;
    const preflight = await buildMerchizeImportPreflightForProducts([
      merchizeProduct({
        providerProductId: overlongProductId,
        id: overlongProductId,
        title: 'T'.repeat(241),
        description: 'D'.repeat(4001),
        sku: 'S'.repeat(121),
        handle: 'h'.repeat(201),
        status: 's'.repeat(81),
        currency: 'C'.repeat(9),
        priceRange: { min: 25, max: 25, currency: 'R'.repeat(9) },
        variants: [
          {
            ...merchizeProduct().variants[0],
            providerVariantId: overlongVariantId,
            title: 'V'.repeat(241),
            sku: 'K'.repeat(121),
            currency: 'Z'.repeat(9),
            options: [{ option: 'O'.repeat(81), value: 'Value' }],
          },
        ],
      }),
    ] as never);

    expect(preflight.safeToImport).toBe(false);
    expect(preflight.wouldBlock).toBe(1);
    expect(JSON.stringify(preflight.issues)).toContain('field_length_exceeded');
    expect(preflight.products[0].providerProductId).toBe(overlongProductId);
    expect(preflight.products[0].integrationRef).toBe('');
    expect(preflight.products[0].variants).toHaveLength(0);

    const manifest = await buildMerchizeHiddenImportManifestForProducts([
      merchizeProduct({
        providerProductId: 'mz-product-1',
        variants: [
          {
            ...merchizeProduct().variants[0],
            providerVariantId: `${'x'.repeat(200)}A`,
          },
          {
            ...merchizeProduct().variants[0],
            providerVariantId: `${'x'.repeat(200)}B`,
            sku: 'MZ-TEE-M',
          },
        ],
        variantCount: 2,
        pricedVariantCount: 2,
      }),
    ] as never);

    expect(manifest.safeToImport).toBe(false);
    expect(manifest.products[0].variants).toHaveLength(0);
    expect(manifest.products[0].issues).toContain('field_length_exceeded');
    expect(JSON.stringify(manifest)).not.toContain(`${'x'.repeat(200)}A`.slice(0, 200));
  });

  it('blocks option overflow instead of silently truncating provider options', async () => {
    const thirteenOptions = Array.from({ length: 13 }, (_, index) => ({
      option: `Option ${index + 1}`,
      value: `Value ${index + 1}`,
    }));
    const tooManyVariantOptions = await buildMerchizeImportPreflightForProducts([
      merchizeProduct({
        variants: [
          {
            ...merchizeProduct().variants[0],
            options: thirteenOptions,
          },
        ],
      }),
    ] as never);

    expect(tooManyVariantOptions.safeToImport).toBe(false);
    expect(JSON.stringify(tooManyVariantOptions.issues)).toContain(
      'unsupported_option_combination',
    );

    const variants = Array.from({ length: 11 }, (_, variantIndex) => ({
      ...merchizeProduct().variants[0],
      providerVariantId: `MZ-VARIANT-${variantIndex + 1}`,
      sku: `MZ-TEE-${variantIndex + 1}`,
      options: Array.from({ length: 12 }, (_, optionIndex) => ({
        option: `Option ${variantIndex + 1}-${optionIndex + 1}`,
        value: `Value ${variantIndex + 1}-${optionIndex + 1}`,
      })),
    }));
    const tooManyProductOptions = await buildMerchizeImportPreflightForProducts([
      merchizeProduct({
        variants,
        variantCount: variants.length,
        pricedVariantCount: variants.length,
      }),
    ] as never);

    expect(tooManyProductOptions.safeToImport).toBe(false);
    expect(JSON.stringify(tooManyProductOptions.issues)).toContain('product_too_many_options');
  });

  it('allows boundary-length mutation fields at the exact configured limits', async () => {
    const options = Array.from({ length: 12 }, (_, index) => ({
      option: `O${String(index + 1).padStart(2, '0')}${'N'.repeat(77)}`,
      value: `V${String(index + 1).padStart(2, '0')}${'A'.repeat(77)}`,
    }));
    const preflight = await buildMerchizeImportPreflightForProducts([
      merchizeProduct({
        providerProductId: 'P'.repeat(200),
        id: 'P'.repeat(200),
        title: 'T'.repeat(240),
        description: 'D'.repeat(4000),
        sku: 'S'.repeat(120),
        handle: 'h'.repeat(200),
        status: 's'.repeat(80),
        currency: 'USDTEST1',
        priceRange: { min: 25, max: 25, currency: 'USDTEST1' },
        images: [{ url: `https://cdn.example.com/${'i'.repeat(1972)}` }],
        variants: [
          {
            ...merchizeProduct().variants[0],
            providerVariantId: 'V'.repeat(200),
            title: 'R'.repeat(240),
            sku: 'K'.repeat(120),
            currency: 'USDTEST1',
            options,
          },
        ],
      }),
    ] as never);

    expect(preflight.safeToImport).toBe(true);
    expect(JSON.stringify(preflight.issues)).not.toContain('field_length_exceeded');
    expect(preflight.products[0].integrationRef).toBe(`merchize:${'P'.repeat(200)}`);
  });

  it('blocks existing Merchize refs with Printify ownership instead of updating or clearing ownership', async () => {
    vi.mocked(db.product.findMany)
      .mockResolvedValueOnce([
        {
          id: 'conflicting_product',
          integrationRef: 'merchize:mz-product-1',
          printifyProductId: 'printify-product-1',
        },
      ] as never)
      .mockResolvedValueOnce([] as never);
    vi.mocked(db.productVariant.findMany).mockResolvedValue([] as never);

    const preflight = await buildMerchizeImportPreflightForProducts([merchizeProduct() as never]);

    expect(preflight.safeToImport).toBe(false);
    expect(preflight.wouldUpdate).toBe(0);
    expect(preflight.wouldBlock).toBe(1);
    expect(preflight.products[0].action).toBe('blocked');
    expect(JSON.stringify(preflight.issues)).toContain('provider_product_ownership_conflict');
  });

  it('sanitizes provider errors', async () => {
    vi.mocked(getMerchizeService).mockReturnValue(
      serviceMock([], {
        getProducts: vi.fn().mockRejectedValue(new Error('token=secret provider payload')),
      }) as never,
    );

    const { response, json } = await callGET(await preflightRoute());

    expect(response.status).toBe(502);
    expect(json.error.message).toBe(
      'Merchize import preflight failed. Check provider configuration and logs with the request ID.',
    );
    expect(JSON.stringify(json)).not.toContain('token=secret');
  });

  it('changes the fingerprint when mutation-relevant product or variant fields change', async () => {
    const base = merchizeProduct({
      images: [
        { url: 'https://cdn.example.com/primary.png' },
        { url: 'https://cdn.example.com/secondary.png?size=large' },
      ],
      imageCount: 2,
    });
    const baseline = await buildMerchizeImportPreflightForProducts([base as never]);
    const changedProducts = [
      merchizeProduct({ description: 'Changed description' }),
      merchizeProduct({ handle: 'changed-handle' }),
      merchizeProduct({ status: 'draft' }),
      merchizeProduct({ sku: 'MZ-TEE-CHANGED' }),
      merchizeProduct({ providerProductId: 'mz-product-2', id: 'mz-product-2' }),
      merchizeProduct({
        images: [
          { url: 'https://cdn.example.com/changed-primary.png' },
          { url: 'https://cdn.example.com/secondary.png?size=large' },
        ],
        imageCount: 2,
      }),
      merchizeProduct({
        images: [
          { url: 'https://cdn.example.com/primary.png' },
          { url: 'https://cdn.example.com/changed-secondary.png' },
        ],
        imageCount: 2,
      }),
      merchizeProduct({
        images: [
          { url: 'https://cdn.example.com/secondary.png?size=large' },
          { url: 'https://cdn.example.com/primary.png' },
        ],
        imageCount: 2,
      }),
      merchizeProduct({ variants: [{ ...base.variants[0], title: 'Changed title' }] }),
      merchizeProduct({ variants: [{ ...base.variants[0], sku: 'MZ-TEE-CHANGED-VARIANT' }] }),
      merchizeProduct({
        variants: [{ ...base.variants[0], options: [{ option: 'Size', value: 'M' }] }],
      }),
      merchizeProduct({ variants: [{ ...base.variants[0], price: 27 }] }),
      merchizeProduct({ variants: [{ ...base.variants[0], price: 25.01 }] }),
      merchizeProduct({ variants: [{ ...base.variants[0], currency: 'CAD' }] }),
      merchizeProduct({ variants: [{ ...base.variants[0], inStock: false }] }),
      merchizeProduct({
        variants: [{ ...base.variants[0], providerVariantId: 'MZ-VARIANT-2' }],
      }),
    ];

    for (const changed of changedProducts) {
      const changedPreflight = await buildMerchizeImportPreflightForProducts([changed as never]);
      expect(changedPreflight.preflightFingerprint).not.toBe(baseline.preflightFingerprint);
    }
  });

  it('changes the fingerprint when planned action changes from insert to update', async () => {
    const insert = await buildMerchizeImportPreflightForProducts([merchizeProduct() as never]);
    vi.mocked(db.product.findMany)
      .mockResolvedValueOnce([
        {
          id: 'existing_product',
          integrationRef: 'merchize:mz-product-1',
          printifyProductId: null,
        },
      ] as never)
      .mockResolvedValueOnce([]);

    const update = await buildMerchizeImportPreflightForProducts([merchizeProduct() as never]);

    expect(update.wouldUpdate).toBe(1);
    expect(update.preflightFingerprint).not.toBe(insert.preflightFingerprint);
  });

  it('hashes the complete manifest beyond the bounded public product summary', async () => {
    const products = Array.from({ length: 30 }, (_, index) =>
      merchizeProduct({
        providerProductId: `mz-product-${index + 1}`,
        id: `mz-product-${index + 1}`,
        title: `Merchize Tee ${index + 1}`,
        variants: [
          {
            ...merchizeProduct().variants[0],
            providerVariantId: `MZ-VARIANT-${index + 1}`,
            sku: `MZ-TEE-${index + 1}`,
          },
        ],
      }),
    );
    const baseline = await buildMerchizeImportPreflightForProducts(products as never);
    const changed = products.map((product, index) =>
      index === 25 ? { ...product, description: 'Changed product 26' } : product,
    );

    const changedPreflight = await buildMerchizeImportPreflightForProducts(changed as never);

    expect(baseline.products).toHaveLength(25);
    expect(changedPreflight.preflightFingerprint).not.toBe(baseline.preflightFingerprint);
  });

  it('hashes complete variants beyond the bounded public variant summary', async () => {
    const variants = Array.from({ length: 25 }, (_, index) => ({
      ...merchizeProduct().variants[0],
      providerVariantId: `MZ-VARIANT-${index + 1}`,
      sku: `MZ-TEE-${index + 1}`,
      title: `Variant ${index + 1}`,
      price: 25 + index,
    }));
    const baseline = await buildMerchizeImportPreflightForProducts([
      merchizeProduct({
        variants,
        variantCount: variants.length,
        pricedVariantCount: variants.length,
      }),
    ] as never);
    const changedVariants = variants.map((variant, index) =>
      index === 20 ? { ...variant, title: 'Changed variant 21' } : variant,
    );

    const changedPreflight = await buildMerchizeImportPreflightForProducts([
      merchizeProduct({
        variants: changedVariants,
        variantCount: changedVariants.length,
        pricedVariantCount: changedVariants.length,
      }),
    ] as never);

    expect(baseline.products[0].variants).toHaveLength(20);
    expect(changedPreflight.preflightFingerprint).not.toBe(baseline.preflightFingerprint);
  });

  it('blocks unsafe image URLs and canonicalizes duplicate safe image URLs deterministically', async () => {
    const unsafe = await buildMerchizeImportPreflightForProducts([
      merchizeProduct({
        images: [
          { url: 'https://cdn.example.com/valid.png?token=not-a-secret' },
          { url: 'javascript:alert(1)' },
        ],
        imageCount: 2,
      }),
    ] as never);
    expect(unsafe.safeToImport).toBe(false);
    expect(JSON.stringify(unsafe.issues)).toContain('product_unsafe_image_url');

    const deduped = await buildMerchizeImportPreflightForProducts([
      merchizeProduct({
        images: [
          { url: 'https://cdn.example.com/valid.png?width=100' },
          { url: 'https://cdn.example.com/valid.png?width=100' },
        ],
        imageCount: 2,
      }),
    ] as never);
    expect(deduped.safeToImport).toBe(true);
    expect(deduped.products[0].imageCount).toBe(1);
  });

  it('blocks provider catalogs larger than the complete import limit', async () => {
    const products = Array.from({ length: 51 }, (_, index) =>
      merchizeProduct({
        providerProductId: `mz-product-${index + 1}`,
        id: `mz-product-${index + 1}`,
        title: `Merchize Tee ${index + 1}`,
        variants: [
          {
            ...merchizeProduct().variants[0],
            providerVariantId: `MZ-VARIANT-${index + 1}`,
            sku: `MZ-TEE-${index + 1}`,
          },
        ],
      }),
    );

    const preflight = await buildMerchizeImportPreflightForProducts(products as never);

    expect(preflight.safeToImport).toBe(false);
    expect(preflight.productCount).toBe(51);
    expect(preflight.wouldInsert).toBe(0);
    expect(preflight.wouldBlock).toBe(51);
    expect(JSON.stringify(preflight.issues)).toContain('provider_catalog_too_large');
  });

  it('fails closed for malformed signatures, altered signed state, and missing signing secrets', async () => {
    const preflight = await buildMerchizeImportPreflightForProducts([merchizeProduct() as never]);

    for (const input of [
      {
        ...preflight,
        preflightFingerprint: `0${preflight.preflightFingerprint.slice(1)}`,
      },
      { ...preflight, fingerprintExpiresAt: '2030-01-01T00:00:00.000Z' },
      { ...preflight, manifestVersion: 'wrong-version' },
      { ...preflight, preflightSignature: 'not-hex' },
      { ...preflight, preflightSignature: preflight.preflightSignature.slice(0, 62) },
    ]) {
      expect(
        verifyMerchizeImportPreflightSignature({
          manifestVersion: input.manifestVersion,
          provider: 'merchize',
          mode: 'hidden_local_import',
          preflightFingerprint: input.preflightFingerprint,
          fingerprintExpiresAt: input.fingerprintExpiresAt,
          preflightSignature: input.preflightSignature,
        }),
      ).toBe(false);
    }

    delete process.env.AUTH_SECRET;
    await expect(
      buildMerchizeImportPreflightForProducts([merchizeProduct() as never]),
    ).rejects.toThrow('signing secret');
  });

  it('blocks fallback identities and does not match by title, slug, handle, or SKU similarity', async () => {
    const synthesized = await buildMerchizeImportPreflightForProducts([
      merchizeProduct({
        providerProductId: 'merchize-1',
        providerProductIdSource: 'generated',
      }),
    ] as never);
    expect(JSON.stringify(synthesized.issues)).toContain('product_provider_id_not_stable');

    const skuVariant = await buildMerchizeImportPreflightForProducts([
      merchizeProduct({
        variants: [
          {
            ...merchizeProduct().variants[0],
            providerVariantId: 'SKU-ONLY-ID',
            providerVariantIdSource: 'sku_fallback',
            sku: 'SKU-ONLY-ID',
          },
        ],
      }),
    ] as never);
    expect(JSON.stringify(skuVariant.issues)).toContain('variant_id_not_stable');

    const sameDisplayDifferentProviderId = await buildMerchizeImportPreflightForProducts([
      merchizeProduct({
        providerProductId: 'different-provider-id',
        title: 'Minimal Cleavage Code Tee',
        handle: 'minimal-cleavage-code-tee',
        sku: 'MZ-TEE',
      }),
    ] as never);
    expect(sameDisplayDifferentProviderId.wouldInsert).toBe(1);
    expect(sameDisplayDifferentProviderId.wouldUpdate).toBe(0);
  });
});
