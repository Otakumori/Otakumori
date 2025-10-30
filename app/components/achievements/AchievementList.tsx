import type { FC } from 'react';

import type { Achievement } from './AchievementProvider';
import { AchievementCard } from './AchievementCard';

interface AchievementListProps {
  achievements: Achievement[];
}

export const AchievementList: FC<AchievementListProps> = ({ achievements }) => (
  <div className="space-y-3">
    {achievements.length > 0 ? (
      achievements.map((achievement) => (
        <AchievementCard key={achievement.id} achievement={achievement} />
      ))
    ) : (
      <div className="rounded bg-white p-4 text-center text-sm text-gray-500 shadow dark:bg-gray-800 dark:text-gray-300">
        No achievements to display yet. Keep exploring!
      </div>
    )}
  </div>
);
