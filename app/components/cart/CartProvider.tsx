'use client';

import { logger } from '@/app/lib/logger';
import React, { createContext, useContext, useState, useEffect, useMemo, useRef, useCallback } from 'react';
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
  };
  variant?: {
    id?: string;
    title?: string | null;
    priceCents?: number | null;
  };
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const MAX_CART_ITEMS = 50;
const MAX_LOCAL_CART_BYTES = 150_000;

function getLineKey(item: CartItem) {
  return `${item.id}::${item.selectedVariant?.id ?? 'default'}`;
}

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<CartItem>;
  return (
    typeof item.id === 'string' &&
    typeof item.name === 'string' &&
    typeof item.price === 'number' &&
    Number.isFinite(item.price) &&
    typeof item.quantity === 'number' &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0
  );
}

function safeCartItems(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(isCartItem)
    .slice(0, MAX_CART_ITEMS)
    .map((item) => ({
      ...item,
      quantity: Math.min(Math.max(item.quantity, 1), 99),
      image: typeof item.image === 'string' && item.image.length < 1000 ? item.image : '/placeholder-product.jpg',
    }));
}

function getCartSignature(cartItems: CartItem[]) {
  return JSON.stringify(cartItems.map((item) => ({ id: item.id, variantId: item.selectedVariant?.id ?? null, quantity: item.quantity })));
}

function areCartItemsEqual(a: CartItem[], b: CartItem[]) {
  return getCartSignature(a) === getCartSignature(b);
}

function reconcileCartItems(serverItems: CartItem[], localItems: CartItem[]) {
  const merged = new Map<string, CartItem>();

  for (const item of serverItems) merged.set(getLineKey(item), item);

  for (const item of localItems) {
    const lineKey = getLineKey(item);
    const existing = merged.get(lineKey);
    merged.set(lineKey, existing ? { ...existing, quantity: Math.max(existing.quantity, item.quantity), price: item.price || existing.price, image: item.image || existing.image, name: item.name || existing.name, selectedVariant: item.selectedVariant || existing.selectedVariant } : item);
  }

  return safeCartItems(Array.from(merged.values()));
}

function normalizeServerCartItems(serverItems: ServerCartItem[]): CartItem[] {
  return safeCartItems(serverItems.map((item) => ({
    id: item.productId,
    name: item.product?.title || item.product?.name || 'Product',
    price: item.variant?.priceCents != null ? item.variant.priceCents / 100 : 0,
    quantity: item.quantity,
    image: item.product?.image || '/placeholder-product.jpg',
    selectedVariant: item.variantId ? { id: item.variantId, title: item.variant?.title || 'Variant' } : undefined,
  })));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hasLoadedLocal, setHasLoadedLocal] = useState(false);
  const { isSignedIn, userId } = useAuth();
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
