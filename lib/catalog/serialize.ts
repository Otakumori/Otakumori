import type { Product, ProductVariant, ProductImage } from '@prisma/client';
import { createProductSlug } from '@/lib/catalog/mapPrintify';

type ProductWithRelations = Product & {
  ProductVariant: ProductVariant[];
  ProductImage: ProductImage[];
};

type OptionValue = {
  option?: string;
  value?: string;
  colors?: string[];
};

export interface CatalogProduct {
  id: string;
  title: string;
  slug: string;
  description: string;
  image: string | null;
  images: string[];
  tags: string[];
  category: string | null;
  categorySlug: string | null;
  price: number | null;
  priceCents: number | null;
  priceRange: { min: number | null; max: number | null };
  available: boolean;
  visible: boolean;
  active: boolean;
  isLocked?: boolean; // Printify "Publishing" status
  variants: Array<{
    id: string;
    title: string | null;
    sku: string | null;
    price: number | null;
    priceCents: number | null;
    inStock: boolean;
    isEnabled: boolean;
    printifyVariantId: number;
    optionValues: OptionValue[];
    previewImageUrl: string | null;
  }>;
  integrationRef: string | null;
  printifyProductId: string | null;
  blueprintId: number | null;
  printProviderId: number | null;
  lastSyncedAt: string | null;
}

function centsToDollars(value: number | null | undefined): number | null {
  if (typeof value !== 'number') return null;
  return Math.round(value) / 100;
}

function computePriceRange(variants: ProductVariant[]): { min: number | null; max: number | null } {
  const prices = variants
    .map((variant) => variant.priceCents)
    .filter((price): price is number => typeof price === 'number' && price > 0);

  if (prices.length === 0) {
    return { min: null, max: null };
  }

  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return { min: Math.round(min), max: Math.round(max) };
}

function resolvePrimaryImage(product: ProductWithRelations): string | null {
  if (product.primaryImageUrl) {
    return product.primaryImageUrl;
  }

  const defaultImage = product.ProductImage.find((image) => image.isDefault);
  if (defaultImage) {
    return defaultImage.url;
  }

  return product.ProductImage[0]?.url ?? null;
}

function coerceOptionValues(value: unknown): OptionValue[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.filter((entry) => entry && typeof entry === 'object') as OptionValue[];
  }
  if (typeof value === 'object') {
    return [value as OptionValue];
  }
  return [];
}

export function serializeProduct(product: ProductWithRelations): CatalogProduct {
  const priceRange = computePriceRange(product.ProductVariant);
  const slugSource = product.printifyProductId ?? product.id;

  // Extract is_locked from specs JSON if it exists
  const specs = (product.specs as any) ?? {};
  const isLocked = specs.is_locked ?? false;

  return {
    id: product.id,
    title: product.name,
    slug: createProductSlug(product.name, slugSource),
    description: product.description ?? '',
    image: resolvePrimaryImage(product),
    images: product.ProductImage.map((image) => image.url),
    tags: product.tags ?? [],
    category: product.category ?? null,
    categorySlug: product.categorySlug ?? null,
    price: centsToDollars(priceRange.min),
    priceCents: priceRange.min,
    priceRange,
    available: product.ProductVariant.some((variant) => variant.isEnabled && variant.inStock),
    visible: product.visible ?? true,
    active: product.active ?? true,
    isLocked,
    variants: product.ProductVariant.map((variant) => ({
      id: variant.id,
      title: variant.title ?? null,
      sku: variant.sku ?? null,
      price: centsToDollars(variant.priceCents ?? null),
      priceCents: variant.priceCents ?? null,
      inStock: variant.inStock,
      isEnabled: variant.isEnabled,
      printifyVariantId: variant.printifyVariantId,
      optionValues: coerceOptionValues(variant.optionValues),
      previewImageUrl: variant.previewImageUrl,
    })),
    integrationRef: product.integrationRef ?? null,
    printifyProductId: product.printifyProductId ?? null,
    blueprintId: product.blueprintId ?? null,
    printProviderId: product.printProviderId ?? null,
    lastSyncedAt: product.lastSyncedAt ? product.lastSyncedAt.toISOString() : null,
  };
}
