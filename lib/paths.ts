/**
 * Centralized path management for Otaku-mori
 * Single source of truth for all internal links
 */

export const paths = {
  // Core
  home: () => '/',

  // Shop
  shop: (page?: number) => (page && page > 1 ? `/shop?page=${page}` : '/shop'),
  product: (id: string) => `/shop/product/${id}`,
  cart: () => '/shop/cart',
  checkout: () => '/shop/checkout',
  checkoutSuccess: () => '/shop/checkout/success',

  // Blog
  blogIndex: (page?: number) => (page && page > 1 ? `/blog?page=${page}` : '/blog'),
  blogPost: (slug: string) => `/blog/${slug}`,

  // Mini-games
  games: () => '/mini-games',
  game: (slug: string) => `/mini-games/${slug}`,

  // Community
  community: () => '/community',
  soapstones: () => '/community/soapstones',
  profile: (username?: string) => (username ? `/profile/${username}` : '/profile'),
  achievements: () => '/profile/achievements',

  // Legal & Help
  terms: () => '/terms',
  privacy: () => '/privacy',
  help: () => '/help',
  cookies: () => '/cookies',

  // Admin
  adminPrintify: () => '/admin/printify',
} as const;

// Type for path functions
export type PathFunction = (typeof paths)[keyof typeof paths];
