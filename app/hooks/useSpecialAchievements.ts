import { useEffect } from 'react';
import { useAchievements } from '../contexts/AchievementContext';

export function useSpecialAchievements() {
  const { checkAchievement } = useAchievements();

  // Track error triggers
  const trackError = (errorCode: number) => {
    if (errorCode === 500) {
      checkAchievement('error_500', 1);
    }
  };

  // Track profile image uploads
  const trackProfileImageUpload = () => {
    checkAchievement('profile_image_uploads', 1);
  };

  // Track mystery box orders
  const trackMysteryBox = () => {
    checkAchievement('mystery_box_orders', 1);
  };

  // Track special actions
  const trackSpecialAction = (actionId: string) => {
    checkAchievement('special_actions', 1);
  };

  // Track hidden achievements
  const trackHiddenAchievement = (achievementId: string) => {
    checkAchievement(achievementId, 1);
  };

  // Track achievement milestones
  const trackAchievementMilestone = (count: number) => {
    if (count >= 10) {
      checkAchievement('achievement_milestone_10', 1);
    }
    if (count >= 25) {
      checkAchievement('achievement_milestone_25', 1);
    }
    if (count >= 50) {
      checkAchievement('achievement_milestone_50', 1);
    }
    if (count >= 100) {
      checkAchievement('achievement_milestone_100', 1);
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
