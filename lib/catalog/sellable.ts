import type { CatalogProduct } from '@/lib/catalog/serialize';

export type CatalogVariant = CatalogProduct['variants'][number];

export type SellableCatalogItem = Omit<CatalogProduct, 'image' | 'variants'> & {
  image: string;
  variants: [CatalogVariant, ...CatalogVariant[]];
};

function hasRenderableImage(product: CatalogProduct): product is CatalogProduct & { image: string } {
  return Boolean((product.image ?? product.images?.[0] ?? '').trim());
}

function hasCatalogPrice(product: CatalogProduct) {
  return typeof product.price === 'number' || typeof product.priceCents === 'number' || typeof product.priceRange?.min === 'number';
}

function getSellableVariants(product: CatalogProduct): CatalogVariant[] {
  return (product.variants ?? []).filter((variant) => variant.isEnabled && variant.inStock);
}

export function toSellableCatalogItem(product: CatalogProduct): SellableCatalogItem | null {
  if (!hasCatalogPrice(product) || !hasRenderableImage(product)) return null;

  const variants = getSellableVariants(product);
  const [firstVariant, ...remainingVariants] = variants;
  if (!firstVariant) return null;

  return {
    ...product,
    image: product.image ?? product.images[0] ?? '',
    available: true,
    variants: [firstVariant, ...remainingVariants],
  };
}

export function getSellableCatalogItems(products: CatalogProduct[]): SellableCatalogItem[] {
  return products
    .map(toSellableCatalogItem)
    .filter((product): product is SellableCatalogItem => product !== null);
}
