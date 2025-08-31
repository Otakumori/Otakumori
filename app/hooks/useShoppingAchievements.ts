/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable-line @next/next/no-img-element */
import { useEffect } from 'react';
import { useAchievements } from '../components/achievements/AchievementProvider';

export function useShoppingAchievements() {
  const { unlockAchievement } = useAchievements();

  // Track cart items
  const trackCartItems = (itemCount: number) => {
    unlockAchievement('cart_items');
  };

  // Track wishlist items
  const trackWishlistItems = (itemCount: number) => {
    unlockAchievement('wishlist_items');
  };

  // Track purchases
  const trackPurchase = (orderId: string) => {
    unlockAchievement('first_purchase');
    unlockAchievement('total_purchases');
  };

  // Track mystery box orders
  const trackMysteryBox = (orderId: string) => {
    unlockAchievement('mystery_box_orders');
  };

  // Track cart value
  const trackCartValue = (value: number) => {
    if (value >= 1000) {
      unlockAchievement('cart_value');
    }
  };

  return {
    trackCartItems,
    trackWishlistItems,
    trackPurchase,
    trackMysteryBox,
    trackCartValue,
  };
}
