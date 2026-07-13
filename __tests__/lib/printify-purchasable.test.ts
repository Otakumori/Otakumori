import { describe, expect, it } from 'vitest';
import { validateLoadedPrintifyPurchasableLineItem } from '@/lib/checkout/printifyPurchasable';

function product(overrides: Record<string, unknown> = {}) {
  return {
    id: 'product_1',
    name: 'Printify Tee',
    description: null,
    primaryImageUrl: 'https://cdn.example.com/tee.png',
    active: true,
    visible: true,
    printifyProductId: 'printify_product_1',
    integrationRef: 'printify:printify_product_1',
    ProductVariant: [
      {
        id: 'variant_1',
        productId: 'product_1',
        title: 'Small',
        sku: 'TEE-S',
        isEnabled: true,
        inStock: true,
        priceCents: 2500,
        currency: 'USD',
        printifyVariantId: 101,
        providerVariantId: '101',
      },
    ],
    ...overrides,
  } as any;
}

describe('Printify purchasable line item validation', () => {
  it('accepts active visible Printify products with mapped enabled variants', () => {
    const result = validateLoadedPrintifyPurchasableLineItem(product(), 'variant_1');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.item.printifyProductId).toBe('printify_product_1');
      expect(result.item.printifyVariantId).toBe(101);
      expect(result.item.priceCents).toBe(2500);
    }
  });

  it.each([
    ['hidden product', { visible: false }, 'PRODUCT_NOT_PUBLIC'],
    ['inactive product', { active: false }, 'PRODUCT_NOT_PUBLIC'],
    [
      'Merchize product',
      { printifyProductId: null, integrationRef: 'merchize:mz_1' },
      'UNSUPPORTED_PROVIDER',
    ],
    [
      'missing Printify product mapping',
      { printifyProductId: null, integrationRef: 'printify:printify_product_1' },
      'MISSING_PRINTIFY_PRODUCT_ID',
    ],
  ])('rejects %s', (_label, overrides, code) => {
    const result = validateLoadedPrintifyPurchasableLineItem(product(overrides), 'variant_1');

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe(code);
  });

  it.each([
    ['disabled variant', { isEnabled: false }, 'VARIANT_NOT_AVAILABLE'],
    ['out-of-stock variant', { inStock: false }, 'VARIANT_NOT_AVAILABLE'],
    [
      'missing Printify variant mapping',
      { printifyVariantId: null },
      'MISSING_PRINTIFY_VARIANT_ID',
    ],
    ['missing price', { priceCents: null }, 'MISSING_PRICE'],
  ])('rejects %s', (_label, variantOverrides, code) => {
    const base = product();
    base.ProductVariant[0] = { ...base.ProductVariant[0], ...variantOverrides };
    const result = validateLoadedPrintifyPurchasableLineItem(base, 'variant_1');

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe(code);
  });
});
