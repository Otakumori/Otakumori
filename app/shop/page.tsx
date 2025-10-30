import { Suspense } from 'react';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { env } from '@/env';
import AdvancedShopCatalog from '../components/shop/AdvancedShopCatalog';
import { ShopGridSkeleton } from '../components/ui/Skeleton';

async function getLogger() {
  const { logger } = await import('@/app/lib/logger');
  return logger;
}

import { generateSEO } from '../lib/seo';

export const metadata: Metadata = generateSEO({
  title: 'Shop',
  description:
    'Discover exclusive anime merchandise and gaming accessories with advanced search and filtering',
  url: '/shop',
  type: 'website',
});

type ApiResponse =
  | {
      ok: true;
      data: {
        items: Array<{ id?: string; title: string; images?: { src: string }[]; variants?: any[] }>;
      };
    }
  | { ok: false; error: string; detail?: any };

async function loadPrintifyProducts(): Promise<ApiResponse> {
  try {
    // Use the request URL to construct the base URL dynamically
    const baseUrl =
      env.NODE_ENV === 'production' ? 'https://www.otaku-mori.com' : 'http://localhost:3000';
    const headersList = await headers();
    const response = await fetch(`${baseUrl}/api/printify/products`, {
      headers: {
        'x-req-id': headersList.get('x-req-id') ?? '',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const logger = await getLogger();
      logger.warn('Printify API failed', {
        extra: {
          status: response.status,
          statusText: response.statusText,
        },
      });
      return { ok: false, error: 'Printify API unavailable' };
    }

    return await response.json();
  } catch (error) {
    const logger = await getLogger();
    logger.error(
      'Failed to fetch from Printify API',
      undefined,
      undefined,
      error instanceof Error ? error : new Error(String(error)),
    );
    return { ok: false, error: 'Network error' };
  }
}

async function loadDbFallback() {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const products = await prisma.product.findMany({
      where: { active: true },
      include: {
        ProductVariant: {
          where: { isEnabled: true },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 24,
    });

    await prisma.$disconnect();

    return products.map((product) => {
      const mapped: {
        id: string;
        title: string;
        description?: string;
        images: { src: string }[];
        variants: Array<{ id: string; price: number; is_enabled: boolean }>;
      } = {
        id: product.id,
        title: product.name,
        images: product.primaryImageUrl ? [{ src: product.primaryImageUrl }] : [],
        variants: product.ProductVariant.map((variant) => ({
          id: variant.id,
          price: variant.priceCents ? variant.priceCents / 100 : 0,
          is_enabled: variant.isEnabled,
        })),
      };

      if (product.description) {
        mapped.description = product.description;
      }

      return mapped;
    });
  } catch (error) {
    const logger = await getLogger();
    logger.error(
      'Failed to load database fallback',
      undefined,
      undefined,
      error instanceof Error ? error : new Error(String(error)),
    );
    return [];
  }
}

async function loadProducts(searchParams: {
  sort?: string;
  q?: string;
  page?: string;
  category?: string;
}) {
  const logger = await getLogger();
  logger.info('Loading products for shop page', {
    extra: { searchParams },
  });

  // Try Printify first
  const printifyResult = await loadPrintifyProducts();

  let products: Array<{
    id: string;
    title: string;
    description?: string;
    images?: { src: string }[];
    variants?: any[];
  }> = [];

  if (printifyResult.ok && printifyResult.data.items.length > 0) {
    products = printifyResult.data.items.map((item) => {
      const images = Array.isArray(item.images)
        ? item.images
            .map((img: any) => {
              if (typeof img === 'string') return { src: img };
              if (img && typeof img === 'object' && typeof img.src === 'string') {
                return { src: img.src };
              }
              return null;
            })
            .filter((img): img is { src: string } => !!img && img.src.length > 0)
        : [];

      const productData: {
        id: string;
        title: string;
        description?: string;
        images: { src: string }[];
        variants: any[];
      } = {
        id: item.id || `printify_${Math.random()}`,
        title: item.title,
        images,
        variants: item.variants || [],
      };

      const maybeDescription = (item as any)?.description;
      if (typeof maybeDescription === 'string' && maybeDescription.length > 0) {
        productData.description = maybeDescription;
      }

      return productData;
    });

    logger.info('Loaded products from Printify', {
      extra: { count: products.length },
    });
  } else {
    // Fallback to database
    logger.info('Falling back to database products');
    products = await loadDbFallback();
  }

  // Apply search/filter logic here if needed
  const filteredProducts = products.filter((product) => {
    if (searchParams.q) {
      return product.title.toLowerCase().includes(searchParams.q.toLowerCase());
    }
    return true;
  });

  const page = parseInt(searchParams.page || '1');
  const perPage = 12;
  const total = filteredProducts.length;
  const totalPages = Math.ceil(total / perPage);
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  return {
    products: paginatedProducts,
    total,
    page,
    totalPages,
  };
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
