export const CATEGORIES = [
  { id: 'all', name: 'All', slug: 'all' },
  { id: 'games', name: 'Games', slug: 'games' },
  { id: 'merchandise', name: 'Merchandise', slug: 'merchandise' },
  { id: 'accessories', name: 'Accessories', slug: 'accessories' },
  { id: 'collectibles', name: 'Collectibles', slug: 'collectibles' },
] as const;

export type Category = (typeof CATEGORIES)[number];
