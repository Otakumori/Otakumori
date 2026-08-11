'use client';

import Link from 'next/link';
import type { CatalogProduct } from '@/lib/catalog/serialize';
import { stripHtml } from '@/lib/html';
import { paths } from '@/lib/paths';
import { MoriBadge, MoriCard, MoriImageFrame, MoriPrice } from '@/app/components/mori';
import { StorefrontButton } from './StorefrontPrimitives';

function getStartingPriceLabel(product: CatalogProduct) {
  const min = product.priceRange?.min ?? product.priceCents ?? null;
  if (typeof min === 'number') return `$${(min / 100).toFixed(2)}`;
  if (typeof product.price === 'number') return `$${product.price.toFixed(2)}`;
  return 'Price unavailable';
}

function cleanSummary(raw: string) {
  return stripHtml(raw || '')
    .replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/&rsquo;|&lsquo;/g, "'")
    .replace(/&times;/g, 'x')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\b(xs|s|m|l|xl|2xl|3xl|4xl)\b(\s+\b(xs|s|m|l|xl|2xl|3xl|4xl)\b)+/gi, ' ')
    .replace(/\b(length|width|height|size guide|sizes?)\b[\s\S]*$/i, ' ')
    .replace(/\bpadding:\s*\d+/gi, ' ')
    .replace(/\bcolor:\s*#[0-9a-f]+/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 170);
}

export function productImageMode(product: CatalogProduct) {
  const title = product.title.toLowerCase();
  const category = `${product.category ?? ''} ${product.categorySlug ?? ''}`.toLowerCase();
  const text = `${title} ${category}`;

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
    <div>
      {hasMultipleOptions ? (
        <p className="font-ui text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-pink-100/50">
          Starting at
        </p>
      ) : null}
      <MoriPrice className="text-xl">{getStartingPriceLabel(product)}</MoriPrice>
    </div>
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
    <MoriImageFrame
      src={image}
      alt={title}
      priority={priority}
      sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 33vw"
      mode={mode}
    />
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
  const summary = cleanSummary(product.description || '');
  const productHref = paths.product(product.id);

  return (
    <MoriCard className="group p-3" data-testid="product-card-shell">
      <div className="relative z-10">
        <Link href={productHref} className="block" data-testid="product-card">
          <ProductImageFrame
            image={image}
            title={product.title}
            priority={index === 0}
            mode={productImageMode(product)}
          />
        </Link>

        {product.provider ? (
          <MoriBadge className="absolute right-5 top-5">{product.provider}</MoriBadge>
        ) : null}

        <div className="space-y-4 p-3 pt-5">
          <div className="flex items-start justify-between gap-4">
            <Link href={productHref} className="min-w-0 flex-1">
              <h2 className="line-clamp-2 font-display text-xl font-semibold leading-snug text-[var(--mori-ivory)] transition-colors hover:text-[var(--mori-sakura-light)]">
                {product.title}
              </h2>
            </Link>
            <ProductPrice product={product} />
          </div>

          <p className="line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-[var(--mori-parchment-muted)]">
            {summary || 'Premium quality print-on-demand merchandise.'}
          </p>

          <Link href={productHref} aria-label={`View details for ${product.title}`}>
            <StorefrontButton className="w-full">Choose options</StorefrontButton>
          </Link>
        </div>
      </div>
    </MoriCard>
  );
}

export function ProductGrid({ products }: { products: CatalogProduct[] }) {
  return (
    <div
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
      data-testid="product-grid"
    >
      {products.map((product, index) => (
        <StorefrontProductCard key={product.id} product={product} index={index} />
      ))}
    </div>
  );
}
