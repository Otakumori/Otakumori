 
 
import React from 'react';
import type { Achievement } from './AchievementProvider';
import { AchievementCard } from './AchievementCard';

interface AchievementListProps {
  achievements: Achievement[];
}

export const AchievementList: React.FC<AchievementListProps> = ({ achievements }) => (
  <div className="space-y-2">
    {achievements.length > 0 ? (
      achievements.map((achievement) => (
        <div key={achievement.id} className="rounded bg-white p-4 shadow">
          {achievement.title}
        </div>
      ))
    ) : (
      <div className="rounded bg-white p-4 shadow">No achievements to display.</div>
    )}
  </div>
);
