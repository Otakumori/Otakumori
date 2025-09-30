import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';
import { env } from '@/env.mjs';

// Database singleton for server-side use only
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: env.DATABASE_URL,
      },
    },
    log: ['query', 'error', 'warn'],
    errorFormat: 'pretty',
  });

if (globalThis.process?.env?.NODE_ENV !== 'production') globalForPrisma.prisma = db;

// Server-side database access utilities
export class DatabaseAccess {
  /**
   * Get the current authenticated user ID from Clerk
   * @throws Error if not authenticated
   */
  static async getCurrentUserId(): Promise<string> {
    const { userId } = await auth();
    if (!userId) {
      throw new Error('Authentication required');
    }
    return userId;
  }

  /**
   * Get the current authenticated user from the database
   * @throws Error if not authenticated or user not found
   */
  static async getCurrentUser() {
    const userId = await this.getCurrentUserId();
    const user = await db.user.findUnique({
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
    });

    if (!user) {
      throw new Error('User not found in database');
    }

    return user;
  }

  /**
   * Create or update a user record from Clerk data
   */
  static async upsertUserFromClerk(clerkUser: any) {
    return await db.user.upsert({
      where: { clerkId: clerkUser.id },
      update: {
        email: clerkUser.emailAddresses[0]?.emailAddress || undefined,
        username: clerkUser.username || undefined,
        display_name:
          clerkUser.firstName && clerkUser.lastName
            ? `${clerkUser.firstName} ${clerkUser.lastName}`
            : undefined,
        avatarUrl: clerkUser.imageUrl || undefined,
      },
      create: {
        clerkId: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        username: clerkUser.username || `user_${clerkUser.id.slice(0, 8)}`,
        display_name:
          clerkUser.firstName && clerkUser.lastName
            ? `${clerkUser.firstName} ${clerkUser.lastName}`
            : undefined,
        avatarUrl: clerkUser.imageUrl || undefined,
      },
    });
  }

  /**
   * Get user's cart items
   */
  static async getUserCart(userId: string) {
    // For now, we'll use a simple cart implementation
    // In the future, this could be moved to a proper cart table
    return [];
  }

  /**
   * Create an order from cart items
   */
  static async createOrder(userId: string, items: any[], stripeSessionId: string) {
    const user = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Calculate totals
    const subtotalCents = items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
    const totalAmount = subtotalCents;

    // Create order
    const order = await db.order.create({
      data: {
        id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: user.id,
        stripeId: stripeSessionId,
        totalAmount,
        subtotalCents,
        currency: 'USD',
        status: 'pending',
        primaryItemName: items[0]?.name || 'Order',
        updatedAt: new Date(),
      },
    });

    // Create order items
    for (const item of items) {
      await db.orderItem.create({
        data: {
          id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          orderId: order.id,
          productId: item.productId,
          productVariantId: item.variantId,
          sku: item.sku || `SKU-${item.productId}`,
          name: item.name,
          quantity: item.quantity,
          unitAmount: item.priceCents,
          printifyProductId: item.printifyProductId,
          printifyVariantId: item.printifyVariantId,
        },
      });
    }

    return order;
  }

  /**
   * Get user's orders
   */
  static async getUserOrders(userId: string) {
    const user = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return await db.order.findMany({
      where: { userId: user.id },
      include: {
        OrderItem: {
          include: {
            Product: true,
            ProductVariant: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get product by ID with variants
   */
  static async getProduct(productId: string) {
    return await db.product.findUnique({
      where: { id: productId },
      include: {
        ProductVariant: {
          where: { isEnabled: true, inStock: true },
        },
      },
    });
  }

  /**
   * Get all active products with variants
   */
  static async getActiveProducts() {
    return await db.product.findMany({
      where: { active: true },
      include: {
        ProductVariant: {
          where: { isEnabled: true, inStock: true },
        },
      },
    });
  }

  /**
   * Search products by query
   */
  static async searchProducts(query: string) {
    const searchTerm = query.toLowerCase().trim();

    return await db.product.findMany({
      where: {
        active: true,
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      include: {
        ProductVariant: {
          where: { isEnabled: true, inStock: true },
        },
      },
    });
  }
}
