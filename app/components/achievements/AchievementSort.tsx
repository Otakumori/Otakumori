import React from 'react';

interface AchievementSortProps {
  sortBy: string;
  onSortChange: (value: 'name' | 'date' | 'category' | 'progress') => void;
}

export const AchievementSort: React.FC<AchievementSortProps> = ({ sortBy, onSortChange }) => (
  <div className="mb-4">
    <label className="mr-2">Sort by:</label>
    <select
      value={sortBy}
      onChange={(e) => onSortChange(e.target.value as 'name' | 'date' | 'category' | 'progress')}
      className="rounded border px-2 py-1"
      aria-label="Select"
    >
      <option value="name">Name</option>
      <option value="date">Date</option>
      <option value="category">Category</option>
      <option value="progress">Progress</option>
    </select>
  </div>
);
