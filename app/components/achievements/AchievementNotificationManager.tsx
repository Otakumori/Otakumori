'use client';
import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Achievement } from '@/types/achievements';
import { useAchievements } from '@/contexts/AchievementContext';
import { AchievementNotification } from './AchievementNotification';
import { achievementSoundInstance } from '@/utils/achievementSound';

export const AchievementNotificationManager: React.FC = () => {
  const [notifications, setNotifications] = useState<Achievement[]>([]);
  const { achievements } = useAchievements();

  useEffect(() => {
    const handleAchievementUnlock = (achievement: Achievement) => {
      setNotifications(prev => [...prev, achievement]);
      achievementSoundInstance.play();
    };

    // Listen for achievement unlock events
    window.addEventListener('achievementUnlock', ((event: CustomEvent<Achievement>) => {
      handleAchievementUnlock(event.detail);
    }) as EventListener);

    return () => {
      window.removeEventListener('achievementUnlock', ((event: CustomEvent<Achievement>) => {
        handleAchievementUnlock(event.detail);
      }) as EventListener);
    };
  }, []);

  const handleClose = (achievementId: string) => {
    setNotifications(prev => prev.filter(achievement => achievement.id !== achievementId));
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-4">
      <AnimatePresence>
        {notifications.map(achievement => (
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
