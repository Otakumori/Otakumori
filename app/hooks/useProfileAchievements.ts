import { useEffect } from 'react';
import { useAchievements } from '../contexts/AchievementContext';

export function useProfileAchievements() {
  const { unlock } = useAchievements();

  // Track avatar changes
  const trackAvatarChange = () => {
    unlock('avatar_changes');
  };

  // Track profile field completion
  const trackProfileFields = (completedFields: number) => {
    unlock('profile_fields');
  };

  // Track username changes
  const trackUsernameChange = () => {
    unlock('username_changes');
  };

  // Track profile image uploads
  const trackProfileImageUpload = () => {
    unlock('profile_image_uploads');
  };

  // Track profile views
  const trackProfileView = () => {
    unlock('profile_views');
  };

  return {
    trackAvatarChange,
    trackProfileFields,
    trackUsernameChange,
    trackProfileImageUpload,
    trackProfileView,
  };
}
