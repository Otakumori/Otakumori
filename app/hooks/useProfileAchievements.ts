import { useEffect } from 'react';
import { useAchievements } from '../contexts/AchievementContext';

export function useProfileAchievements() {
  const { checkAchievement } = useAchievements();

  // Track avatar changes
  const trackAvatarChange = () => {
    checkAchievement('avatar_changes', 1);
  };

  // Track profile field completion
  const trackProfileFields = (completedFields: number) => {
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
