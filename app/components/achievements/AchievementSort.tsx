import type { ChangeEventHandler, FC } from 'react';

type SortOption = 'name' | 'date' | 'category' | 'progress';

interface AchievementSortProps {
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
}

const OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: 'name', label: 'Name' },
  { value: 'date', label: 'Date' },
  { value: 'category', label: 'Category' },
  { value: 'progress', label: 'Progress' },
];

export const AchievementSort: FC<AchievementSortProps> = ({ sortBy, onSortChange }) => {
  const handleChange: ChangeEventHandler<HTMLSelectElement> = (event) => {
    onSortChange(event.target.value as SortOption);
  };

  return (
    <div className="mb-4">
      <label htmlFor="achievement-sort" className="mr-2 text-sm font-medium text-gray-600">
        Sort by:
      </label>
      <select
        id="achievement-sort"
        value={sortBy}
        onChange={handleChange}
        className="rounded border px-2 py-1 text-sm"
      >
        {OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};
