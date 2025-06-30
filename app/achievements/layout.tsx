'use client';

import React from 'react';
import { AchievementProvider } from '../contexts/AchievementContext';
import { AchievementNotificationManager } from '../components/achievements/AchievementNotificationManager';

interface AchievementsLayoutProps {
  children: React.ReactNode;
}

export default function AchievementsLayout({ children }: AchievementsLayoutProps) {
  return (
    <AchievementProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="container mx-auto px-4 py-8">{children}</main>
        <AchievementNotificationManager />
      </div>
    </AchievementProvider>
  );
}
