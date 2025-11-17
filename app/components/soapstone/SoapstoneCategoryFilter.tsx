'use client';

import { type SoapstoneCategory } from '@/app/lib/soapstone-enhancements';
import { getCategoryInfo } from '@/app/lib/soapstone-enhancements';

interface SoapstoneCategoryFilterProps {
  selectedCategory: SoapstoneCategory | 'all';
  onCategoryChange: (category: SoapstoneCategory | 'all') => void;
}

/**
 * Filter component for soapstone message categories
 */
export function SoapstoneCategoryFilter({
  selectedCategory,
  onCategoryChange,
}: SoapstoneCategoryFilterProps) {
  const categories: (SoapstoneCategory | 'all')[] = [
    'all',
    'tip',
    'warning',
    'secret',
    'praise',
    'joke',
    'general',
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {categories.map((category) => {
        const info = category === 'all' 
          ? { label: 'All', icon: '💬', color: 'text-white' }
          : getCategoryInfo(category);

        return (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-pink-500/30 text-pink-300 border border-pink-500/50'
                : 'bg-white/10 text-white/70 hover:bg-white/20 border border-white/20'
            }`}
          >
            <span className="mr-2">{info.icon}</span>
            {info.label}
          </button>
        );
      })}
    </div>
  );
}

