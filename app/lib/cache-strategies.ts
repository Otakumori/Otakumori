/**
 * Prisma Accelerate Cache Strategies
 *
 * This file demonstrates different caching strategies for common database operations
 * using Prisma Accelerate extension.
 */

import { db } from './db';

/**
 * Cache strategies for different types of data
 */
export const CACHE_STRATEGIES = {
  // User data - cache for 5 minutes
  USER: { ttl: 300 },

  // Product data - cache for 10 minutes (products don't change often)
  PRODUCT: { ttl: 600 },

  // Search results - cache for 2 minutes
  SEARCH: { ttl: 120 },

  // Real-time data - cache for 30 seconds
  REALTIME: { ttl: 30 },

  // Static data - cache for 1 hour
  STATIC: { ttl: 3600 },
} as const;

/**
 * Example: Cached user lookup with email search
 */
export async function findUserByEmail(email: string) {
  return await db.user.findMany({
    where: {
      email: {
        contains: email,
      },
    },
    cacheStrategy: CACHE_STRATEGIES.USER,
  });
}

/**
 * Example: Cached product search with multiple filters
 */
export async function searchProductsWithFilters(filters: {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}) {
  return await db.product.findMany({
    where: {
      active: true,
      ...(filters.category && { category: filters.category }),
      ...(filters.minPrice && {
        ProductVariant: {
          some: {
            price: { gte: filters.minPrice },
          },
        },
      }),
      ...(filters.maxPrice && {
        ProductVariant: {
          some: {
            price: { lte: filters.maxPrice },
          },
        },
      }),
      ...(filters.inStock && {
        ProductVariant: {
          some: {
            inStock: true,
          },
        },
      }),
    },
    include: {
      ProductVariant: {
        where: { isEnabled: true },
      },
    },
    cacheStrategy: CACHE_STRATEGIES.SEARCH,
  });
}

/**
 * Example: Cached user orders with pagination
 */
export async function getUserOrdersPaginated(userId: string, page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit;

  return await db.order.findMany({
    where: {
      user: { clerkId: userId },
    },
    include: {
      OrderItem: {
        include: {
          Product: true,
          ProductVariant: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    skip,
    take: limit,
    cacheStrategy: CACHE_STRATEGIES.USER,
  });
}

/**
 * Example: Cached analytics data
 */
export async function getProductAnalytics(productId: string) {
  const [views, orders, revenue] = await Promise.all([
    // Product views (cached for 5 minutes)
    db.productView.count({
      where: { productId },
      cacheStrategy: CACHE_STRATEGIES.REALTIME,
    }),

    // Order count (cached for 5 minutes)
    db.orderItem.count({
      where: {
        productId,
        order: { status: 'completed' },
      },
      cacheStrategy: CACHE_STRATEGIES.REALTIME,
    }),

    // Revenue calculation (cached for 5 minutes)
    db.orderItem.aggregate({
      where: {
        productId,
        order: { status: 'completed' },
      },
      _sum: { unitAmount: true },
      cacheStrategy: CACHE_STRATEGIES.REALTIME,
    }),
  ]);

  return {
    views,
    orders,
    revenue: revenue._sum.unitAmount || 0,
  };
}

/**
 * Example: Cached user profile with related data
 */
export async function getUserProfileWithStats(userId: string) {
  const [user, orders, petalCollections] = await Promise.all([
    // User data (cached for 5 minutes)
    db.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        clerkId: true,
        email: true,
        username: true,
        display_name: true,
        avatarUrl: true,
        petalBalance: true,
        level: true,
        xp: true,
        createdAt: true,
      },
      cacheStrategy: CACHE_STRATEGIES.USER,
    }),

    // User orders (cached for 5 minutes)
    db.order.count({
      where: {
        user: { clerkId: userId },
        status: 'completed',
      },
      cacheStrategy: CACHE_STRATEGIES.USER,
    }),

    // Petal collections (cached for 2 minutes)
    db.petalCollection.count({
      where: {
        userId,
        isAuthenticated: true,
      },
      cacheStrategy: CACHE_STRATEGIES.REALTIME,
    }),
  ]);

  return {
    user,
    stats: {
      totalOrders: orders,
      totalPetalsCollected: petalCollections,
    },
  };
}

/**
 * Example: Cached product recommendations
 */
export async function getProductRecommendations(userId: string, limit: number = 5) {
  // Get user's purchase history
  const userOrders = await db.order.findMany({
    where: {
      user: { clerkId: userId },
      status: 'completed',
    },
    include: {
      OrderItem: {
        include: {
          Product: {
            include: {
              ProductVariant: true,
            },
          },
        },
      },
    },
    cacheStrategy: CACHE_STRATEGIES.USER,
  });

  // Extract categories from purchase history
  const purchasedCategories = userOrders
    .flatMap((order) => order.OrderItem)
    .map((item) => item.Product.category)
    .filter(Boolean);

  // Get recommended products from same categories
  return await db.product.findMany({
    where: {
      active: true,
      category: {
        in: purchasedCategories,
      },
      id: {
        notIn: userOrders.flatMap((order) => order.OrderItem).map((item) => item.productId),
      },
    },
    include: {
      ProductVariant: {
        where: { isEnabled: true, inStock: true },
      },
    },
    take: limit,
    cacheStrategy: CACHE_STRATEGIES.SEARCH,
  });
}
