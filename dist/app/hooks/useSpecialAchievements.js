'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.useSpecialAchievements = useSpecialAchievements;
const AchievementContext_1 = require('../contexts/AchievementContext');
function useSpecialAchievements() {
  const { checkAchievement } = (0, AchievementContext_1.useAchievements)();
  // Track error triggers
  const trackError = errorCode => {
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
  const trackSpecialAction = actionId => {
    checkAchievement('special_actions', 1);
  };
  // Track hidden achievements
  const trackHiddenAchievement = achievementId => {
    checkAchievement(achievementId, 1);
  };
  // Track achievement milestones
  const trackAchievementMilestone = count => {
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
