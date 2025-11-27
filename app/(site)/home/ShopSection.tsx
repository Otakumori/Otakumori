import { headers } from 'next/headers';
import Link from 'next/link';
import Image from 'next/image';
import { paths } from '@/lib/paths';
import { GlassCard, GlassCardContent } from '@/components/ui/glass-card';
import { HeaderButton } from '@/components/ui/header-button';
import { stripHtml } from '@/lib/html';
import { handleServerError } from '@/app/lib/server-error-handler';
import { env } from '@/env.mjs';
import { SectionHeader } from '@/app/components/home/SectionHeader';
import { EmptyState } from '@/app/components/home/EmptyState';
import { validateApiEnvelope } from '@/app/lib/api-response-validator';
import { FeaturedProductsResponseSchema, type FeaturedProduct } from '@/app/lib/api-contracts';

// Use validated schema type instead of manual interface
type Product = FeaturedProduct;

interface ShopData {
  products: Product[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    total: number;
  };
}

/**
 * Safely get base URL for API calls with multiple fallbacks.
 * This function NEVER throws - it always returns a valid URL string.
 */
async function getBaseUrl(): Promise<string> {
  try {
    const headersList = await headers();
    const host = headersList.get('host');
    const protocol =
      headersList.get('x-forwarded-proto') ||
      (process.env.NODE_ENV === 'production' ? 'https' : 'http');

    if (host && typeof host === 'string' && host.length > 0) {
      return `${protocol}://${host}`;
    }
  } catch {
    // Fallback if headers() fails - don't throw, just use env var
  }

  // Fallback: use env var if available
  if (env.NEXT_PUBLIC_APP_URL && typeof env.NEXT_PUBLIC_APP_URL === 'string') {
    try {
      // Validate URL format
      const url = new URL(env.NEXT_PUBLIC_APP_URL);
      return url.origin;
    } catch {
      // If URL is invalid, use as-is (might be just domain)
      const urlStr = env.NEXT_PUBLIC_APP_URL.trim();
      return urlStr.startsWith('http') ? urlStr : `https://${urlStr}`;
    }
  }

  // Last resort: use production URL or localhost
  return process.env.NODE_ENV === 'production'
    ? 'https://www.otaku-mori.com'
    : 'http://localhost:3000';
}

/**
 * ShopSection Server Component - NEVER throws errors.
 * All errors are caught and logged, always returns renderable content.
 */
export default async function ShopSection() {
  let shopData: ShopData = { products: [] };

  try {
    // Get base URL - this should never throw due to fallbacks in getBaseUrl()
    let baseUrl: string;
    try {
      baseUrl = await getBaseUrl();
    } catch (urlError) {
      // Even getBaseUrl() should never throw, but be extra safe
      console.warn('[ShopSection] getBaseUrl() failed:', urlError);
      baseUrl =
        process.env.NODE_ENV === 'production'
          ? 'https://www.otaku-mori.com'
          : 'http://localhost:3000';
    }

    const apiUrl = `${baseUrl}/api/v1/products/featured?force_printify=true&limit=8`;

    // Fetch products - wrap in try-catch to prevent any fetch errors from throwing
    let response: Response;
    try {
      response = await fetch(apiUrl, {
        next: { revalidate: 60 }, // Cache for 60 seconds
        headers: {
          Accept: 'application/json',
        },
      });
    } catch (fetchError) {
      // Network error - log but don't throw
      console.warn('[ShopSection] Fetch failed:', fetchError);
      shopData = { products: [] };
      return renderShopContent(shopData);
    }

    if (response.ok) {
      try {
        const result = await response.json();

        // Validate API response structure
        // Extract the data schema from the full response schema
        const DataSchema = FeaturedProductsResponseSchema.shape.data;
        const validated = validateApiEnvelope(result, DataSchema);

        if (validated?.ok) {
          // Response is validated and type-safe
          const products = validated.data.products.map(
            (product): Product => ({
              id: product.id,
              title: product.title,
              description: product.description ? stripHtml(product.description) : undefined,
              price: product.price,
              image: product.image,
              available: product.available,
              slug: product.slug,
              category: product.category ?? undefined,
              tags: product.tags,
            }),
          );

          // Handle pagination - only include if all required fields are present
          const pagination = validated.data.pagination;
          const paginationData =
            pagination &&
            typeof pagination.currentPage === 'number' &&
            typeof pagination.totalPages === 'number' &&
            typeof pagination.total === 'number'
              ? {
                  currentPage: pagination.currentPage,
                  totalPages: pagination.totalPages,
                  total: pagination.total,
                }
              : undefined;

          shopData = {
            products,
            pagination: paginationData,
          };
        } else {
          // Validation failed - log and use empty state
          console.warn('[ShopSection] API response validation failed for', apiUrl);
          shopData = { products: [] };
        }
      } catch (parseError) {
        // JSON parse error - log but don't throw
        console.warn('[ShopSection] Failed to parse response:', parseError);
        shopData = { products: [] };
      }
    } else {
      // API returned error status - log but don't throw
      console.warn(`[ShopSection] API returned ${response.status} for ${apiUrl}`);
      shopData = { products: [] };
    }
  } catch (error) {
    // Catch any unexpected errors - log but don't throw
    handleServerError(
      error,
      {
        section: 'shop',
        component: 'ShopSection',
        operation: 'fetch_products',
      },
      {
        logLevel: 'warn',
      },
    );
    shopData = { products: [] };
  }

  return renderShopContent(shopData);
}

function renderShopContent(shopData: ShopData) {
  const { products } = shopData;
  const hasProducts = products.length > 0;

  return (
    <div className="rounded-2xl p-8">
      <SectionHeader title="Shop" description="Discover unique anime-inspired merchandise" />

      {hasProducts ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Link
              key={product.id}
              href={product.slug ? paths.product(product.slug) : paths.shop()}
              className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              <GlassCard className="flex h-full flex-col">
                {product.image ? (
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-90" />
                    <span className="absolute left-4 top-4 rounded-full bg-pink-500/20 px-3 py-1 text-xs font-medium text-pink-200 backdrop-blur">
                      {product.available ? 'Featured' : 'Coming Soon'}
                    </span>
                  </div>
                ) : (
                  <div className="relative aspect-square overflow-hidden bg-white/5 flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-90" />
                    <span className="absolute left-4 top-4 rounded-full bg-pink-500/20 px-3 py-1 text-xs font-medium text-pink-200 backdrop-blur">
                      {product.available ? 'Featured' : 'Coming Soon'}
                    </span>
                  </div>
                )}
                <GlassCardContent className="flex flex-1 flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-white transition-colors group-hover:text-pink-400">
                      {product.title}
                    </h3>
                    {product.description && (
                      <p className="mt-2 line-clamp-2 text-sm text-white/70">
                        {product.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-lg font-bold text-pink-300">
                      ${product.price.toFixed(2)}
                    </span>
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        product.available
                          ? 'bg-emerald-500/15 text-emerald-200'
                          : 'bg-amber-500/15 text-amber-200'
                      }`}
                    >
                      {product.available ? 'In Stock' : 'Notify Me'}
                    </span>
                  </div>
                </GlassCardContent>
              </GlassCard>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Products Available"
          description="We're working on adding new products. Check back soon!"
          actionLabel="Explore Shop"
          actionHref={paths.shop()}
        />
      )}

      {hasProducts && (
        <div className="text-center mt-8">
          <HeaderButton href={paths.shop()}>View All Products</HeaderButton>
        </div>
      )}
    </div>
  );
}
