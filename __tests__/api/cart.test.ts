import { vi } from 'vitest';
import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { GET as getCart, POST as updateCart } from '@/app/api/v1/cart/route';

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock Prisma
vi.mock('@/lib/db', () => ({
  db: {
    cart: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    cartItem: {
      upsert: vi.fn(),
    },
    product: {
      findUnique: vi.fn(),
    },
  },
}));

describe('Cart API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/v1/cart', () => {
    it('should return cart items for authenticated user', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user_123' } as any);
      vi.mocked(db.cart.findUnique).mockResolvedValue({
        id: 'cart_1',
        userId: 'user_123',
        CartItem: [
          {
            id: 'item_1',
            productId: 'prod_1',
            productVariantId: 'var_1',
            quantity: 2,
            Product: {
              id: 'prod_1',
              name: 'Test Product',
              primaryImageUrl: null,
            },
            ProductVariant: {
              id: 'var_1',
              title: 'Small',
              priceCents: 2500,
            },
          },
        ],
      } as any);

      const req = new NextRequest('http://localhost/api/v1/cart');
      const response = await getCart(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.ok).toBe(true);
      expect(data.data).toHaveLength(1);
      expect(data.data[0].productId).toBe('prod_1');
    });

    it('should return 401 for unauthenticated user', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);

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
      vi.mocked(auth).mockResolvedValue({ userId: 'user_123' } as any);
      vi.mocked(db.product.findUnique).mockResolvedValue({
        id: 'prod_1',
        name: 'Test Product',
        description: null,
        primaryImageUrl: null,
        active: true,
        visible: true,
        printifyProductId: 'printify_prod_1',
        integrationRef: 'printify:printify_prod_1',
        ProductVariant: [
          {
            id: 'var_1',
            productId: 'prod_1',
            title: 'Small',
            sku: 'SKU-1',
            priceCents: 2500,
            currency: 'USD',
            isEnabled: true,
            inStock: true,
            printifyVariantId: 101,
            providerVariantId: '101',
          },
        ],
      } as any);
      vi.mocked(db.cart.findUnique).mockResolvedValue({
        id: 'cart_1',
        userId: 'user_123',
      } as any);
      vi.mocked(db.cartItem.upsert).mockResolvedValue({
        id: 'item_1',
        productId: 'prod_1',
        productVariantId: 'var_1',
        quantity: 2,
        Product: {
          id: 'prod_1',
          name: 'Test Product',
          primaryImageUrl: null,
        },
        ProductVariant: {
          id: 'var_1',
          title: 'Small',
          priceCents: 2500,
        },
      } as any);

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

    it('rejects hidden products before cart persistence', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user_123' } as any);
      vi.mocked(db.product.findUnique).mockResolvedValue({
        id: 'prod_1',
        name: 'Hidden Product',
        active: true,
        visible: false,
        printifyProductId: 'printify_prod_1',
        integrationRef: 'printify:printify_prod_1',
        ProductVariant: [
          {
            id: 'var_1',
            productId: 'prod_1',
            isEnabled: true,
            inStock: true,
            priceCents: 2500,
            currency: 'USD',
            printifyVariantId: 101,
          },
        ],
      } as any);

      const req = new NextRequest('http://localhost/api/v1/cart', {
        method: 'POST',
        body: JSON.stringify({ productId: 'prod_1', variantId: 'var_1', quantity: 1 }),
      });
      const response = await updateCart(req);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.code).toBe('PRODUCT_NOT_PUBLIC');
      expect(db.cartItem.upsert).not.toHaveBeenCalled();
    });

    it('rejects non-Printify products before cart persistence', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user_123' } as any);
      vi.mocked(db.product.findUnique).mockResolvedValue({
        id: 'prod_1',
        name: 'Merchize Product',
        active: true,
        visible: true,
        printifyProductId: null,
        integrationRef: 'merchize:mz_1',
        ProductVariant: [
          {
            id: 'var_1',
            productId: 'prod_1',
            isEnabled: true,
            inStock: true,
            priceCents: 2500,
            currency: 'USD',
            printifyVariantId: null,
            providerVariantId: 'MZ-1',
          },
        ],
      } as any);

      const req = new NextRequest('http://localhost/api/v1/cart', {
        method: 'POST',
        body: JSON.stringify({ productId: 'prod_1', variantId: 'var_1', quantity: 1 }),
      });
      const response = await updateCart(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.code).toBe('UNSUPPORTED_PROVIDER');
      expect(db.cartItem.upsert).not.toHaveBeenCalled();
    });

    it('should return 404 for non-existent product', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user_123' } as any);
      vi.mocked(db.product.findUnique).mockResolvedValue(null);

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
