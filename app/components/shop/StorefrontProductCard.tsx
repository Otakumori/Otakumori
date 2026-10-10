'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { CatalogProduct } from '@/lib/catalog/serialize';
import { paths } from '@/lib/paths';
import { canOptimizeProductImage } from './product-image';
import styles from './commerce-composition.module.css';

function getStartingPriceLabel(product: CatalogProduct) {
  const min = product.priceRange?.min ?? product.priceCents ?? null;
  if (typeof min === 'number') return `$${(min / 100).toFixed(2)}`;
  if (typeof product.price === 'number') return `$${product.price.toFixed(2)}`;
  return 'Price unavailable';
}

export function productImageMode(product: CatalogProduct) {
  const text =
    `${product.title} ${product.category ?? ''} ${product.categorySlug ?? ''}`.toLowerCase();
  if (
    /(shoe|sneaker|pin|sticker|keychain|charm|wrapping|paper|poster|print|pillow|tote|bag)/.test(
      text,
    )
  ) {
    return 'object-contain p-7 sm:p-8';
  }
  return 'object-cover';
}

export function ProductPrice({ product }: { product: CatalogProduct }) {
  const hasMultipleOptions = Boolean(product.variants?.length && product.variants.length > 1);
  return (
    <p className={styles.recordPrice}>
      {hasMultipleOptions ? <span className={styles.priceContext}>Starting at </span> : null}
      <span>{getStartingPriceLabel(product)}</span>
    </p>
  );
}

export function ProductImageFrame({
  image,
  title,
  priority,
  mode,
}: {
  image: string;
  title: string;
  priority?: boolean;
  mode: string;
}) {
  return (
    <div className={styles.recordMedia}>
      <Image
        src={image}
        alt={title}
        fill
        className={`${mode} ${styles.recordImage}`}
        sizes="(max-width: 639px) calc(100vw - 32px), (max-width: 1023px) calc((100vw - 96px) / 2), (max-width: 1399px) calc((100vw - 144px) / 3), 400px"
        priority={priority}
        unoptimized={!canOptimizeProductImage(image)}
      />
    </div>
  );
}

export function StorefrontProductCard({
  product,
  index = 0,
}: {
  product: CatalogProduct;
  index?: number;
}) {
  const image = product.image ?? product.images?.[0] ?? '';
  return (
    <article className={styles.record}>
      <Link
        href={paths.product(product.id)}
        className={styles.recordLink}
        data-testid="product-card"
        aria-label={`View ${product.title}`}
      >
        <ProductImageFrame
          image={image}
          title={product.title}
          priority={index === 0}
          mode={productImageMode(product)}
        />
        <div className={styles.recordIdentity}>
          <h2>{product.title}</h2>
          {product.category ? <p className={styles.recordContext}>{product.category}</p> : null}
          <ProductPrice product={product} />
          <span className={styles.recordAction}>
            View details
            <svg
              aria-hidden="true"
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
            >
              <path d="M3 13 13 3M4 3h9v9" />
            </svg>
          </span>
        </div>
      </Link>
    </article>
  );
}

export function ProductGrid({ products }: { products: CatalogProduct[] }) {
  return (
    <div className={styles.catalogue} data-testid="product-grid">
      {products.map((product, index) => (
        <StorefrontProductCard key={product.id} product={product} index={index} />
      ))}
    </div>
  );
}
