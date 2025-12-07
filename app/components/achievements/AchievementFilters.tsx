import type { FC } from 'react';

interface AchievementFiltersProps {
  showUnlocked: boolean;
  showLocked: boolean;
  showHidden: boolean;
  onToggleUnlocked: () => void;
  onToggleLocked: () => void;
  onToggleHidden: () => void;
  }

const buttonClasses = (active: boolean) =>
  ['rounded px-3 py-1', active ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-700'].join(' ');

export const AchievementFilters: FC<AchievementFiltersProps> = ({
  showUnlocked,
  showLocked,
  showHidden,
  onToggleUnlocked,
  onToggleLocked,
  onToggleHidden,
}) => (
  <div className="mb-4 flex space-x-2">
    <button type="button" onClick={onToggleUnlocked} className={buttonClasses(showUnlocked)}>
      Unlocked
    </button>
    <button type="button" onClick={onToggleLocked} className={buttonClasses(showLocked)}>
      Locked
    </button>
    <button type="button" onClick={onToggleHidden} className={buttonClasses(showHidden)}>
      Hidden
    </button>
  </div>
);
