import { generateSEO } from '@/app/lib/seo';
import { Suspense } from 'react';
import AdvancedShopCatalog from '../components/shop/AdvancedShopCatalog';
import { ShopGridSkeleton } from '../components/ui/Skeleton';

async function getLogger() {
  const { logger } = await import('@/app/lib/logger');
  return logger;
}


export function generateMetadata() {
  return generateSEO({
    title: 'Shop',
    description: 'Browse our anime and gaming merchandise',
    url: '/shop',
  });
}
export default async function ShopPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const logger = await getLogger();

  try {
    // Log shop page visit for analytics (removed headers() for static generation)
    logger.info('shop_page_view', {
      extra: {
        timestamp: Date.now(),
      },
    });

    return (
      <main className="relative min-h-screen vignette">
        {/* Header Section */}
        <div className="relative z-40 container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-pink-200 mb-4">Otaku-mori Shop</h1>
            <p className="text-xl text-pink-200/70 max-w-2xl mx-auto">
              Curated treasures for fellow travelers
            </p>
          </div>
        </div>

        {/* Advanced Shop Catalog with Search and Filters */}
        <div className="relative z-40">
          <Suspense
            fallback={
              <div className="container mx-auto px-4 py-12">
                <ShopGridSkeleton count={6} />
              </div>
            }
          >
            <AdvancedShopCatalog searchParams={searchParams} />
          </Suspense>
        </div>
      </main>
    );
  } catch (error) {
    logger.error('shop_page_error', undefined, {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now(),
    });

    return (
      <main className="relative min-h-screen vignette flex items-center justify-center">
        <div className="relative z-40 text-center">
          <div className="glass-panel rounded-2xl p-8 max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-pink-200 mb-4">Shop Temporarily Unavailable</h1>
            <p className="text-pink-200/70">
              Please try again later or contact support if the issue persists.
            </p>
          </div>
        </div>
      </main>
    );
  }
}
