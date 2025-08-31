/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable-line @next/next/no-img-element */
import React from 'react';

interface AchievementSearchProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export const AchievementSearch: React.FC<AchievementSearchProps> = ({
  searchQuery,
  onSearchChange,
}) => (
  <input
    type="text"
    placeholder="Search achievements..."
    value={searchQuery}
    onChange={(e) => onSearchChange(e.target.value)}
    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
  />
);
