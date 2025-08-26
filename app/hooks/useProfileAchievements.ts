/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import { useEffect } from 'react';
import { useAchievements } from '../components/achievements/AchievementProvider';

export function useProfileAchievements() {
  const { unlockAchievement } = useAchievements();

  // Track avatar changes
  const trackAvatarChange = () => {
    unlockAchievement('avatar_changes');
  };

  // Track profile field completion
  const trackProfileFields = (completedFields: number) => {
    unlockAchievement('profile_fields');
  };

  // Track username changes
  const trackUsernameChange = () => {
    unlockAchievement('username_changes');
  };

  // Track profile image uploads
  const trackProfileImageUpload = () => {
    unlockAchievement('profile_image_uploads');
  };

  // Track profile views
  const trackProfileView = () => {
    unlockAchievement('profile_views');
  };

  return {
    trackAvatarChange,
    trackProfileFields,
    trackUsernameChange,
    trackProfileImageUpload,
    trackProfileView,
  };
}
