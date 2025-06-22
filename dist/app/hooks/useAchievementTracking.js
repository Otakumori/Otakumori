'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.useSiteInteractionTracking = useSiteInteractionTracking;
exports.useProfileGrowthTracking = useProfileGrowthTracking;
exports.useShoppingEngagementTracking = useShoppingEngagementTracking;
exports.useCommunityTracking = useCommunityTracking;
exports.useLoreDiscoveryTracking = useLoreDiscoveryTracking;
exports.useMysteryTracking = useMysteryTracking;
exports.useSeasonalTracking = useSeasonalTracking;
exports.useSpecialTracking = useSpecialTracking;
exports.useAchievementTracking = useAchievementTracking;
const react_1 = require('react');
const AchievementContext_1 = require('../contexts/AchievementContext');
// Site Interaction Achievements
function useSiteInteractionTracking() {
  const { checkAchievement } = (0, AchievementContext_1.useAchievements)();
  (0, react_1.useEffect)(() => {
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
          checkAchievement('simp-much', 1);
        }
      }
      lastActive = now;
    };
    const checkInactivity = () => {
      const now = Date.now();
      const inactiveTime = now - lastActive;
      if (inactiveTime >= 300000) {
        // 5 minutes
        checkAchievement('idle-hands', 1);
      }
    };
    const handleVisibilityChange = () => {
      if (lastTabState !== document.hidden) {
        tabSwitches++;
        checkAchievement('alt-tab-samurai', 1);
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
  }, [checkAchievement]);
}
// Profile Growth Achievements
function useProfileGrowthTracking() {
  const { checkAchievement } = (0, AchievementContext_1.useAchievements)();
  const trackAvatarChange = () => {
    checkAchievement('who-are-you-wearing', 1);
  };
  const trackProfileCompletion = () => {
    checkAchievement('myspace-vibes', 1);
  };
  const trackUsernameChange = () => {
    checkAchievement('name-dropper', 1);
  };
  return {
    trackAvatarChange,
    trackProfileCompletion,
    trackUsernameChange,
  };
}
// Shopping Engagement Achievements
function useShoppingEngagementTracking() {
  const { checkAchievement } = (0, AchievementContext_1.useAchievements)();
  const trackCartItem = () => {
    checkAchievement('bottomless-cart', 1);
  };
  const trackWishlistItem = () => {
    checkAchievement('wishful-thinker', 1);
  };
  const trackPurchase = () => {
    checkAchievement('impulse-slayer', 1);
  };
  return {
    trackCartItem,
    trackWishlistItem,
    trackPurchase,
  };
}
// Community and Commenting Achievements
function useCommunityTracking() {
  const { checkAchievement } = (0, AchievementContext_1.useAchievements)();
  const trackStructuredComment = () => {
    checkAchievement('dark-souls-message', 1);
  };
  const trackComment = () => {
    checkAchievement('elden-blabbermouth', 1);
    checkAchievement('first-blood', 1);
  };
  return {
    trackStructuredComment,
    trackComment,
  };
}
// Lore Discovery Achievements
function useLoreDiscoveryTracking() {
  const { checkAchievement } = (0, AchievementContext_1.useAchievements)();
  const trackHiddenLink = () => {
    checkAchievement('secret-files', 1);
  };
  const track404Visit = () => {
    checkAchievement('404-and-more', 1);
  };
  const trackLoreMessage = () => {
    checkAchievement('rune-awakened', 1);
  };
  return {
    trackHiddenLink,
    track404Visit,
    trackLoreMessage,
  };
}
// Mystery and Chaos Achievements
function useMysteryTracking() {
  const { checkAchievement } = (0, AchievementContext_1.useAchievements)();
  (0, react_1.useEffect)(() => {
    let refreshCount = 0;
    let inspectAttempts = 0;
    const handleRefresh = () => {
      refreshCount++;
      checkAchievement('f5-ninja', 1);
    };
    const handleInspect = e => {
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        inspectAttempts++;
        checkAchievement('screenshot-this', 1);
      }
    };
    const checkNightVisit = () => {
      const hour = new Date().getHours();
      if (hour === 3) {
        checkAchievement('night-crawler', 1);
      }
    };
    window.addEventListener('beforeunload', handleRefresh);
    document.addEventListener('keydown', handleInspect);
    checkNightVisit();
    return () => {
      window.removeEventListener('beforeunload', handleRefresh);
      document.removeEventListener('keydown', handleInspect);
    };
  }, [checkAchievement]);
}
// Seasonal and Event Achievements
function useSeasonalTracking() {
  const { checkAchievement } = (0, AchievementContext_1.useAchievements)();
  const trackCherryBlossom = () => {
    checkAchievement('sakura-bloom', 1);
  };
  const trackHalloweenEvent = () => {
    checkAchievement('pumpkin-slayer', 1);
  };
  const trackDecemberVisit = () => {
    const month = new Date().getMonth();
    if (month === 11) {
      // December
      checkAchievement('snowed-in', 1);
    }
  };
  return {
    trackCherryBlossom,
    trackHalloweenEvent,
    trackDecemberVisit,
  };
}
// Special and Hidden Achievements
function useSpecialTracking() {
  const { checkAchievement } = (0, AchievementContext_1.useAchievements)();
  const trackError = () => {
    checkAchievement('error-500-brain', 1);
  };
  const trackProfileImageUpload = () => {
    checkAchievement('self-insert', 1);
  };
  const trackMysteryBox = () => {
    checkAchievement('whats-in-the-box', 1);
  };
  return {
    trackError,
    trackProfileImageUpload,
    trackMysteryBox,
  };
}
function useAchievementTracking() {
  const { updateProgress } = (0, AchievementContext_1.useAchievements)();
  (0, react_1.useEffect)(() => {
    // Track site visit
    updateProgress('first_visit', 1);
    // Track daily visits
    const lastVisit = localStorage.getItem('lastVisit');
    const today = new Date().toDateString();
    if (lastVisit !== today) {
      const streak = parseInt(localStorage.getItem('visitStreak') || '0', 10);
      const newStreak = streak + 1;
      localStorage.setItem('visitStreak', newStreak.toString());
      localStorage.setItem('lastVisit', today);
      updateProgress('daily_visitor', newStreak);
    }
    // Track profile completion
    const profileComplete = localStorage.getItem('profileComplete') === 'true';
    if (profileComplete) {
      updateProgress('profile_complete', 1);
    }
    // Track avatar upload
    const hasAvatar = localStorage.getItem('hasAvatar') === 'true';
    if (hasAvatar) {
      updateProgress('avatar_upload', 1);
    }
    // Track purchases
    const purchaseCount = parseInt(localStorage.getItem('purchaseCount') || '0', 10);
    if (purchaseCount > 0) {
      updateProgress('first_purchase', 1);
      updateProgress('shopping_spree', purchaseCount);
    }
    // Track comments
    const commentCount = parseInt(localStorage.getItem('commentCount') || '0', 10);
    if (commentCount > 0) {
      updateProgress('first_comment', 1);
      updateProgress('comment_master', commentCount);
    }
    // Track lore discovery
    const loreEntries = parseInt(localStorage.getItem('loreEntries') || '0', 10);
    if (loreEntries > 0) {
      updateProgress('lore_explorer', loreEntries);
      updateProgress('lore_master', loreEntries);
    }
    // Track easter eggs
    const easterEggs = parseInt(localStorage.getItem('easterEggs') || '0', 10);
    if (easterEggs > 0) {
      updateProgress('easter_egg_finder', 1);
      updateProgress('chaos_master', easterEggs);
    }
    // Track seasonal events
    const seasonalEvents = parseInt(localStorage.getItem('seasonalEvents') || '0', 10);
    if (seasonalEvents > 0) {
      updateProgress('seasonal_participant', 1);
    }
    const eventWins = parseInt(localStorage.getItem('eventWins') || '0', 10);
    if (eventWins > 0) {
      updateProgress('event_champion', 1);
    }
    // Track special achievements
    const isBetaTester = localStorage.getItem('isBetaTester') === 'true';
    if (isBetaTester) {
      updateProgress('beta_tester', 1);
    }
    const isFounder = localStorage.getItem('isFounder') === 'true';
    if (isFounder) {
      updateProgress('founder', 1);
    }
  }, [updateProgress]);
}
