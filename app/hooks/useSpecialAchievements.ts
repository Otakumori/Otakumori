import { useEffect } from 'react';
import { useAchievements } from '../components/achievements/AchievementProvider';

export function useSpecialAchievements() {
  const { unlockAchievement } = useAchievements();

  // Track error triggers
  const trackError = () => {
    unlockAchievement('error');
  };

  // Track profile image uploads
  const trackProfileImageUpload = () => {
    unlockAchievement('profile_image_upload');
  };

  // Track mystery box orders
  const trackMysteryBox = () => {
    unlockAchievement('mystery_box');
  };

  // Track special actions
  const trackSpecialAction = (actionId: string) => {
    unlockAchievement('special_actions');
  };

  // Track hidden achievements
  const trackHiddenAchievement = (achievementId: string) => {
    unlockAchievement(achievementId);
  };

  // Track achievement milestones
  const trackAchievementMilestone = (count: number) => {
    if (count >= 10) {
      unlockAchievement('achievement_milestone_10');
    }
    if (count >= 25) {
      unlockAchievement('achievement_milestone_25');
    }
    if (count >= 50) {
      unlockAchievement('achievement_milestone_50');
    }
    if (count >= 100) {
      unlockAchievement('achievement_milestone_100');
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
