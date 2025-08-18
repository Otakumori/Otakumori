import { useCallback } from 'react';

type QuestEventType = 
  | 'view-product' 
  | 'submit-review' 
  | 'gacha-roll' 
  | 'purchase' 
  | 'visit-checkout' 
  | 'browse-collection';

/**
 * Custom hook for tracking quest progress
 * Use this in components to easily track user actions
 */
export function useQuests() {
  const trackQuest = useCallback(async (eventType: QuestEventType) => {
    try {
      const response = await fetch('/api/quests/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: eventType })
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.updated > 0) {
          console.log(`🎯 Quest progress updated: ${result.updated} quest(s)`);
        }
        return result;
      }
    } catch (error) {
      console.error('Failed to track quest:', error);
    }
    return null;
  }, []);

  return { trackQuest };
}

/**
 * Predefined quest tracking functions for common actions
 */
export const questTracking = {
  /**
   * Track when user views a product page
   */
  viewProduct: () => {
    const { trackQuest } = useQuests();
    return trackQuest('view-product');
  },

  /**
   * Track when user submits a review
   */
  submitReview: () => {
    const { trackQuest } = useQuests();
    return trackQuest('submit-review');
  },

  /**
   * Track when user rolls the gacha
   */
  rollGacha: () => {
    const { trackQuest } = useQuests();
    return trackQuest('gacha-roll');
  },

  /**
   * Track when user completes a purchase
   */
  completePurchase: () => {
    const { trackQuest } = useQuests();
    return trackQuest('purchase');
  },

  /**
   * Track when user visits checkout
   */
  visitCheckout: () => {
    const { trackQuest } = useQuests();
    return trackQuest('visit-checkout');
  },

  /**
   * Track when user browses a collection
   */
  browseCollection: () => {
    const { trackQuest } = useQuests();
    return trackQuest('browse-collection');
  }
};
