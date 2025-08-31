/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable-line @next/next/no-img-element */
import { useEffect, useRef } from 'react';
import { useAchievements } from './hooks/useAchievements';
import { useCommunityAchievements } from './useCommunityAchievements';

// Site Interaction Achievements
export function useSiteInteractionTracking() {
  const { checkAchievements } = useAchievements();

  useEffect(() => {
    let timeOnPage = 0;
    let lastActive = Date.now();
    let tabSwitches = 0;
    let lastTabState = document.hidden;

    const updateTimeOnPage = () => {
      const now = Date.now();
      const timeDiff = now - lastActive;
      if (!document.hidden) {
        timeOnPage += timeDiff;
        if (timeOnPage >= 1800) {
          // 30 minutes
          checkAchievements(timeOnPage);
        }
      }
      lastActive = now;
    };

    const checkInactivity = () => {
      const now = Date.now();
      const inactiveTime = now - lastActive;
      if (inactiveTime >= 300000) {
        // 5 minutes
        checkAchievements(inactiveTime);
      }
    };

    const handleVisibilityChange = () => {
      if (lastTabState !== document.hidden) {
        tabSwitches++;
        checkAchievements(tabSwitches);
      }
      lastTabState = document.hidden;
    };

    const interval = setInterval(() => {
      updateTimeOnPage();
      checkInactivity();
    }, 1000);

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkAchievements]);
}

// Profile Growth Achievements
export function useProfileGrowthTracking() {
  const { checkAchievements } = useAchievements();

  const trackAvatarChange = () => {
    checkAchievements(1);
  };

  const trackProfileCompletion = () => {
    checkAchievements(1);
  };

  const trackUsernameChange = () => {
    checkAchievements(1);
  };

  return {
    trackAvatarChange,
    trackProfileCompletion,
    trackUsernameChange,
  };
}

// Shopping Engagement Achievements
export function useShoppingEngagementTracking() {
  const { checkAchievements } = useAchievements();

  const trackCartItem = () => {
    checkAchievements(1);
  };

  const trackWishlistItem = () => {
    checkAchievements(1);
  };

  const trackPurchase = () => {
    checkAchievements(1);
  };

  return {
    trackCartItem,
    trackWishlistItem,
    trackPurchase,
  };
}

// Community and Commenting Achievements
export function useCommunityTracking() {
  const { checkAchievements } = useAchievements();

  const trackStructuredComment = () => {
    checkAchievements(1);
  };

  const trackComment = () => {
    checkAchievements(1);
    checkAchievements(1);
  };

  return {
    trackStructuredComment,
    trackComment,
  };
}

// Lore Discovery Achievements
export function useLoreDiscoveryTracking() {
  const { checkAchievements } = useAchievements();

  const trackHiddenLink = () => {
    checkAchievements(1);
  };

  const track404Visit = () => {
    checkAchievements(1);
  };

  const trackLoreMessage = () => {
    checkAchievements(1);
  };

  return {
    trackHiddenLink,
    track404Visit,
    trackLoreMessage,
  };
}

// Mystery and Chaos Achievements
export function useMysteryTracking() {
  const { checkAchievements } = useAchievements();

  useEffect(() => {
    let refreshCount = 0;
    let inspectAttempts = 0;

    const handleRefresh = () => {
      refreshCount++;
      checkAchievements(refreshCount);
    };

    const handleInspect = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        inspectAttempts++;
        checkAchievements(inspectAttempts);
      }
    };

    const checkNightVisit = () => {
      const hour = new Date().getHours();
      if (hour === 3) {
        checkAchievements(1);
      }
    };

    window.addEventListener('beforeunload', handleRefresh);
    document.addEventListener('keydown', handleInspect);
    checkNightVisit();

    return () => {
      window.removeEventListener('beforeunload', handleRefresh);
      document.removeEventListener('keydown', handleInspect);
    };
  }, [checkAchievements]);
}

// Seasonal and Event Achievements
export function useSeasonalTracking() {
  const { checkAchievements } = useAchievements();

  const trackCherryBlossom = () => {
    checkAchievements(1);
  };

  const trackHalloweenEvent = () => {
    checkAchievements(1);
  };

  const trackDecemberVisit = () => {
    const month = new Date().getMonth();
    if (month === 11) {
      // December
      checkAchievements(1);
    }
  };

  return {
    trackCherryBlossom,
    trackHalloweenEvent,
    trackDecemberVisit,
  };
}

// Special and Hidden Achievements
export function useSpecialTracking() {
  const { checkAchievements } = useAchievements();

  const trackError = () => {
    checkAchievements(1);
  };

  const trackProfileImageUpload = () => {
    checkAchievements(1);
  };

  const trackMysteryBox = () => {
    checkAchievements(1);
  };

  return {
    trackError,
    trackProfileImageUpload,
    trackMysteryBox,
  };
}

export function useAchievementTracking() {
  // Call side-effect-only hooks (they return void)
  useSiteInteractionTracking();
  useMysteryTracking();

  // Spread the ones that return objects
  return {
    ...useProfileGrowthTracking(),
    ...useShoppingEngagementTracking(),
    ...useCommunityTracking(),
    ...useLoreDiscoveryTracking(),
    ...useSeasonalTracking(),
    ...useSpecialTracking(),
  };
}
