'use client';

import { logger } from '@/app/lib/logger';
import React, { createContext, useContext, useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import {
  areCartItemsEqual,
  getCartSignature,
  getLineKey,
  MAX_LOCAL_CART_BYTES,
  normalizeServerCartItems,
  reconcileCartItems,
  safeCartItems,
  type CartItem,
} from '@/lib/cart/reconciliation';

interface CartContextType {
  items: CartItem[];
  total: number;
  itemCount: number;
  addItem: (_item: CartItem) => void;
  removeItem: (_lineKey: string) => void;
  updateQuantity: (_lineKey: string, _quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartAuthState {
  isSignedIn: boolean;
  userId: string | null | undefined;
}

export function CartProvider({
  children,
  authState,
}: {
  children: React.ReactNode;
  authState?: CartAuthState;
}) {
  if (authState) {
    return <CartProviderInner authState={authState}>{children}</CartProviderInner>;
  }

  return <ClerkCartProvider>{children}</ClerkCartProvider>;
}

function ClerkCartProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, userId } = useAuth();
  return <CartProviderInner authState={{ isSignedIn: Boolean(isSignedIn), userId }}>{children}</CartProviderInner>;
}

function CartProviderInner({ children, authState }: { children: React.ReactNode; authState: CartAuthState }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hasLoadedLocal, setHasLoadedLocal] = useState(false);
  const { isSignedIn, userId } = authState;
  const hasHydratedServerRef = useRef(false);
  const lastSyncedSignatureRef = useRef<string>('');

  const syncItems = useCallback(async (cartItems: CartItem[]) => {
    if (!userId || cartItems.length === 0) return;
    const payloadItems = safeCartItems(cartItems);
    const signature = getCartSignature(payloadItems);
    if (signature === lastSyncedSignatureRef.current) return;
    lastSyncedSignatureRef.current = signature;
    await syncCartToPrisma(payloadItems);
  }, [userId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        if (savedCart.length > MAX_LOCAL_CART_BYTES) {
          localStorage.removeItem('cart');
        } else {
          setItems(safeCartItems(JSON.parse(savedCart)));
        }
      } catch (error) {
        logger.error('Error parsing cart from localStorage:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
        localStorage.removeItem('cart');
      }
    }
    setHasLoadedLocal(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedLocal || !isSignedIn || !userId || hasHydratedServerRef.current) return;

    let cancelled = false;

    const hydrateFromServer = async () => {
      try {
        const response = await fetch('/api/v1/cart');
        if (!response.ok) throw new Error('Failed to fetch server cart');

        const result = await response.json();
        if (!result.ok) throw new Error(result.error || 'Failed to fetch server cart');

        const serverItems = normalizeServerCartItems(Array.isArray(result.data) ? result.data : []);
        if (cancelled) return;

        hasHydratedServerRef.current = true;
        setItems((currentItems) => {
          const mergedItems = reconcileCartItems(serverItems, currentItems);
          return areCartItemsEqual(mergedItems, currentItems) ? currentItems : mergedItems;
        });
      } catch (error) {
        logger.error('Failed to hydrate cart from server:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
        hasHydratedServerRef.current = true;
      }
    };

    void hydrateFromServer();

    return () => {
      cancelled = true;
    };
  }, [hasLoadedLocal, isSignedIn, userId]);

  useEffect(() => {
    if (!isSignedIn || !userId || !hasHydratedServerRef.current || items.length === 0) return;
    const timeout = window.setTimeout(() => {
      syncItems(items).catch((error) => {
        logger.error('Failed to sync cart to Prisma:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
      });
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [isSignedIn, userId, items, syncItems]);

  useEffect(() => {
    if (typeof window === 'undefined' || !hasLoadedLocal) return;
    localStorage.setItem('cart', JSON.stringify(safeCartItems(items)));
  }, [items, hasLoadedLocal]);

  const total = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);
  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  const addItem = useCallback((newItem: CartItem) => {
    setItems((currentItems) => {
      const safeNewItem = safeCartItems([newItem])[0];
      if (!safeNewItem) return currentItems;
      const newLineKey = getLineKey(safeNewItem);
      const existingItem = currentItems.find((item) => getLineKey(item) === newLineKey);

      if (existingItem) {
        return currentItems.map((item) => getLineKey(item) === newLineKey ? { ...item, quantity: Math.min(item.quantity + safeNewItem.quantity, 99) } : item);
      }

      return safeCartItems([...currentItems, safeNewItem]);
    });
  }, []);

  const removeItem = useCallback((lineKey: string) => {
    setItems((currentItems) => currentItems.filter((item) => getLineKey(item) !== lineKey));
  }, []);

  const updateQuantity = useCallback((lineKey: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(lineKey);
      return;
    }
    setItems((currentItems) => currentItems.map((item) => (getLineKey(item) === lineKey ? { ...item, quantity: Math.min(quantity, 99) } : item)));
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
    lastSyncedSignatureRef.current = '';
    if (typeof window !== 'undefined') localStorage.removeItem('cart');
  }, []);

  const value = useMemo(() => ({ items, total, itemCount, addItem, removeItem, updateQuantity, clearCart }), [items, total, itemCount, addItem, removeItem, updateQuantity, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider. Make sure the component is wrapped with CartProvider and has "use client" directive.');
  }
  return context;
}

async function syncCartToPrisma(cartItems: CartItem[]) {
  try {
    const response = await fetch('/api/v1/cart/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cartItems.map((item) => ({ productId: item.id, variantId: item.selectedVariant?.id, quantity: item.quantity })),
      }),
    });

    if (!response.ok) throw new Error('Failed to sync cart');

    const result = await response.json();
    if (!result.ok) throw new Error(result.error || 'Failed to sync cart');
  } catch (error) {
    logger.error('Cart sync error:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
  }
}
