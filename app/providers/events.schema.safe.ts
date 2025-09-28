export const Events = {
  // commerce
  CheckoutStarted: 'checkout_started',
  CheckoutSucceeded: 'checkout_succeeded',
  ProductViewed: 'product_viewed',
  AddToCart: 'add_to_cart',
  SearchPerformed: 'search_performed',
  // content
  BlogViewed: 'blog_viewed',
  GuideViewed: 'guide_viewed',
  // games
  GameRunStarted: 'game_run_started',
  GameRunEnded: 'game_run_ended',
  PetalsCollected: 'petals_collected',
  QuestClaimed: 'quest_claimed',
} as const;
