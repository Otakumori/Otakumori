'use client';

import { useMemo } from 'react';
import { avatarPartManager } from '@/app/lib/3d/avatar-parts';
import type { PartSelectorProps } from './types';

export function PartSelector({
  label,
  partType,
  currentPartId,
  onPartChange,
  showNsfwContent,
  searchQuery = '',
  selectedCategory = 'all',
  resolveParts,
}: PartSelectorProps) {
  const parts = useMemo(() => {
    if (resolveParts) {
      return resolveParts(partType);
    }
    const allParts = avatarPartManager.getPartsByType(partType);
    return allParts.filter((part) => {
      const matchesSearch =
        searchQuery === '' ||
        part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        part.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'all' ||
        part.category === selectedCategory ||
        (selectedCategory === 'nsfw' && part.contentRating !== 'sfw');

      const matchesContent =
        part.contentRating === 'sfw' ||
        (part.contentRating === 'nsfw' && showNsfwContent) ||
        (part.contentRating === 'explicit' && showNsfwContent);

      return matchesSearch && matchesCategory && matchesContent;
    });
  }, [partType, resolveParts, showNsfwContent, searchQuery, selectedCategory]);

  return (
    <div className="space-y-2">
      <label className="text-sm text-white/80">{label}</label>
      <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
        {parts.map((part) => (
          <button
            key={part.id}
            onClick={() => onPartChange(part.id)}
            className={`p-2 rounded-lg border transition-all ${
              currentPartId === part.id
                ? 'border-pink-500 bg-pink-500/20 text-pink-100'
                : 'border-white/20 bg-white/5 hover:bg-white/10 text-white/80'
            }`}
          >
            <div className="text-xs font-medium truncate">{part.name}</div>
            <div className="text-xs text-white/60 capitalize">{part.contentRating}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

