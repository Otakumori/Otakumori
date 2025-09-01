 
 
import React from 'react';

interface AchievementCategoriesProps {
  selectedCategory: string | null;
  onSelectCategory: (_category: string | null) => void;
}

export const AchievementCategories: React.FC<AchievementCategoriesProps> = ({
  selectedCategory,
  onSelectCategory,
}) => (
  <div className="mb-4">
    <span
      className={`mr-2 inline-block cursor-pointer rounded-full px-3 py-1 ${
        selectedCategory === null ? 'bg-pink-500 text-white' : 'bg-pink-100 text-pink-600'
      }`}
      onClick={() => onSelectCategory(null)}
    >
      All
    </span>
    <span className="mr-2 inline-block rounded-full bg-pink-100 px-3 py-1 text-pink-600">
      Community
    </span>
    <span className="inline-block rounded-full bg-pink-100 px-3 py-1 text-pink-600">Special</span>
  </div>
);
