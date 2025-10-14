'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'otm_recently_viewed';
const MAX_ITEMS = 10;

export interface RecentlyViewedProduct {
  id: string;
  title: string;
  image: string;
  price: number;
  viewedAt: number;
}

export function useRecentlyViewed() {
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedProduct[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setRecentlyViewed(parsed);
      } catch (err) {
        console.error('Failed to parse recently viewed:', err);
      }
    }
  }, []);

  const addProduct = (product: Omit<RecentlyViewedProduct, 'viewedAt'>) => {
    setRecentlyViewed((prev) => {
      // Remove if already exists
      const filtered = prev.filter((p) => p.id !== product.id);

      // Add to front with current timestamp
      const updated = [{ ...product, viewedAt: Date.now() }, ...filtered].slice(0, MAX_ITEMS);

      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      return updated;
    });
  };

  const clearAll = () => {
    setRecentlyViewed([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    recentlyViewed,
    addProduct,
    clearAll,
  };
}
