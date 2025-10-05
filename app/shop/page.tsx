import { Suspense } from 'react';
import type { Metadata } from 'next';
import StarfieldPurple from '../components/StarfieldPurple';
import FooterDark from '../components/FooterDark';
import AdvancedShopCatalog from '../components/shop/AdvancedShopCatalog';

async function getLogger() {
  const { logger } = await import('@/app/lib/logger');
  return logger;
}

export const metadata: Metadata = {
  title: 'Shop | Otaku-mori',
  description:
    'Discover exclusive anime merchandise and gaming accessories with advanced search and filtering',
};

// Use ISR for better performance and real-time inventory updates
export const revalidate = 300; // 5 minutes

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
      <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-black">
        <StarfieldPurple />

        <main className="relative z-10">
          {/* Header Section */}
          <div className="container mx-auto px-4 py-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-bold text-primary mb-4">Otaku-mori Shop</h1>
              <p className="text-xl text-secondary max-w-2xl mx-auto">
                Curated treasures for fellow travelers
              </p>
            </div>
          </div>

          {/* Advanced Shop Catalog with Search and Filters */}
          <Suspense
            fallback={
              <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="glass-card h-96 animate-pulse" />
                  ))}
                </div>
              </div>
            }
          >
            <AdvancedShopCatalog searchParams={searchParams} />
          </Suspense>
        </main>

        <FooterDark />
      </div>
    );
  } catch (error) {
    logger.error('shop_page_error', undefined, {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now(),
    });

    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="glass-card p-8 max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-primary mb-4">Shop Temporarily Unavailable</h1>
            <p className="text-secondary">
              Please try again later or contact support if the issue persists.
            </p>
          </div>
        </div>
      </div>
    );
  }
}
