import { useEffect } from 'react';
import { useAchievements } from '../contexts/AchievementContext';

export function useSeasonalAchievements() {
  const { unlock } = useAchievements();

  // Track seasonal interactions
  const trackSeasonalInteraction = () => {
    const month = new Date().getMonth();

    // Spring (March-May)
    if (month >= 2 && month <= 4) {
      unlock('spring_interactions');
    }
    // Summer (June-August)
    else if (month >= 5 && month <= 7) {
      unlock('summer_interactions');
    }
    // Fall (September-November)
    else if (month >= 8 && month <= 10) {
      unlock('fall_interactions');
    }
    // Winter (December-February)
    else {
      unlock('winter_interactions');
    }
  };

  // Track Halloween event
  const trackHalloweenEvent = () => {
    const date = new Date();
    const month = date.getMonth();
    const day = date.getDate();

    if (month === 9 && day >= 15 && day <= 31) {
      unlock('halloween_event');
    }
  };

  // Track December daily visits
  const trackDecemberVisit = () => {
    const date = new Date();
    const month = date.getMonth();
    const day = date.getDate();

    if (month === 11) {
      unlock('december_daily_visits');
    }
  };

  // Track special event participation
  const trackSpecialEvent = (eventId: string) => {
    unlock('special_event_participation');
  };

  // Track seasonal item collection
  const trackSeasonalItem = () => {
    unlock('seasonal_items_collected');
  };

  return {
    trackSeasonalInteraction,
    trackHalloweenEvent,
    trackDecemberVisit,
    trackSpecialEvent,
    trackSeasonalItem,
  };
}
