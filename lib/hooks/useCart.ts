/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import { useState } from 'react';

export function useCart() {
  const [items, setItems] = useState<any[]>([]);
  const addToCart = (item: any) => setItems(prev => [...prev, item]);
  const removeFromCart = (id: string) => setItems(prev => prev.filter(i => i.id !== id));
  return { items, addToCart, removeFromCart };
}
