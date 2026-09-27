import type { CatalogProduct } from './serialize';

function isRenderablePublicImage(url: string | null | undefined): url is string {
  if (!url || typeof url !== 'string') return false;

  const normalized = url.trim().toLowerCase();
  if (!normalized) return false;
  if (normalized.includes('seller.merchize.com/login')) return false;
  if (normalized.includes('drive.google.com/drive/folders')) return false;
  if (normalized.includes('drive.google.com/drive/u/')) return false;
  if (normalized.includes('docs.google.com')) return false;
  if (normalized.includes('placeholder') || normalized.includes('seed:')) return false;
  if (normalized.startsWith('/')) return true;
  if (normalized.includes('images-api.printify.com')) return true;
  return /\.(png|jpe?g|webp|gif|avif)(\?|$)/i.test(normalized);
}

export type PublicCatalogProductOptions = {
  /** CI's deterministic fallback is intentionally not a provider-backed product. */
  allowTestFallback?: boolean;
};

/**
 * Produces the only product shape public commerce routes may expose. Both the
 * catalogue and PDP use this boundary so direct PDP requests cannot bypass
 * visibility, supported-provider, image, or purchasable-variant rules.
 */
export function toPublicCatalogProduct(
  product: CatalogProduct,
  { allowTestFallback = false }: PublicCatalogProductOptions = {},
): CatalogProduct | null {
  if (!product.active || !product.visible) return null;
  if (product.provider !== 'printify' && !allowTestFallback) return null;

  const images = (product.images ?? [])
    .filter((image, index, values) => isRenderablePublicImage(image) && values.indexOf(image) === index)
    .slice(0, 2);
  const image = isRenderablePublicImage(product.image) ? product.image : (images[0] ?? null);
  const variants = (product.variants ?? [])
    .filter(
      (variant) =>
        variant.isEnabled &&
        variant.inStock &&
        typeof variant.priceCents === 'number' &&
        variant.priceCents > 0,
    )
    .slice(0, 12)
    .map((variant) => ({
      ...variant,
      optionValues: (variant.optionValues ?? []).slice(0, 6),
      previewImageUrl: isRenderablePublicImage(variant.previewImageUrl)
        ? variant.previewImageUrl
        : null,
    }));

  if (!image || variants.length === 0) return null;

  const priceCents = Math.min(...variants.map((variant) => variant.priceCents as number));
  const maxPriceCents = Math.max(...variants.map((variant) => variant.priceCents as number));

  return {
    ...product,
    image,
    images: [image, ...images.filter((candidate) => candidate !== image)].slice(0, 2),
    description: (product.description ?? '').slice(0, 400),
    price: priceCents / 100,
    priceCents,
    priceRange: { min: priceCents, max: maxPriceCents },
    available: true,
    variants,
  };
}
