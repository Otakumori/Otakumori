import { useEffect } from 'react';
import { useAchievements } from '../contexts/AchievementContext';

export function useSeasonalAchievements() {
  const { checkAchievement } = useAchievements();

  // Track seasonal interactions
  const trackSeasonalInteraction = () => {
    const month = new Date().getMonth();

    // Spring (March-May)
    if (month >= 2 && month <= 4) {
      checkAchievement('spring_interactions', 1);
    }
    // Summer (June-August)
    else if (month >= 5 && month <= 7) {
      checkAchievement('summer_interactions', 1);
    }
    // Fall (September-November)
    else if (month >= 8 && month <= 10) {
      checkAchievement('fall_interactions', 1);
    }
    // Winter (December-February)
    else {
      checkAchievement('winter_interactions', 1);
    }
  };

  // Track Halloween event
  const trackHalloweenEvent = () => {
    const date = new Date();
    const month = date.getMonth();
    const day = date.getDate();

    if (month === 9 && day >= 15 && day <= 31) {
      checkAchievement('halloween_event', 1);
    }
  };

  // Track December daily visits
  const trackDecemberVisit = () => {
    const date = new Date();
    const month = date.getMonth();
    const day = date.getDate();

    if (month === 11) {
      checkAchievement('december_daily_visits', 1);
    }
  };

  // Track special event participation
  const trackSpecialEvent = (eventId: string) => {
    checkAchievement('special_event_participation', 1);
  };

  // Track seasonal item collection
  const trackSeasonalItem = () => {
    checkAchievement('seasonal_items_collected', 1);
  };

  return {
    trackSeasonalInteraction,
    trackHalloweenEvent,
    trackDecemberVisit,
    trackSpecialEvent,
    trackSeasonalItem,
  };
}
