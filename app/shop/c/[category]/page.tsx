import { notFound } from 'next/navigation';
import { type Metadata } from 'next';
import { CATEGORIES, getCategoryBySlug } from '@/lib/categories';
import { db } from '@/app/lib/db';
import CategoryHeader from '@/components/shop/CategoryHeader';
import ProductGrid from '@/components/shop/ProductGrid';
import { type Product } from '@/lib/z';

interface CategoryPageProps {
  params: {
    category: string;
  };
  searchParams: {
    page?: string;
    sort?: string;
    price_min?: string;
    price_max?: string;
  };
}

/**
 * Category collection page
 * Displays products filtered by category with pagination and sorting
 */
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const category = getCategoryBySlug(params.category);

  if (!category) {
    return {
      title: 'Category Not Found',
    };
  }

  return {
    title: `${category.label} - Otaku-mori`,
    description: category.description || `Shop ${category.label} at Otaku-mori`,
    openGraph: {
      title: `${category.label} - Otaku-mori`,
      description: category.description || `Shop ${category.label} at Otaku-mori`,
    },
  };
}

/**
 * Generate static params for all categories
 */
export async function generateStaticParams() {
  return CATEGORIES.map((category) => ({
    category: category.slug,
  }));
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const category = getCategoryBySlug(params.category);

  if (!category) {
    notFound();
  }

  // Parse search params
  const page = parseInt(searchParams.page || '1', 10);
  const sort = searchParams.sort || 'newest';
  const priceMin = searchParams.price_min ? parseFloat(searchParams.price_min) : undefined;
  const priceMax = searchParams.price_max ? parseFloat(searchParams.price_max) : undefined;

  // Pagination
  const itemsPerPage = 24;
  const from = (page - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;

  try {
    // Build where clause
    const whereClause: any = {
      active: true,
      categorySlug: category.slug,
    };

    // Build orderBy clause
    let orderBy: any = {};
    switch (sort) {
      case 'price_low':
        orderBy = { ProductVariant: { priceCents: 'asc' } };
        break;
      case 'price_high':
        orderBy = { ProductVariant: { priceCents: 'desc' } };
        break;
      case 'name':
        orderBy = { name: 'asc' };
        break;
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    // Execute query with pagination
    const [products, totalCount] = await Promise.all([
      db.product.findMany({
        where: whereClause,
        orderBy,
        skip: from,
        take: itemsPerPage,
        select: {
          id: true,
          name: true,
          description: true,
          primaryImageUrl: true,
          active: true,
          createdAt: true,
          updatedAt: true,
          ProductVariant: {
            select: {
              priceCents: true,
            },
            take: 1,
          },
        },
      }),
      db.product.count({ where: whereClause }),
    ]);

    // Transform products to match expected format
    const transformedProducts: Product[] = products.map((product) => ({
      id: product.id,
      slug: product.id, // Using ID as slug for now
      title: product.name,
      description: product.description || '',
      price: (product.ProductVariant[0]?.priceCents || 0) / 100,
      images: product.primaryImageUrl ? [product.primaryImageUrl] : [],
      tags: [], // TODO: Add tags from product data
      stock: 0, // TODO: Add stock from product data
    }));

    const totalPages = Math.ceil(totalCount / itemsPerPage);

    return (
      <div className="min-h-screen bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <CategoryHeader
            category={category}
            totalProducts={totalCount}
            currentPage={page}
            totalPages={totalPages}
          />

          <ProductGrid products={transformedProducts} />
        </div>
      </div>
    );
  } catch (error) {
    console.error('Category page error:', error);
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Error Loading Products</h1>
          <p className="text-white/60">Please try again later.</p>
        </div>
      </div>
    );
  }
}
