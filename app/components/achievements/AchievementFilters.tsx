 
 
import React from 'react';
interface AchievementFiltersProps {
  showUnlocked: boolean;
  showLocked: boolean;
  showHidden: boolean;
  onToggleUnlocked: () => void;
  onToggleLocked: () => void;
  onToggleHidden: () => void;
}
export const AchievementFilters: React.FC<AchievementFiltersProps> = ({
  showUnlocked,
  showLocked,
  showHidden,
  onToggleUnlocked,
  onToggleLocked,
  onToggleHidden,
}) => (
  <div className="mb-4 flex space-x-2">
    <button
      onClick={onToggleUnlocked}
      className={`rounded px-3 py-1 ${showUnlocked ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-700'}`}
    >
      Unlocked
    </button>
    <button
      onClick={onToggleLocked}
      className={`rounded px-3 py-1 ${showLocked ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-700'}`}
    >
      Locked
    </button>
    <button
      onClick={onToggleHidden}
      className={`rounded px-3 py-1 ${showHidden ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-700'}`}
    >
      Hidden
    </button>
  </div>
);
