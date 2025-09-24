import { Suspense } from 'react';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import StarfieldPurple from '../components/StarfieldPurple';
// import NavBar from '../components/NavBar'; // Removed to prevent nav overlay
import FooterDark from '../components/FooterDark';
import ShopCatalog from '../components/shop/ShopCatalog';
import { t } from '@/lib/microcopy';
import { env } from '@/env.mjs';
async function getLogger() {
  const { logger } = await import('@/app/lib/logger');
  return logger;
}
import { getPrintifyService } from '../lib/printify/service';
import type { PrintifyProduct } from '../lib/printify/schema';

export const metadata: Metadata = {
  title: 'Shop | Otaku-mori',
  description: 'Discover exclusive anime merchandise and gaming accessories',
};

// Use ISR instead of no-store for better performance
export const revalidate = 300; // 5 minutes

type MappedProduct = {
  id: string;
  title: string;
  description?: string;
  images?: string[];
  variants?: Array<{
    id: number;
    title: string;
    price: number;
    available: boolean;
  }>;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
  price?: number;
  available?: boolean;
};

type ApiResponse = { ok: true; data: MappedProduct[] } | { ok: false; error: string; detail?: any };

async function loadPrintifyProducts(): Promise<ApiResponse> {
  try {
    // Use direct service call instead of localhost fetch
    const printifyService = getPrintifyService();
    const response = await printifyService.getProducts(1, 20);

    // Map Printify products to our expected format
    const mappedProducts: MappedProduct[] = response.data.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      images: item.images?.map((img) => img.src) || [],
      variants:
        item.variants?.map((v) => ({
          id: v.id,
          title: v.title,
          price: v.price,
          available: v.is_available && v.is_enabled,
        })) || [],
      tags: item.tags,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      price: item.variants?.[0]?.price || 0,
      available: item.variants?.some((v) => v.is_available && v.is_enabled) || false,
    }));

    return {
      ok: true,
      data: mappedProducts,
    };
  } catch (error) {
    const logger = await getLogger();
    logger.warn('Printify service failed', {
      extra: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    return {
      ok: false,
      error: 'Failed to load products',
      detail: error instanceof Error ? error.message : 'Unknown error',
    };
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

    return products.map((product) => ({
      id: product.id,
      title: product.name,
      description: product.description || undefined,
      images: product.primaryImageUrl ? [{ src: product.primaryImageUrl }] : [],
      variants: product.ProductVariant.map((variant) => ({
        id: variant.id,
        price: variant.priceCents ? variant.priceCents / 100 : 0,
        is_enabled: variant.isEnabled,
      })),
    }));
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
    price?: number;
    available?: boolean;
  }> = [];

  if (printifyResult.ok && printifyResult.data && printifyResult.data.length > 0) {
    products = printifyResult.data.map((item: MappedProduct) => ({
      id: item.id,
      title: item.title,
      description: item.description || '',
      images: item.images && item.images.length > 0 ? [{ src: item.images[0] }] : [],
      variants: item.variants || [],
      price: item.price || 0,
      available: item.available !== false,
    }));

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
  searchParams: { sort?: string; q?: string; page?: string; category?: string };
}) {
  const data = await loadProducts(searchParams);

  return (
    <>
      <StarfieldPurple />
      {/* NavBar removed to prevent overlay */}
      <main className="relative z-10 min-h-screen">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white md:text-4xl">{t('nav', 'shop')}</h1>
            <p className="mt-2 text-zinc-300/90">Discover treasures from the digital abyss</p>
          </div>

          <Suspense fallback={<ShopCatalogSkeleton />}>
            <ShopCatalog
              products={data.products.map((p) => ({
                id: p.id,
                name: p.title,
                price: p.price || p.variants?.[0]?.price || 0,
                image: p.images?.[0]?.src || '',
                slug: p.id,
                inStock: p.available !== false,
              }))}
              total={data.total || 0}
              currentPage={parseInt(searchParams.page || '1')}
              totalPages={data.totalPages || 1}
              searchParams={searchParams}
            />
          </Suspense>
        </div>
      </main>
      <FooterDark />
    </>
  );
}

function ShopCatalogSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-12 bg-white/5 rounded-2xl animate-pulse" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white/5 rounded-2xl p-4 animate-pulse">
            <div className="aspect-[4/5] bg-white/10 rounded-xl mb-3" />
            <div className="h-4 bg-white/10 rounded mb-2" />
            <div className="h-3 bg-white/10 rounded w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
