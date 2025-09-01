 
 
'use client';
import React, { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { type Achievement } from './AchievementProvider';
import { useAchievements } from './AchievementProvider';
import { AchievementNotification } from './AchievementNotification.tsx';
import { achievementSoundInstance } from '../../utils/achievementSound.ts';

export const AchievementNotificationManager: React.FC = () => {
  const [notifications, setNotifications] = useState<Achievement[]>([]);
  const { achievements } = useAchievements();

  useEffect(() => {
    const handleAchievementUnlock = (achievement: Achievement) => {
      setNotifications((prev) => [...prev, achievement]);
      achievementSoundInstance.play();
    };

    // This is a placeholder for the event listener
    // In a real app, you would listen for an event from your achievement system
    // For now, we'll just simulate it with a timeout
    const timer = setTimeout(() => {
      if (achievements.length > 0) {
        handleAchievementUnlock(achievements[0]);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [achievements]);

  const handleClose = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-4">
      <AnimatePresence>
        {notifications.map((achievement) => (
          <AchievementNotification
            key={achievement.id}
            achievement={achievement}
            onClose={() => handleClose(achievement.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
