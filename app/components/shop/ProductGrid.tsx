 
 
'use client';

import { useEffect, useState } from 'react';

type Product = {
  id: string;
  title: string;
  price: number;
  image?: string;
  tags?: string[];
};

export default function ProductGrid() {
  const [items, setItems] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        // Replace with your real products endpoint when ready
        const res = await fetch('/api/products', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to load products');
        const json = await res.json();
        if (!alive) return;
        // expect shape: { ok: true, data: Product[] }
        setItems(json?.data ?? []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-64 rounded-xl animate-pulse bg-white/10" />
        ))}
      </div>
    );
  }

  if (!items || items.length === 0) {
    return <p className="opacity-80">No products found.</p>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((p) => (
        <div key={p.id} className="rounded-2xl p-4 bg-white/10 backdrop-blur">
          {/* swap to next/image when you have URLs */}
          <div className="aspect-square rounded-xl bg-white/10 mb-3" />
          <div className="text-sm opacity-80">{p.tags?.join(' · ')}</div>
          <div className="font-semibold">{p.title}</div>
          <div className="opacity-80">${p.price.toFixed(2)}</div>
        </div>
      ))}
    </div>
  );
}
