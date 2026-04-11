import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DatabaseAccess } from '@/app/lib/db';
import { generateSEO } from '@/app/lib/seo';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await DatabaseAccess.getProductBySlug(slug);

  if (!product) {
    return generateSEO({
      title: 'Product not found',
      description: 'This product could not be found.',
      url: `/product/${slug}`,
    });
  }

  const firstVariant = product.ProductVariant?.[0];
  const primaryImage = product.ProductImage?.[0]?.url || product.primaryImageUrl || '/assets/images/og-default.png';

  return generateSEO({
    title: product.name,
    description: product.description || `${product.name} from Otaku-mori.`,
    image: primaryImage,
    url: `/product/${product.slug}`,
    type: 'product',
    price: firstVariant?.priceCents ? firstVariant.priceCents / 100 : 0,
    currency: firstVariant?.currency || 'USD',
  });
}

function formatPrice(priceCents?: number | null, currency?: string | null) {
  if (!priceCents || priceCents <= 0) return 'Price coming soon';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
  }).format(priceCents / 100);
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await DatabaseAccess.getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const primaryImage = product.ProductImage?.[0]?.url || product.primaryImageUrl;
  const variants = product.ProductVariant ?? [];
  const firstVariant = variants[0];

  return (
    <main className="min-h-screen bg-[#080611] px-6 py-12 text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 lg:flex-row">
        <div className="flex-1 overflow-hidden rounded-3xl border border-white/10 bg-white/5">
          {primaryImage ? (
            <img
              src={primaryImage}
              alt={product.name}
              className="h-full min-h-[420px] w-full object-cover"
            />
          ) : (
            <div className="flex min-h-[420px] items-center justify-center text-white/50">
              No product image yet
            </div>
          )}
        </div>

        <div className="flex-1 space-y-6">
          <div className="space-y-3">
            <Link href="/shop" className="inline-flex text-sm text-pink-200/80 hover:text-pink-100">
              ← Back to shop
            </Link>
            <p className="text-xs uppercase tracking-[0.25em] text-pink-200/60">Otaku-mori</p>
            <h1 className="text-4xl font-semibold tracking-tight">{product.name}</h1>
            <p className="text-2xl font-medium text-pink-200">
              {formatPrice(firstVariant?.priceCents, firstVariant?.currency)}
            </p>
          </div>

          {product.description ? (
            <p className="max-w-2xl text-base leading-7 text-white/75">{product.description}</p>
          ) : (
            <p className="max-w-2xl text-base leading-7 text-white/55">
              More details for this piece are being restored right now.
            </p>
          )}

          <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <h2 className="mb-3 text-lg font-medium">Available variants</h2>
            {variants.length > 0 ? (
              <div className="space-y-3">
                {variants.map((variant) => (
                  <div
                    key={variant.id}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-white">{variant.title || 'Standard variant'}</p>
                      <p className="text-sm text-white/50">{variant.sku || 'SKU pending sync'}</p>
                    </div>
                    <p className="text-sm text-pink-200">
                      {formatPrice(variant.priceCents, variant.currency)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/55">Variant data is still being restored.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
