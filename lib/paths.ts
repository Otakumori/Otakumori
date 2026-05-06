/**
 * Centralized path management for Otaku-mori
 * Single source of truth for all internal links
 */

export const paths = {
  // Core
  home: () => '/',

  // Auth
  signIn: (redirectUrl?: string) =>
    redirectUrl ? `/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}` : '/sign-in',
  signUp: (redirectUrl?: string) =>
    redirectUrl ? `/sign-up?redirect_url=${encodeURIComponent(redirectUrl)}` : '/sign-up',
  login: () => '/login',
  unauthorized: () => '/unauthorized',

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
  profileOrders: () => '/profile/orders',
  profilePetals: () => '/profile/petals',
  achievements: () => '/profile/achievements',
  profileAddresses: () => '/profile/addresses',
  profileSecurity: () => '/profile/security',
  profileEdit: () => '/profile/edit',
  orders: () => '/orders',

  // Account
  account: () => '/account',

  // Legal & Help
  terms: () => '/terms',
  privacy: () => '/privacy',
  help: () => '/help',
  cookies: () => '/cookies',

  // Admin
  admin: () => '/admin',
  adminUnauthorized: () => '/admin/unauthorized',
  adminUsers: () => '/admin/users',
  adminEconomy: () => '/admin/economy',
  adminCosmetics: () => '/admin/cosmetics',
  adminVouchers: () => '/admin/vouchers',
  adminNsfw: () => '/admin/nsfw',
  adminSettings: () => '/admin/settings',
  adminCoupons: () => '/admin/coupons',
  adminDiscounts: () => '/admin/discounts',
  adminOrders: () => '/admin/orders',
  adminContentBlog: () => '/admin/content/blog',
  adminRunes: () => '/admin/runes',
  adminRewards: () => '/admin/rewards',
  adminPetalShop: () => '/admin/petal-shop',
  adminBurst: () => '/admin/burst',
  adminPrintify: () => '/admin/printify',
} as const;

// Type for path functions
export type PathFunction = (typeof paths)[keyof typeof paths];
