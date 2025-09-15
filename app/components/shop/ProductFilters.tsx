// DEPRECATED: This component is a duplicate. Use components\shop\ProductFilters.tsx instead.
'use client';

import { useState } from 'react';

type Props = {
  onFilterChange: (filters: { q?: string; tag?: string }) => void;
};

export default function ProductFilters({ onFilterChange }: Props) {
  const [q, setQ] = useState('');
  const [tag, setTag] = useState('');

  return (
    <div className="rounded-2xl p-4 bg-white/10 backdrop-blur">
      <label htmlFor="product-filters-q" className="block text-sm mb-2 opacity-80">
        Search
      </label>
      <input
        id="product-filters-q"
        name="q"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onFilterChange({ q, tag });
        }}
        placeholder="Whatt're ya buyin'?"
        className="w-full mb-4 rounded-xl px-3 py-2 bg-white/5 outline-none"
      />
      <label htmlFor="product-filters-tag" className="block text-sm mb-2 opacity-80">
        Tag
      </label>
      <input
        id="product-filters-tag"
        name="tag"
        value={tag}
        onChange={(e) => setTag(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onFilterChange({ q, tag });
        }}
        placeholder="tops, pins, etc."
        className="w-full rounded-xl px-3 py-2 bg-white/5 outline-none"
      />
      <button
        onClick={() => onFilterChange({ q, tag })}
        className="mt-4 w-full rounded-xl px-3 py-2 bg-white/20 hover:bg-white/30 transition"
      >
        Apply Filters
      </button>
    </div>
  );
}
