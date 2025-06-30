import { useEffect } from 'react';
import { useAchievements } from '../contexts/AchievementContext';

export function useSpecialAchievements() {
  const { unlock } = useAchievements();

  // Track error triggers
  const trackError = () => {
    unlock('error');
  };

  // Track profile image uploads
  const trackProfileImageUpload = () => {
    unlock('profile_image_upload');
  };

  // Track mystery box orders
  const trackMysteryBox = () => {
    unlock('mystery_box');
  };

  // Track special actions
  const trackSpecialAction = (actionId: string) => {
    unlock('special_actions');
  };

  // Track hidden achievements
  const trackHiddenAchievement = (achievementId: string) => {
    unlock(achievementId);
  };

  // Track achievement milestones
  const trackAchievementMilestone = (count: number) => {
    if (count >= 10) {
      unlock('achievement_milestone_10');
    }
    if (count >= 25) {
      unlock('achievement_milestone_25');
    }
    if (count >= 50) {
      unlock('achievement_milestone_50');
    }
    if (count >= 100) {
      unlock('achievement_milestone_100');
    }
  };

  return {
    trackError,
    trackProfileImageUpload,
    trackMysteryBox,
    trackSpecialAction,
    trackHiddenAchievement,
    trackAchievementMilestone,
  };
}
