// DEPRECATED: This component is a duplicate. Use app\pages\Shop.jsx instead.
import { prisma } from '@/app/lib/prisma';

export interface ShopProduct {
  id: string;
  name: string;
  description: string | null;
  primaryImageUrl: string | null;
  printifyProductId: string | null;
  variants: Array<{
    id: string;
    printifyVariantId: number;
    priceCents: number | null;
    currency: string | null;
    isEnabled: boolean;
    inStock: boolean;
    previewImageUrl: string | null;
  }>;
}

export interface ShopFilters {
  query?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}

export interface ShopSort {
  field: 'name' | 'createdAt';
  direction: 'asc' | 'desc';
}

export async function getShopProducts(
  filters: ShopFilters = {},
  sort: ShopSort = { field: 'createdAt', direction: 'desc' },
  page: number = 1,
  limit: number = 24,
): Promise<{ products: ShopProduct[]; total: number; hasMore: boolean }> {
  try {
    // Build where clause for filtering
    const where: any = {};

    if (filters.query) {
      where.OR = [
        { name: { contains: filters.query, mode: 'insensitive' } },
        { description: { contains: filters.query, mode: 'insensitive' } },
      ];
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.ProductVariant = {
        some: {
          priceCents: {
            ...(filters.minPrice !== undefined && { gte: filters.minPrice * 100 }),
            ...(filters.maxPrice !== undefined && { lte: filters.maxPrice * 100 }),
          },
        },
      };
    }

    if (filters.inStock !== undefined) {
      where.ProductVariant = {
        some: {
          inStock: filters.inStock,
        },
      };
    }

    // Build orderBy clause
    const orderBy: any = {};
    orderBy[sort.field] = sort.direction;

    // Get total count for pagination
    const total = await prisma.product.count({ where });

    // Get products with pagination
    const products = await prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        ProductVariant: {
          where: { isEnabled: true },
          orderBy: { priceCents: 'asc' },
        },
      },
    });

    const hasMore = page * limit < total;

    // Transform to match our interface
    const transformedProducts: ShopProduct[] = products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      primaryImageUrl: product.primaryImageUrl,
      printifyProductId: product.printifyProductId,
      variants: product.ProductVariant.map((variant) => ({
        id: variant.id,
        printifyVariantId: variant.printifyVariantId,
        priceCents: variant.priceCents,
        currency: variant.currency,
        isEnabled: variant.isEnabled,
        inStock: variant.inStock,
        previewImageUrl: variant.previewImageUrl,
      })),
    }));

    return {
      products: transformedProducts,
      total,
      hasMore,
    };
  } catch (error) {
    console.error('Error fetching shop products:', error);
    return {
      products: [],
      total: 0,
      hasMore: false,
    };
  }
}

export async function getShopCategories(): Promise<
  Array<{ slug: string; name: string; count: number }>
> {
  try {
    // Since we don't have categories in the current schema, return a default structure
    // You can extend this later when you add category support
    return [{ slug: 'all', name: 'All Products', count: await prisma.product.count() }];
  } catch (error) {
    console.error('Error fetching shop categories:', error);
    return [];
  }
}

export async function getShopTags(): Promise<Array<{ name: string; count: number }>> {
  try {
    // Since we don't have tags in the current schema, return empty array
    // You can extend this later when you add tag support
    return [];
  } catch (error) {
    console.error('Error fetching shop tags:', error);
    return [];
  }
}
