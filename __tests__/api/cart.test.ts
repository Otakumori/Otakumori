import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { GET as getCart, POST as updateCart } from '@/app/api/v1/cart/route';

// Mock Clerk auth
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}));

// Mock Prisma
jest.mock('@/lib/db', () => ({
  db: {
    cartItem: {
      findMany: jest.fn(),
      upsert: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
    },
  },
}));

describe('Cart API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/cart', () => {
    it('should return cart items for authenticated user', async () => {
      const mockAuth = auth as any;
      mockAuth.mockResolvedValue({ userId: 'user_123' });

      // Use the already-mocked db object directly, no need to import dynamically
      const mockDb = require('@/lib/db');
      (mockDb.db.cartItem.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'cart_1',
          productId: 'prod_1',
          variantId: 'var_1',
          quantity: 2,
          product: {
            id: 'prod_1',
            name: 'Test Product',
            variants: [{ id: 'var_1', name: 'Small' }],
          },
        },
      ]);

      const req = new NextRequest('http://localhost/api/v1/cart');
      const response = await getCart(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.ok).toBe(true);
      expect(data.data).toHaveLength(1);
      expect(data.data[0].productId).toBe('prod_1');
    });

    it('should return 401 for unauthenticated user', async () => {
      const mockAuth = auth as any;
      mockAuth.mockResolvedValue({ userId: null });

      const req = new NextRequest('http://localhost/api/v1/cart');
      const response = await getCart(req);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.ok).toBe(false);
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('POST /api/v1/cart', () => {
    it('should add item to cart for authenticated user', async () => {
      const mockAuth = auth as any;
      mockAuth.mockResolvedValue({ userId: 'user_123' });

      const mockDb = await import('@/lib/db');
      (mockDb.db.product.findUnique as any).mockResolvedValue({
        id: 'prod_1',
        name: 'Test Product',
        variants: [{ id: 'var_1', name: 'Small' }],
      });
      (mockDb.db.cartItem.upsert as jest.Mock).mockResolvedValue({
        id: 'cart_1',
        productId: 'prod_1',
        variantId: 'var_1',
        quantity: 2,
        product: {
          id: 'prod_1',
          name: 'Test Product',
          variants: [{ id: 'var_1', name: 'Small' }],
        },
      });

      const req = new NextRequest('http://localhost/api/v1/cart', {
        method: 'POST',
        body: JSON.stringify({
          productId: 'prod_1',
          variantId: 'var_1',
          quantity: 2,
        }),
      });
      const response = await updateCart(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.ok).toBe(true);
      expect(data.data.productId).toBe('prod_1');
      expect(data.data.quantity).toBe(2);
    });

    it('should return 404 for non-existent product', async () => {
      const mockAuth = auth as any;
      mockAuth.mockResolvedValue({ userId: 'user_123' });

      const mockDb = await import('@/lib/db');
      (mockDb.db.product.findUnique as any).mockResolvedValue(null);

      const req = new NextRequest('http://localhost/api/v1/cart', {
        method: 'POST',
        body: JSON.stringify({
          productId: 'nonexistent',
          quantity: 1,
        }),
      });
      const response = await updateCart(req);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.ok).toBe(false);
      expect(data.error).toBe('Product not found');
    });
  });
});
