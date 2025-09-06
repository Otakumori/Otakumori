'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

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
  removeItem: (_id: string) => void;
  updateQuantity: (_id: string, _quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [itemCount, setItemCount] = useState(0);

  useEffect(() => {
    // Load cart from localStorage on mount (client-side only)
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          setItems(parsedCart);
          updateTotals(parsedCart);
        } catch (error) {
          console.error('Error parsing cart from localStorage:', error);
          localStorage.removeItem('cart');
        }
      }
    }
  }, []);

  useEffect(() => {
    // Save cart to localStorage whenever it changes (client-side only)
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
      const existingItem = currentItems.find(
        (item) =>
          item.id === newItem.id &&
          (!item.selectedVariant ||
            !newItem.selectedVariant ||
            item.selectedVariant.id === newItem.selectedVariant.id),
      );

      if (existingItem) {
        return currentItems.map((item) =>
          item.id === existingItem.id
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item,
        );
      }

      return [...currentItems, newItem];
    });
  };

  const removeItem = (id: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(id);
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item) => (item.id === id ? { ...item, quantity } : item)),
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
