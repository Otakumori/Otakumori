import { useEffect } from 'react';
import { useAchievements } from '../contexts/AchievementContext';

export function useShoppingAchievements() {
  const { unlock } = useAchievements();

  // Track cart items
  const trackCartItems = (itemCount: number) => {
    unlock('cart_items');
  };

  // Track wishlist items
  const trackWishlistItems = (itemCount: number) => {
    unlock('wishlist_items');
  };

  // Track purchases
  const trackPurchase = (orderId: string) => {
    unlock('first_purchase');
    unlock('total_purchases');
  };

  // Track mystery box orders
  const trackMysteryBox = (orderId: string) => {
    unlock('mystery_box_orders');
  };

  // Track cart value
  const trackCartValue = (value: number) => {
    if (value >= 1000) {
      unlock('cart_value');
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
