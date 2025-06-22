import { useEffect } from 'react';
import { useAchievements } from '../contexts/AchievementContext';

export function useShoppingAchievements() {
  const { checkAchievement } = useAchievements();

  // Track cart items
  const trackCartItems = (itemCount: number) => {
    checkAchievement('cart_items', itemCount);
  };

  // Track wishlist items
  const trackWishlistItems = (itemCount: number) => {
    checkAchievement('wishlist_items', itemCount);
  };

  // Track purchases
  const trackPurchase = (orderId: string) => {
    checkAchievement('first_purchase', 1);
    checkAchievement('total_purchases', 1);
  };

  // Track mystery box orders
  const trackMysteryBox = (orderId: string) => {
    checkAchievement('mystery_box_orders', 1);
  };

  // Track cart value
  const trackCartValue = (value: number) => {
    if (value >= 1000) {
      checkAchievement('cart_value', 1);
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
