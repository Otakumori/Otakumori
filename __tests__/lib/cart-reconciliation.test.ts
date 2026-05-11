import { describe, expect, it } from 'vitest';
import {
  getCartCheckoutReadiness,
  normalizeServerCartItems,
  reconcileCartItems,
  type CartItem,
  type ServerCartItem,
} from '@/lib/cart/reconciliation';

const localPoster: CartItem = {
  id: 'poster-1',
  name: 'Local Poster',
  price: 22,
  quantity: 2,
  image: '/poster.jpg',
  selectedVariant: { id: 'matte', title: 'Matte' },
};

const serverPoster: ServerCartItem = {
  productId: 'poster-1',
  variantId: 'matte',
  quantity: 1,
  product: { title: 'Server Poster', image: '/server-poster.jpg' },
  variant: { id: 'matte', title: 'Matte', priceCents: 2000 },
};

describe('cart reconciliation transitions', () => {
  it('guest -> signed-in: hydrates server cart and preserves the local guest line', () => {
    const serverItems = normalizeServerCartItems([
      {
        productId: 'shirt-1',
        variantId: 'large',
        quantity: 1,
        product: { title: 'Server Shirt', image: '/shirt.jpg' },
        variant: { id: 'large', title: 'Large', priceCents: 3000 },
      },
    ]);

    const next = reconcileCartItems(serverItems, [localPoster]);

    expect(next).toEqual([
      {
        id: 'shirt-1',
        name: 'Server Shirt',
        price: 30,
        quantity: 1,
        image: '/shirt.jpg',
        selectedVariant: { id: 'large', title: 'Large' },
      },
      localPoster,
    ]);
  });

  it('server stale -> local newer: keeps the newer local quantity for the same line', () => {
    const serverItems = normalizeServerCartItems([serverPoster]);

    const next = reconcileCartItems(serverItems, [localPoster]);

    expect(next).toHaveLength(1);
    expect(next[0]).toMatchObject({
      id: 'poster-1',
      quantity: 2,
      price: 22,
      image: '/poster.jpg',
      name: 'Local Poster',
      selectedVariant: { id: 'matte', title: 'Matte' },
    });
  });

  it('variant missing -> checkout blocked: reports the exact line that needs options', () => {
    const next = reconcileCartItems([], [
      {
        id: 'hoodie-1',
        name: 'Hoodie',
        price: 48,
        quantity: 1,
        image: '/hoodie.jpg',
      },
    ]);

    expect(getCartCheckoutReadiness(next)).toEqual({
      ready: false,
      issues: [
        {
          lineKey: 'hoodie-1::default',
          code: 'missing_variant',
          message: 'Hoodie needs a selected variant before checkout.',
        },
      ],
    });
  });
});
