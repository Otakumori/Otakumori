'use client';

import { logger } from '@/app/lib/logger';
import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  selectedVariant?: {
    id: string;
    title: string;
  };
}

interface CartContextType {
  items: CartItem[];
  total: number;
  itemCount: number;
  addItem: (_item: CartItem) => void;
  removeItem: (_lineKey: string) => void;
  updateQuantity: (_lineKey: string, _quantity: number) => void;
  clearCart: () => void;
}

interface ServerCartItem {
  productId: string;
  variantId?: string | null;
  quantity: number;
  product?: {
    title?: string;
    name?: string;
    image?: string | null;
    ProductVariant?: Array<{
      id: string;
      title?: string | null;
      priceCents?: number | null;
    }>;
  };
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function getLineKey(item: CartItem) {
  return `${item.id}::${item.selectedVariant?.id ?? 'default'}`;
}

function mergeCartItems(serverItems: CartItem[], localItems: CartItem[]) {
  const merged = new Map<string, CartItem>();

  for (const item of serverItems) {
    merged.set(getLineKey(item), item);
  }

  for (const item of localItems) {
    const lineKey = getLineKey(item);
    const existing = merged.get(lineKey);
    if (existing) {
      merged.set(lineKey, {
        ...existing,
        quantity: existing.quantity + item.quantity,
      });
    } else {
      merged.set(lineKey, item);
    }
  }

  return Array.from(merged.values());
}

function normalizeServerCartItems(serverItems: ServerCartItem[]): CartItem[] {
  return serverItems
    .map((item) => {
      const matchingVariant = item.product?.ProductVariant?.find((variant) => variant.id === item.variantId);
      const price = matchingVariant?.priceCents != null ? matchingVariant.priceCents / 100 : 0;
      return {
        id: item.productId,
        name: item.product?.title || item.product?.name || 'Product',
        price,
        quantity: item.quantity,
        image: item.product?.image || '/placeholder-product.jpg',
        selectedVariant: item.variantId
          ? {
              id: item.variantId,
              title: matchingVariant?.title || 'Variant',
            }
          : undefined,
      };
    })
    .filter((item) => Boolean(item.id && item.name));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hasLoadedLocal, setHasLoadedLocal] = useState(false);
  const { isSignedIn, userId } = useAuth();
  const hasHydratedServerRef = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          setItems(parsedCart);
        } catch (error) {
          logger.error('Error parsing cart from localStorage:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
          localStorage.removeItem('cart');
        }
      }
      setHasLoadedLocal(true);
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedLocal || !isSignedIn || !userId || hasHydratedServerRef.current) {
      return;
    }

    let cancelled = false;

    const hydrateFromServer = async () => {
      try {
        const response = await fetch('/api/v1/cart');
        if (!response.ok) {
          throw new Error('Failed to fetch server cart');
        }

        const result = await response.json();
        if (!result.ok) {
          throw new Error(result.error || 'Failed to fetch server cart');
        }

        const serverItems = normalizeServerCartItems(Array.isArray(result.data) ? result.data : []);

        if (cancelled) return;

        const mergedItems = mergeCartItems(serverItems, items);
        setItems(mergedItems);
        hasHydratedServerRef.current = true;

        if (mergedItems.length > 0) {
          await syncCartToPrisma(userId, mergedItems);
        }
      } catch (error) {
        logger.error('Failed to hydrate cart from server:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
        hasHydratedServerRef.current = true;
      }
    };

    void hydrateFromServer();

    return () => {
      cancelled = true;
    };
  }, [hasLoadedLocal, isSignedIn, userId, items]);

  useEffect(() => {
    if (isSignedIn && userId && hasHydratedServerRef.current && items.length > 0) {
      syncCartToPrisma(userId, items).catch((error) => {
        logger.error('Failed to sync cart to Prisma:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
      });
    }
  }, [isSignedIn, userId, items]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }, [items]);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const addItem = (newItem: CartItem) => {
    setItems((currentItems) => {
      const newLineKey = getLineKey(newItem);
      const existingItem = currentItems.find((item) => getLineKey(item) === newLineKey);

      if (existingItem) {
        return currentItems.map((item) =>
          getLineKey(item) === newLineKey ? { ...item, quantity: item.quantity + newItem.quantity } : item,
        );
      }

      return [...currentItems, newItem];
    });
  };

  const removeItem = (lineKey: string) => {
    setItems((currentItems) => currentItems.filter((item) => getLineKey(item) !== lineKey));
  };

  const updateQuantity = (lineKey: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(lineKey);
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item) => (getLineKey(item) === lineKey ? { ...item, quantity } : item)),
    );
  };

  const clearCart = () => {
    setItems([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cart');
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        total,
        itemCount,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error(
      'useCart must be used within a CartProvider. Make sure the component is wrapped with CartProvider and has "use client" directive.',
    );
  }
  return context;
}

async function syncCartToPrisma(userId: string, cartItems: CartItem[]) {
  try {
    const response = await fetch('/api/v1/cart/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: cartItems.map((item) => ({
          productId: item.id,
          variantId: item.selectedVariant?.id,
          quantity: item.quantity,
        })),
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to sync cart');
    }

    const result = await response.json();
    if (!result.ok) {
      throw new Error(result.error || 'Failed to sync cart');
    }
  } catch (error) {
    logger.error('Cart sync error:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
  }
}
