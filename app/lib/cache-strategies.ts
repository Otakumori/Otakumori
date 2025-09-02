/**
 * Database Query Utilities
 *
 * This file provides utility functions for common database operations.
 * Note: Caching strategies have been removed as Prisma Accelerate is not currently enabled.
 */

import { db } from './db';

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
            priceCents: { gte: filters.minPrice * 100 },
          },
        },
      }),
      ...(filters.maxPrice && {
        ProductVariant: {
          some: {
            priceCents: { lte: filters.maxPrice * 100 },
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
  });
}

/**
 * Example: Cached user orders with pagination
 */
export async function getUserOrdersPaginated(userId: string, page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit;

  return await db.order.findMany({
    where: {
      User: { clerkId: userId },
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
  });
}

/**
 * Example: Cached analytics data
 */
export async function getProductAnalytics(productId: string) {
  const [orders, revenue] = await Promise.all([
    // Order count (cached for 5 minutes)
    db.orderItem.count({
      where: {
        productId,
        Order: { status: 'shipped' },
      },
    }),

    // Revenue calculation (cached for 5 minutes)
    db.orderItem.aggregate({
      where: {
        productId,
        Order: { status: 'shipped' },
      },
      _sum: { unitAmount: true },
    }),
  ]);

  return {
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
    }),

    // User orders (cached for 5 minutes)
    db.order.count({
      where: {
        User: { clerkId: userId },
        status: 'shipped',
      },
    }),

    // Petal collections (cached for 2 minutes)
    db.petalCollection.count({
      where: {
        userId,
        isAuthenticated: true,
      },
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
      User: { clerkId: userId },
      status: 'shipped',
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
  });

  // Extract categories from purchase history
  const purchasedCategories = userOrders
    .flatMap((order) => order.OrderItem)
    .map((item) => item.Product.category)
    .filter((category): category is string => Boolean(category));

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
  });
}
