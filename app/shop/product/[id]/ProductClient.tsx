'use client';

import { logger } from '@/app/lib/logger';
import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import NSFWAffirmNote from '@/components/NSFWAffirmNote';
import { t } from '@/lib/microcopy';
import { paths } from '@/lib/paths';
import type { CatalogProduct } from '@/lib/catalog/serialize';
import { ShareButtons } from '@/app/components/shop/ShareButtons';
import { useRecentlyViewed } from '@/app/hooks/useRecentlyViewed';
import { useToastContext } from '@/app/contexts/ToastContext';
import { removeHtmlTables, stripHtml } from '@/lib/html';
import { useCart } from '@/app/components/cart/CartProvider';
import { PetalDiscountBadge } from '@/app/components/shop/PetalDiscountBadge';
import { MoriButton } from '@/app/components/mori/MoriFoundation';
import { canOptimizeProductImage } from '@/app/components/shop/product-image';
import styles from '@/app/components/shop/commerce-composition.module.css';
import { productImageMode } from '@/app/components/shop/StorefrontProductCard';

type CatalogVariant = CatalogProduct['variants'][number];

function formatProductDescription(description: string | null | undefined): string[] {
  if (!description) return [];
  const withoutTables = removeHtmlTables(description);
  const normalized = withoutTables
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li)>/gi, '\n')
    .replace(/<\/ul>/gi, '\n')
    .replace(/<ul>/gi, '\n');
  const text = stripHtml(normalized);
  return text
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function resolveDisplayImage(
  product: CatalogProduct | null,
  variant: CatalogVariant | null,
): string | null {
  if (variant?.previewImageUrl && variant.previewImageUrl.trim()) {
    return variant.previewImageUrl;
  }
  if (product?.image && product.image.trim()) {
    return product.image;
  }
  const firstGallery = product?.images?.find((entry) => typeof entry === 'string' && entry.trim());
  return firstGallery ?? null;
}

export default function ProductClient({ productId }: { productId: string }) {
  const [product, setProduct] = useState<CatalogProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<CatalogVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addProduct } = useRecentlyViewed();
  const { success, error: showError } = useToastContext();
  const { addItem } = useCart();
  const descriptionParagraphs = useMemo(
    () => formatProductDescription(product?.description),
    [product?.description],
  );
  const displayImageUrl = useMemo(
    () => resolveDisplayImage(product, selectedVariant),
    [product, selectedVariant],
  );
  const variantAvailable = Boolean(selectedVariant?.isEnabled && selectedVariant?.inStock);

  useEffect(() => {
    let isCancelled = false;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/v1/products/${productId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch product: ${response.statusText}`);
        }
        const json = await response.json();

        if (isCancelled) return;

        if (!json.ok) {
          setError(json.error || 'Product not found');
          setLoading(false);
          return;
        }

        const catalogProduct = json?.data as CatalogProduct | undefined;
        if (!catalogProduct) {
          setError('Product not found');
          setLoading(false);
          return;
        }

        const normalizeImageValue = (value: unknown): string | null => {
          if (!value) return null;
          if (typeof value === 'string') return value;
          if (
            typeof value === 'object' &&
            value !== null &&
            'src' in (value as Record<string, unknown>)
          ) {
            const src = (value as Record<string, unknown>).src;
            return typeof src === 'string' ? src : null;
          }
          return null;
        };

        const normalizedImages = (catalogProduct.images ?? [])
          .map((entry) => normalizeImageValue(entry))
          .filter((entry): entry is string => typeof entry === 'string' && entry.length > 0);

        const normalizedProduct: CatalogProduct = {
          ...catalogProduct,
          image: normalizeImageValue(catalogProduct.image) ?? normalizedImages[0] ?? null,
          images: normalizedImages,
          variants: (catalogProduct.variants ?? []).map((variant) => ({
            ...variant,
            previewImageUrl: normalizeImageValue(variant.previewImageUrl) ?? null,
          })),
        };

        const defaultVariant =
          normalizedProduct.variants.find((variant) => variant.isEnabled && variant.inStock) ??
          normalizedProduct.variants[0] ??
          null;

        const finalImage = resolveDisplayImage(normalizedProduct, defaultVariant);
        if (
          !finalImage ||
          finalImage.includes('placeholder') ||
          finalImage.includes('seed:') ||
          finalImage.trim() === ''
        ) {
          setError('Product image not available');
          setLoading(false);
          return;
        }

        if (isCancelled) return;

        setProduct(normalizedProduct);
        setSelectedVariant(defaultVariant);

        const displayPrice =
          normalizedProduct.price ??
          (normalizedProduct.priceRange.min != null
            ? Math.round(normalizedProduct.priceRange.min) / 100
            : 0);
        const normalizedPriceCents =
          normalizedProduct.priceCents ??
          (displayPrice != null ? Math.round(displayPrice * 100) : 0);

        if (!isCancelled && finalImage) {
          addProduct({
            id: normalizedProduct.id,
            title: normalizedProduct.title,
            image: finalImage,
            priceCents: normalizedPriceCents,
          });
        }
      } catch (err) {
        if (isCancelled) return;
        const errorMessage =
          err instanceof Error ? err.message : 'An error occurred while fetching the product';
        setError(errorMessage);
        logger.error(
          'Error fetching product:',
          undefined,
          undefined,
          err instanceof Error ? err : new Error(String(err)),
        );
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    if (productId) void fetchProduct();

    return () => {
      isCancelled = true;
    };
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;
    if (!selectedVariant || !selectedVariant.isEnabled || !selectedVariant.inStock) {
      showError('Please select an available variant');
      return;
    }

    const imageUrl = resolveDisplayImage(product, selectedVariant);
    if (!imageUrl) {
      showError('Product image not available');
      return;
    }
    const currentPriceCents =
      selectedVariant.priceCents ??
      (product.priceRange.min != null
        ? Math.round(product.priceRange.min)
        : (product.priceCents ?? null));
    const currentPrice = currentPriceCents != null ? currentPriceCents / 100 : (product.price ?? 0);

    addItem({
      id: product.id,
      name: product.title,
      price: currentPrice,
      quantity,
      image: imageUrl,
      selectedVariant: {
        id: selectedVariant.id,
        title: selectedVariant.title ?? `Variant ${selectedVariant.printifyVariantId}`,
      },
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('cart-updated'));
    }

    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
    success(`Added ${product.title} to cart!`);
  };

  if (loading) {
    return (
      <main className={`om-route-page om-route-page--pdp ${styles.page}`} aria-busy="true">
        <div className={styles.shell}>
          <p role="status" className={styles.availability}>
            Loading product…
          </p>
          <div className={styles.productLayout} aria-hidden="true">
            <div className={styles.skeleton} />
            <div>
              <div className={styles.skeletonText} />
              <div className={styles.skeletonText} />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !product || !displayImageUrl) {
    return (
      <main className={`om-route-page om-route-page--pdp ${styles.page}`}>
        <div className={styles.shell}>
          <section className={styles.state}>
            <h1>Product unavailable</h1>
            <p>This item is unavailable or could not be loaded right now.</p>
            <Link
              href={paths.shop()}
              className="mori-foundation-button"
              data-mori-variant="secondary"
            >
              Return to Shop
            </Link>
          </section>
        </div>
      </main>
    );
  }

  const imageUrl = displayImageUrl;
  const currentPriceCents =
    selectedVariant?.priceCents ??
    (product.priceRange.min != null
      ? Math.round(product.priceRange.min)
      : (product.priceCents ?? null));
  const currentPrice = currentPriceCents != null ? currentPriceCents / 100 : (product.price ?? 0);
  const currency = 'USD';
  const isNSFW = product.tags.some((tag) => tag.toLowerCase().includes('nsfw'));

  return (
    <main className={`om-route-page om-route-page--pdp ${styles.page}`}>
      <div className={styles.shell}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <ol>
            <li>
              <Link href={paths.shop()}>{t('nav', 'shop')}</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">{product.title}</li>
          </ol>
        </nav>
        {isNSFW && <NSFWAffirmNote />}
        <div className={styles.productLayout} data-testid="product-details">
          <div className={styles.productObject}>
            <div className={styles.productMedia}>
              <Image
                src={imageUrl}
                alt={product.title}
                fill
                className={productImageMode(product)}
                sizes="(max-width: 639px) calc(100vw - 32px), (max-width: 1023px) calc(100vw - 64px), (max-width: 1399px) 52vw, 700px"
                unoptimized={!canOptimizeProductImage(imageUrl)}
                priority
              />
            </div>
          </div>
          <div className={styles.purchase}>
            <h1 data-testid="product-name">{product.title}</h1>
            <p className={styles.price} data-testid="product-price">
              {currency === 'USD' ? '$' : currency}
              {currentPrice.toFixed(2)}
            </p>
            <p className={styles.availability} aria-live="polite">
              {variantAvailable ? 'In stock' : 'This option is unavailable'}
            </p>
            <div className={styles.purchaseControls}>
              {product.variants && product.variants.length > 0 && (
                <div className={styles.field}>
                  <label htmlFor="variant-select">Select Variant</label>
                  <select
                    id="variant-select"
                    value={selectedVariant?.id || ''}
                    onChange={(e) => {
                      const variant = product.variants?.find((v) => v.id === e.target.value);
                      if (variant) setSelectedVariant(variant);
                    }}
                  >
                    {product.variants.map((variant) => (
                      <option
                        key={variant.id}
                        value={variant.id}
                        disabled={!variant.isEnabled || !variant.inStock}
                      >
                        {variant.title ?? `Variant ${variant.printifyVariantId}`} - $
                        {(
                          (variant.priceCents ?? Math.round((variant.price ?? 0) * 100)) / 100
                        ).toFixed(2)}
                        {!variant.isEnabled || !variant.inStock ? ' (Unavailable)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className={styles.purchaseAction}>
                <div className={styles.field}>
                  <label htmlFor="quantity">Quantity</label>
                  <input
                    id="quantity"
                    type="number"
                    min="1"
                    max="99"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  />
                </div>
                <MoriButton
                  onClick={handleAddToCart}
                  disabled={!variantAvailable}
                  data-testid="add-to-cart"
                >
                  Add to Cart
                </MoriButton>
              </div>
            </div>
            <div className={styles.added} role="status">
              {added ? (
                <div data-testid="cart-success">
                  <span>Added to cart!</span>
                  <Link href={paths.cart()}>View cart</Link>
                </div>
              ) : null}
            </div>
            <PetalDiscountBadge productPrice={currentPrice} />
            <section className={styles.details} aria-labelledby="product-description">
              <h2 id="product-description">About this piece</h2>
              {descriptionParagraphs.length > 0 ? (
                descriptionParagraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)
              ) : (
                <p>No additional description is available.</p>
              )}
              <dl className={styles.metadata}>
                <dt>SKU</dt>
                <dd>{selectedVariant?.sku || selectedVariant?.printifyVariantId || 'N/A'}</dd>
                {product.category ? (
                  <>
                    <dt>Category</dt>
                    <dd>{product.category}</dd>
                  </>
                ) : null}
                <dt>Availability</dt>
                <dd>{variantAvailable ? 'In Stock' : 'Unavailable'}</dd>
              </dl>
              {product.tags.length > 0 ? (
                <ul className={styles.tags} aria-label="Product tags">
                  {product.tags.map((tag, index) => (
                    <li key={index}>{tag}</li>
                  ))}
                </ul>
              ) : null}
            </section>
            <div className={styles.support}>
              <ShareButtons productTitle={product.title} productId={product.id} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
