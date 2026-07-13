import type { PrismaClient } from '@prisma/client';
import { db } from '@/lib/db';
import { resolveCatalogProvider } from '@/lib/catalog/provider';

type DbClient = Pick<PrismaClient, 'product'>;

type ProductWithVariants = Awaited<ReturnType<typeof loadProductForPurchase>>;

type ValidationInput = {
  productId: string;
  variantId: string;
};

export type PrintifyPurchasableLineItem = {
  productId: string;
  variantId: string;
  productName: string;
  productDescription: string | null;
  primaryImageUrl: string | null;
  sku: string | null;
  variantTitle: string | null;
  priceCents: number;
  currency: string;
  printifyProductId: string;
  printifyVariantId: number;
};

export type PrintifyPurchasableErrorCode =
  | 'PRODUCT_NOT_FOUND'
  | 'PRODUCT_NOT_PUBLIC'
  | 'UNSUPPORTED_PROVIDER'
  | 'MISSING_PRINTIFY_PRODUCT_ID'
  | 'VARIANT_NOT_FOUND'
  | 'VARIANT_NOT_AVAILABLE'
  | 'MISSING_PRINTIFY_VARIANT_ID'
  | 'MISSING_PRICE';

export type PrintifyPurchasableValidation =
  | { ok: true; item: PrintifyPurchasableLineItem }
  | { ok: false; status: number; code: PrintifyPurchasableErrorCode; message: string };

async function loadProductForPurchase(client: DbClient, productId: string) {
  return client.product.findUnique({
    where: { id: productId },
    include: { ProductVariant: true },
  });
}

function unavailable(code: PrintifyPurchasableErrorCode, message: string, status = 400) {
  return { ok: false as const, status, code, message };
}

export function validateLoadedPrintifyPurchasableLineItem(
  product: NonNullable<ProductWithVariants>,
  variantId: string,
): PrintifyPurchasableValidation {
  if (!product.active || !product.visible) {
    return unavailable('PRODUCT_NOT_PUBLIC', 'Product is not available for purchase', 404);
  }

  if (resolveCatalogProvider(product) !== 'printify') {
    return unavailable('UNSUPPORTED_PROVIDER', 'Only Printify products can be purchased');
  }

  if (!product.printifyProductId) {
    return unavailable('MISSING_PRINTIFY_PRODUCT_ID', 'Printify product mapping is missing');
  }

  const variant = product.ProductVariant.find((candidate) => candidate.id === variantId);
  if (!variant) {
    return unavailable('VARIANT_NOT_FOUND', 'Variant not found', 404);
  }

  if (!variant.isEnabled || !variant.inStock) {
    return unavailable('VARIANT_NOT_AVAILABLE', 'Variant is no longer available');
  }

  if (variant.printifyVariantId == null) {
    return unavailable('MISSING_PRINTIFY_VARIANT_ID', 'Printify variant mapping is missing');
  }

  if (variant.priceCents == null || variant.priceCents <= 0) {
    return unavailable('MISSING_PRICE', 'Variant price is missing');
  }

  return {
    ok: true,
    item: {
      productId: product.id,
      variantId: variant.id,
      productName: product.name,
      productDescription: product.description,
      primaryImageUrl: product.primaryImageUrl,
      sku: variant.sku,
      variantTitle: variant.title,
      priceCents: variant.priceCents,
      currency: variant.currency ?? 'USD',
      printifyProductId: product.printifyProductId,
      printifyVariantId: variant.printifyVariantId,
    },
  };
}

export async function validatePrintifyPurchasableLineItem(
  input: ValidationInput,
  client: DbClient = db,
): Promise<PrintifyPurchasableValidation> {
  const product = await loadProductForPurchase(client, input.productId);
  if (!product) {
    return unavailable('PRODUCT_NOT_FOUND', 'Product not found', 404);
  }

  return validateLoadedPrintifyPurchasableLineItem(product, input.variantId);
}
