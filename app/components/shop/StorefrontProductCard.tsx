'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { CatalogProduct } from '@/lib/catalog/serialize';
import { stripHtml } from '@/lib/html';
import { paths } from '@/lib/paths';
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
      <p className="font-display text-xl font-semibold text-pink-100">
        {getStartingPriceLabel(product)}
      </p>
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
    <div className="relative aspect-[4/5] overflow-hidden rounded-[1.55rem] border border-pink-100/12 bg-[radial-gradient(circle_at_center,rgba(255,235,245,0.09),rgba(12,8,18,0.92)_62%)]">
      <Image
        src={image}
        alt={title}
        fill
        className={`${mode} transition-transform duration-500 group-hover:scale-[1.035]`}
        sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 33vw"
        priority={priority}
        unoptimized
      />
      <div className="pointer-events-none absolute inset-3 rounded-[1.2rem] border border-white/8" />
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
  const summary = cleanSummary(product.description || '');
  const productHref = paths.product(product.id);

  return (
    <article className="group relative overflow-hidden rounded-[1.8rem] border border-pink-100/14 bg-[#140f18]/88 p-3 shadow-[0_18px_60px_rgba(0,0,0,0.28)] transition duration-300 hover:-translate-y-1 hover:border-pink-100/28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,153,204,0.14),transparent_36%)] opacity-80" />
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
          <div className="absolute right-5 top-5 rounded-full border border-white/12 bg-black/68 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-pink-50/82">
            {product.provider}
          </div>
        ) : null}

        <div className="space-y-4 p-3 pt-5">
          <div className="flex items-start justify-between gap-4">
            <Link href={productHref} className="min-w-0 flex-1">
              <h2 className="line-clamp-2 font-display text-xl font-semibold leading-snug text-[#f7eadf] transition-colors hover:text-pink-100">
                {product.title}
              </h2>
            </Link>
            <ProductPrice product={product} />
          </div>

          <p className="line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-[#f5d6dc]/68">
            {summary || 'Premium quality print-on-demand merchandise.'}
          </p>

          <Link href={productHref} aria-label={`View details for ${product.title}`}>
            <StorefrontButton className="w-full">Choose options</StorefrontButton>
          </Link>
        </div>
      </div>
    </article>
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
