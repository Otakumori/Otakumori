'use client';

import { useState } from 'react';
import { Palette } from 'lucide-react';
import { cosmeticItems, type CosmeticItem } from '@/app/lib/cosmetics/cosmeticsConfig';

export default function CosmeticsPageClient() {
  const [cosmetics] = useState<CosmeticItem[]>(cosmeticItems);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterRarity, setFilterRarity] = useState<string>('all');

  const filteredCosmetics = cosmetics.filter((item) => {
    if (filterType !== 'all' && item.type !== filterType) return false;
    if (filterRarity !== 'all' && item.rarity !== filterRarity) return false;
    return true;
  });

  const typeCounts = cosmetics.reduce(
    (acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const rarityCounts = cosmetics.reduce(
    (acc, item) => {
      const rarity = item.rarity || 'common';
      acc[rarity] = (acc[rarity] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const nsfwCount = cosmetics.filter(
    (item) => item.contentRating && item.contentRating !== 'sfw',
  ).length;

  return (
    <div className="p-6">
      <h1 className="mb-1 text-3xl font-bold text-white flex items-center gap-2">
        <Palette className="h-8 w-8 text-purple-400" />
        Cosmetics Configuration
      </h1>
      <p className="mb-6 text-neutral-300">
        View and manage cosmetics config, costs, rarity, and NSFW flags
      </p>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-white/10 bg-black/50 p-4">
          <div className="text-sm text-neutral-400 mb-1">Total Cosmetics</div>
          <div className="text-2xl font-bold text-white">{cosmetics.length}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/50 p-4">
          <div className="text-sm text-neutral-400 mb-1">NSFW Items</div>
          <div className="text-2xl font-bold text-pink-400">{nsfwCount}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/50 p-4">
          <div className="text-sm text-neutral-400 mb-1">Total Petal Cost</div>
          <div className="text-2xl font-bold text-green-400">
            {cosmetics.reduce((sum, item) => sum + item.costPetals, 0).toLocaleString()}
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/50 p-4">
          <div className="text-sm text-neutral-400 mb-1">Avg Cost</div>
          <div className="text-2xl font-bold text-cyan-400">
            {Math.round(
              cosmetics.reduce((sum, item) => sum + item.costPetals, 0) / cosmetics.length,
            ).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="rounded-lg border border-white/10 bg-black/50 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          <option value="all">All Types</option>
          {Object.keys(typeCounts).map((type) => (
            <option key={type} value={type}>
              {type} ({typeCounts[type]})
            </option>
          ))}
        </select>
        <select
          value={filterRarity}
          onChange={(e) => setFilterRarity(e.target.value)}
          className="rounded-lg border border-white/10 bg-black/50 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          <option value="all">All Rarities</option>
          {Object.keys(rarityCounts).map((rarity) => (
            <option key={rarity} value={rarity}>
              {rarity} ({rarityCounts[rarity]})
            </option>
          ))}
        </select>
      </div>

      {/* Cosmetics List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCosmetics.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-white/10 bg-black/50 p-4 hover:border-pink-500/50 transition-colors"
          >
            <div className="mb-2 flex items-start justify-between">
              <h3 className="font-semibold text-white">{item.name}</h3>
              {item.contentRating && item.contentRating !== 'sfw' && (
                <span className="rounded bg-pink-700 px-2 py-0.5 text-xs text-pink-200">
                  {item.contentRating}
                </span>
              )}
            </div>
            <p className="mb-3 text-sm text-neutral-400">{item.description}</p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded bg-neutral-700 px-2 py-1 text-neutral-300">{item.type}</span>
              {item.rarity && (
                <span
                  className={`rounded px-2 py-1 ${
                    item.rarity === 'legendary'
                      ? 'bg-yellow-500/20 text-yellow-300'
                      : item.rarity === 'rare'
                        ? 'bg-blue-500/20 text-blue-300'
                        : 'bg-neutral-600 text-neutral-300'
                  }`}
                >
                  {item.rarity}
                </span>
              )}
              <span className="rounded bg-green-500/20 px-2 py-1 text-green-300">
                {item.costPetals.toLocaleString()} petals
              </span>
            </div>
          </div>
        ))}
      </div>

      {filteredCosmetics.length === 0 && (
        <div className="rounded-xl border border-white/10 bg-black/50 p-8 text-center text-neutral-400">
          No cosmetics match the selected filters
        </div>
      )}
    </div>
  );
}
