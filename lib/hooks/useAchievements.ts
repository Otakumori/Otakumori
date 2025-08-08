import { useState } from 'react';
import { achievements as allAchievements } from '@/data/achievements';
import { Achievement } from '@/app/types/achievements';

export function useAchievements() {
  // Initialize with all achievements
  const [achievements, setAchievements] = useState<Achievement[]>(allAchievements);

  const unlock = (id: string) => {
    setAchievements(prev =>
      prev.map(a => (a.id === id ? { ...a, isUnlocked: true, unlockedAt: new Date().toISOString() } : a))
    );
  };

  const unlockAchievement = (id: string) => {
    setAchievements(prev =>
      prev.map(a => (a.id === id ? { ...a, isUnlocked: true, unlockedAt: new Date().toISOString() } : a))
    );
  };

  // Check achievements for petals, profile, shopping, comments, lore, etc.
  const checkAchievements = (context: any) => {
    // Example: context = { petalCount, profileComplete, purchaseCount, commentCount, loreReadCount, ... }
    const { petalCount, profileComplete, purchaseCount, commentCount, loreReadCount, avatarUploaded, dailyVisits, eventParticipation, easterEggsFound } = context;

    // Petal collection achievements (example IDs, update as needed)
    if (petalCount !== undefined) {
      if (petalCount >= 10) unlock('first_visit');
      // Add more petal milestones here if you have them
    }
    // Profile achievements
    if (profileComplete) unlock('profile_complete');
    if (avatarUploaded) unlock('avatar_upload');
    // Shopping achievements
    if (purchaseCount !== undefined) {
      if (purchaseCount >= 1) unlock('first_purchase');
      if (purchaseCount >= 5) unlock('shopping_spree');
    }
    // Commenting achievements
    if (commentCount !== undefined) {
      if (commentCount >= 1) unlock('first_comment');
      if (commentCount >= 50) unlock('comment_master');
    }
    // Lore achievements
    if (loreReadCount !== undefined) {
      if (loreReadCount >= 10) unlock('lore_explorer');
      if (loreReadCount >= 50) unlock('lore_master');
    }
    // Daily visit achievements
    if (dailyVisits !== undefined) {
      if (dailyVisits >= 1) unlock('first_visit');
      if (dailyVisits >= 7) unlock('daily_visitor');
    }
    // Event/seasonal achievements
    if (eventParticipation) unlock('seasonal_participant');
    // Easter egg achievements
    if (easterEggsFound !== undefined) {
      if (easterEggsFound >= 1) unlock('easter_egg_finder');
      if (easterEggsFound >= 10) unlock('chaos_master');
    }
    // Add more checks as you add more achievements!
  };

  return { achievements, unlock, unlockAchievement, checkAchievements };
}
