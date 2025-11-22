export const Events = {
  CheckoutStarted: 'checkout_started',
  CheckoutSucceeded: 'checkout_succeeded',
  ProductViewed: 'product_viewed',
  AddToCart: 'add_to_cart',
  RemoveFromCart: 'remove_from_cart',
  SearchPerformed: 'search_performed',
  BlogViewed: 'blog_viewed',
  GuideViewed: 'guide_viewed',
  GameRunStarted: 'game_run_started',
  GameRunEnded: 'game_run_ended',
  PetalsCollected: 'petals_collected',
  PetalMilestoneReached: 'petal_milestone_reached',
  PetalsSpent: 'petals_spent',
  AchievementUnlocked: 'achievement_unlocked',
  AchievementProgress: 'achievement_progress',
  QuestClaimed: 'quest_claimed',
  LeaderboardOpened: 'leaderboard_opened',
} as const;

export type EventName = (typeof Events)[keyof typeof Events];
