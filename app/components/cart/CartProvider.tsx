'use client';

import { logger } from '@/app/lib/logger';
import React, { createContext, useContext, useState, useEffect } from 'react';
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

const CartContext = createContext<CartContextType | undefined>(undefined);

function getLineKey(item: CartItem) {
  return `${item.id}::${item.selectedVariant?.id ?? 'default'}`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const { isSignedIn, userId } = useAuth();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          setItems(parsedCart);
          updateTotals(parsedCart);
        } catch (error) {
          logger.error('Error parsing cart from localStorage:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
          localStorage.removeItem('cart');
        }
      }
    }
  }, []);

  useEffect(() => {
    if (isSignedIn && userId && items.length > 0) {
      syncCartToPrisma(userId, items).catch((error) => {
        logger.error('Failed to sync cart to Prisma:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
      });
    }
  }, [isSignedIn, userId, items.length]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(items));
    }
    updateTotals(items);
  }, [items]);

  const updateTotals = (cartItems: CartItem[]) => {
    const newTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const newItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    setTotal(newTotal);
    setItemCount(newItemCount);
  };

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
    setTotal(0);
    setItemCount(0);
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
