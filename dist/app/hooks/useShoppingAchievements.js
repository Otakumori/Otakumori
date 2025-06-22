'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.useShoppingAchievements = useShoppingAchievements;
const AchievementContext_1 = require('../contexts/AchievementContext');
function useShoppingAchievements() {
  const { checkAchievement } = (0, AchievementContext_1.useAchievements)();
  // Track cart items
  const trackCartItems = itemCount => {
    checkAchievement('cart_items', itemCount);
  };
  // Track wishlist items
  const trackWishlistItems = itemCount => {
    checkAchievement('wishlist_items', itemCount);
  };
  // Track purchases
  const trackPurchase = orderId => {
    checkAchievement('first_purchase', 1);
    checkAchievement('total_purchases', 1);
  };
  // Track mystery box orders
  const trackMysteryBox = orderId => {
    checkAchievement('mystery_box_orders', 1);
  };
  // Track cart value
  const trackCartValue = value => {
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
