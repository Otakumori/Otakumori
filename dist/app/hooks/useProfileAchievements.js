'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.useProfileAchievements = useProfileAchievements;
const AchievementContext_1 = require('../contexts/AchievementContext');
function useProfileAchievements() {
  const { checkAchievement } = (0, AchievementContext_1.useAchievements)();
  // Track avatar changes
  const trackAvatarChange = () => {
    checkAchievement('avatar_changes', 1);
  };
  // Track profile field completion
  const trackProfileFields = completedFields => {
    checkAchievement('profile_fields', completedFields);
  };
  // Track username changes
  const trackUsernameChange = () => {
    checkAchievement('username_changes', 1);
  };
  // Track profile image uploads
  const trackProfileImageUpload = () => {
    checkAchievement('profile_image_uploads', 1);
  };
  // Track profile views
  const trackProfileView = () => {
    checkAchievement('profile_views', 1);
  };
  return {
    trackAvatarChange,
    trackProfileFields,
    trackUsernameChange,
    trackProfileImageUpload,
    trackProfileView,
  };
}
