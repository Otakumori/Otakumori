import { useState } from 'react';

export function useWishlist() {
  const [items, setItems] = useState<any[]>([]);
  const addToWishlist = (item: any) => setItems(prev => [...prev, item]);
  const removeFromWishlist = (id: string) => setItems(prev => prev.filter(i => i.id !== id));
  return { items, addToWishlist, removeFromWishlist };
}
