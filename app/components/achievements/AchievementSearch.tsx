import type { ChangeEventHandler, FC } from "react";

interface AchievementSearchProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export const AchievementSearch: FC<AchievementSearchProps> = ({ searchQuery, onSearchChange }) => {
  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    onSearchChange(event.target.value);
  };

  return (
    <input
      type="search"
      placeholder="Search achievements..."
      value={searchQuery}
      onChange={handleChange}
      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
    />
  );
};