import { z } from 'zod';

// API envelope
export const ApiSuccess = <T extends z.ZodTypeAny>(data: T) =>
  z.object({ ok: z.literal(true), data });
export const ApiError = z.object({ ok: z.literal(false), error: z.string() });
export type ApiEnvelope<T> = { ok: true; data: T } | { ok: false; error: string };

// Product schemas (normalized to DB fields)
export const ProductVariantSchema = z.object({
  id: z.string(),
  productId: z.string(),
  previewImageUrl: z.string().nullable().optional(),
  printifyVariantId: z.number(),
  isEnabled: z.boolean(),
  inStock: z.boolean(),
  priceCents: z.number().int().nullable().optional(),
  currency: z.string().nullable().optional(),
});

export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  primaryImageUrl: z.string().nullable().optional(),
  active: z.boolean().default(true),
  category: z.string().nullable().optional(),
  variants: z.array(ProductVariantSchema).default([]),
});
export type Product = z.infer<typeof ProductSchema>;
export type ProductVariant = z.infer<typeof ProductVariantSchema>;

// Query params
export const ProductListQuery = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export const ProductListResponse = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string().optional().nullable(),
      images: z.array(z.string()).default([]),
      price: z.number(),
      category: z.string().optional().nullable(),
      variants: z.array(ProductVariantSchema).default([]),
    }),
  ),
  count: z.number().int(),
  pageSize: z.number().int(),
});

export const ProductDetailQuery = z.object({ id: z.string() });
export const ProductDetailResponse = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional().nullable(),
  images: z.array(z.string()).default([]),
  price: z.number(),
  category: z.string().optional().nullable(),
  variants: z.array(ProductVariantSchema).default([]),
});

// Checkout session payload
export const CheckoutItem = z.object({
  productId: z.string(),
  variantId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  images: z.array(z.string()).optional(),
  quantity: z.number().int().positive(),
  priceCents: z.number().int().positive(),
  sku: z.string().optional(),
  printifyProductId: z.string().optional(),
  printifyVariantId: z.number().optional(),
});
export const CheckoutRequest = z.object({
  items: z.array(CheckoutItem).min(1),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
  couponCodes: z.array(z.string()).optional(),
  // optional shipping summary to support FREESHIP preview in session creation
  shipping: z
    .object({
      provider: z.enum(['stripe', 'flat', 'other']).optional(),
      fee: z.number().nonnegative().optional(),
    })
    .optional(),
  shippingInfo: z
    .object({
      email: z.string().email().optional(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
    })
    .optional(),
});

// Base schemas
export const IdSchema = z.string().min(1);
export const EmailSchema = z.string().email();
export const NonEmptyStringSchema = z.string().min(1);

// Social schemas
export const VisibilitySchema = z.enum(['public', 'friends', 'private']);
export const StatusSchema = z.enum(['online', 'idle', 'dnd', 'offline']);
export const ThemeCodeSchema = z.enum(['glass_pink', 'ink_dark', 'retro_ps2']);

// User schemas
export const UserProfileSchema = z.object({
  display_name: z.string().min(1).max(100).optional(),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_-]+$/)
    .optional(),
  avatar_url: z.string().url().optional(),
});

export const UserUpdateSchema = UserProfileSchema.partial();

// Product schemas (legacy types retained below; do not redefine ProductVariantSchema/ProductSchema)

export const ProductSearchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  inStock: z.boolean().optional(),
  sortBy: z.enum(['name', 'price', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

// Cart schemas
export const CartItemSchema = z.object({
  productId: IdSchema,
  variantId: IdSchema.optional(),
  quantity: z.number().int().min(1).max(99),
  sku: z.string().optional(),
  name: z.string().min(1),
  priceCents: z.number().int().min(0),
  description: z.string().optional(),
  images: z.array(z.string().url()).optional(),
  printifyProductId: z.string().optional(),
  printifyVariantId: z.string().optional(),
});

export const CartUpdateSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().optional(),
  quantity: z.number().int().min(1),
});

// Checkout schemas
export const ShippingAddressSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  email: EmailSchema,
  phone: z.string().optional(),
  address1: z.string().min(1).max(100),
  address2: z.string().max(100).optional(),
  city: z.string().min(1).max(50),
  state: z.string().min(1).max(50),
  zipCode: z.string().min(1).max(20),
  country: z.string().min(2).max(2), // ISO 2-letter country code
});

export const CheckoutSessionSchema = z.object({
  items: z.array(CartItemSchema).min(1),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
  shippingInfo: ShippingAddressSchema,
});

// Order schemas
export const OrderItemSchema = z.object({
  id: IdSchema,
  name: z.string().min(1),
  quantity: z.number().int().min(1),
  price: z.number().min(0),
  sku: z.string(),
  product: z
    .object({
      id: IdSchema,
      name: z.string().min(1),
      primaryImageUrl: z.string().url().nullable(),
    })
    .nullable(),
  variant: z
    .object({
      id: IdSchema,
      name: z.string().min(1),
    })
    .nullable(),
});

export const OrderSchema = z.object({
  id: IdSchema,
  orderNumber: z.number().int().min(1),
  status: z.enum(['pending', 'pending_mapping', 'in_production', 'shipped', 'cancelled']),
  total: z.number().min(0),
  currency: z.string().length(3),
  createdAt: z.string().datetime(),
  paidAt: z.string().datetime().nullable(),
  shippedAt: z.string().datetime().nullable(),
  trackingUrl: z.string().url().nullable(),
  carrier: z.string().nullable(),
  trackingNumber: z.string().nullable(),
  items: z.array(OrderItemSchema),
});

export const OrdersResponseSchema = z.object({
  ok: z.boolean(),
  data: z.object({
    orders: z.array(OrderSchema),
  }),
});

// API response schemas
export const ApiResponseSchema = z.object({
  ok: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
});

export const ProductsResponseSchema = z.object({
  ok: z.boolean(),
  items: z.array(ProductSchema),
});

export const CheckoutResponseSchema = z.object({
  ok: z.boolean(),
  data: z
    .object({
      url: z.string().url(),
      orderId: IdSchema,
      orderNumber: z.number(),
    })
    .optional(),
  error: z.string().optional(),
});

// Rate limiting schemas
export const RateLimitResponseSchema = z.object({
  ok: z.boolean(),
  error: z.string(),
  retryAfter: z.number().optional(),
});

// Printify schemas
export const PrintifyOrderItemSchema = z.object({
  printify_product_id: z.string().min(1),
  printify_variant_id: z.string().min(1),
  quantity: z.number().int().min(1),
});

export const PrintifyShippingAddressSchema = z.object({
  first_name: z.string().min(1).max(50),
  last_name: z.string().min(1).max(50),
  email: EmailSchema,
  phone: z.string().optional(),
  country: z.string().length(2),
  region: z.string().min(1).max(50),
  city: z.string().min(1).max(50),
  zip: z.string().min(1).max(20),
  address1: z.string().min(1).max(100),
  address2: z.string().max(100).optional(),
});

export const PrintifyOrderDataSchema = z.object({
  external_id: z.string().min(1),
  label: z.string().min(1).max(200),
  line_items: z.array(PrintifyOrderItemSchema).min(1),
  shipping_method: z.number().int().min(1),
  send_shipping_notification: z.boolean(),
  address_to: PrintifyShippingAddressSchema,
});

// Admin schemas
export const AdminActionSchema = z.object({
  action: z.enum(['sync_products', 'sync_orders', 'update_status']),
  params: z.record(z.string(), z.any()).optional(),
});

// Petal system schemas
export const PetalTransactionSchema = z.object({
  id: z.string(),
  userId: z.string().nullable(),
  guestSessionId: z.string().nullable(),
  type: z.enum([
    'earn',
    'spend',
    'adjust',
    'burst_bonus',
    'seasonal',
    'purchase_bonus',
    'first_purchase_bonus',
    'milestone_bonus',
    'combo_reveal',
    'preset_unlock',
  ]),
  amount: z.number().int(),
  reason: z.string().min(1).max(200),
  createdAt: z.date(),
});

export const PetalBalanceSchema = z.object({
  balance: z.number().int().min(0),
  needsDailyGrant: z.boolean(),
  lastGrantDate: z.date().nullable(),
  transactions: z.array(PetalTransactionSchema),
});

// Validation helpers
export const validateRequest = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
      throw new Error(`Validation failed: ${message}`);
    }
    throw error;
  }
};

export const validatePartial = <_T>(schema: z.ZodObject<any>, data: unknown): any => {
  try {
    return schema.partial().parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
      throw new Error(`Validation failed: ${message}`);
    }
    throw error;
  }
};

// Game API Contracts
export const GameStartRequestSchema = z.object({
  gameKey: z.string().min(1),
  idempotencyKey: z.string().min(1),
});

export const GameStartResponseSchema = z.object({
  ok: z.boolean(),
  data: z
    .object({
      runId: z.string(),
      seed: z.number(),
      flags: z.record(z.string(), z.any()).optional().default({}),
    })
    .optional(),
  error: z.string().optional(),
});

export const GameFinishRequestSchema = z.object({
  runId: z.string().min(1),
  score: z.number().min(0),
  statsHash: z.string().min(1),
  meta: z.record(z.string(), z.any()).default({}).optional(),
  idempotencyKey: z.string().min(1),
});

export const GameFinishResponseSchema = z.object({
  ok: z.boolean(),
  data: z
    .object({
      petalsAwarded: z.number(),
      itemsGranted: z.array(z.string()).optional(),
      achievements: z.array(z.string()).optional(),
      balance: z.number(),
      runeGrants: z.number().optional(),
    })
    .optional(),
  error: z.string().optional(),
});

export const GameProgressRequestSchema = z.object({
  runId: z.string().min(1),
  checkpoint: z.string().min(1),
  data: z.record(z.string(), z.any()),
  idempotencyKey: z.string().min(1),
});

export const GameProgressResponseSchema = z.object({
  ok: z.boolean(),
  data: z
    .object({
      acknowledged: z.boolean(),
      timestamp: z.number(),
    })
    .optional(),
  error: z.string().optional(),
});

// Achievement Contracts
export const AchievementUnlockRequestSchema = z.object({
  achievementCode: z.string().min(1),
  idempotencyKey: z.string().min(1),
});

export const AchievementUnlockResponseSchema = z.object({
  ok: z.boolean(),
  data: z
    .object({
      achievementId: z.string(),
      rewardGranted: z.boolean(),
      rewardDetails: z.record(z.string(), z.any()).default({}).optional(),
    })
    .optional(),
  error: z.string().optional(),
});

export const AchievementSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  description: z.string(),
  unlocked: z.boolean(),
  unlockedAt: z.string().optional(),
  iconUrl: z.string().optional(),
});

export const GetAchievementsResponseSchema = z.object({
  ok: z.boolean(),
  data: z
    .object({
      achievements: z.array(AchievementSchema),
      total: z.number(),
    })
    .optional(),
  error: z.string().optional(),
});

// Coupon Contracts
export const CouponGrantSchema = z.object({
  id: z.string(),
  code: z.string(),
  discountType: z.enum(['PERCENT', 'OFF_AMOUNT']),
  amountOff: z.number().optional(),
  percentOff: z.number().optional(),
  expiresAt: z.string().optional(),
  createdAt: z.string(),
  redeemedAt: z.string().optional(),
});

export const GetCouponsResponseSchema = z.object({
  ok: z.boolean(),
  data: z
    .object({
      coupons: z.array(CouponGrantSchema),
      total: z.number(),
    })
    .optional(),
  error: z.string().optional(),
});

// Game Stats Contracts
export const GameStatsSchema = z.object({
  gameKey: z.string(),
  totalRuns: z.number(),
  bestScore: z.number(),
  averageScore: z.number(),
  totalPetalsEarned: z.number(),
  lastPlayed: z.string().optional(),
});

export const GetGameStatsResponseSchema = z.object({
  ok: z.boolean(),
  data: z
    .object({
      stats: z.array(GameStatsSchema),
      totalStats: z.object({
        totalRuns: z.number(),
        totalPetalsEarned: z.number(),
        favoriteGame: z.string().optional(),
      }),
    })
    .optional(),
  error: z.string().optional(),
});

// Type exports
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type CartItem = z.infer<typeof CartItemSchema>;
export type ShippingAddress = z.infer<typeof ShippingAddressSchema>;
export type CheckoutSession = z.infer<typeof CheckoutSessionSchema>;
export type Order = z.infer<typeof OrderSchema>;
export type OrderItem = z.infer<typeof OrderItemSchema>;
export type PrintifyOrderData = z.infer<typeof PrintifyOrderDataSchema>;
export type PetalTransaction = z.infer<typeof PetalTransactionSchema>;
export type GameStartRequest = z.infer<typeof GameStartRequestSchema>;
export type GameStartResponse = z.infer<typeof GameStartResponseSchema>;
export type GameFinishRequest = z.infer<typeof GameFinishRequestSchema>;
export type GameFinishResponse = z.infer<typeof GameFinishResponseSchema>;
export type GameProgressRequest = z.infer<typeof GameProgressRequestSchema>;
export type GameProgressResponse = z.infer<typeof GameProgressResponseSchema>;
export type AchievementUnlockRequest = z.infer<typeof AchievementUnlockRequestSchema>;
export type AchievementUnlockResponse = z.infer<typeof AchievementUnlockResponseSchema>;
export type Achievement = z.infer<typeof AchievementSchema>;
export type GetAchievementsResponse = z.infer<typeof GetAchievementsResponseSchema>;
export type CouponGrant = z.infer<typeof CouponGrantSchema>;
export type GetCouponsResponse = z.infer<typeof GetCouponsResponseSchema>;
export type GameStats = z.infer<typeof GameStatsSchema>;

// Social Foundation Contracts

// Profile 2.0 schemas
export const ProfileUpdateSchema = z.object({
  display_name: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  website: z.string().url().optional(),
  bannerUrl: z.string().url().optional(),
  avatarUrl: z.string().url().optional(),
  visibility: VisibilitySchema.optional(),
});

export const ProfileSectionSchema = z.object({
  id: IdSchema,
  code: z.enum(['about', 'showcase', 'stats', 'achievements', 'collections']),
  orderIdx: z.number().int().min(0),
  visible: z.boolean(),
});

export const ProfileSectionUpdateSchema = z.object({
  sections: z.array(ProfileSectionSchema),
});

export const ProfileLinkSchema = z.object({
  id: IdSchema.optional(),
  label: z.string().min(1).max(50),
  url: z.string().url(),
  orderIdx: z.number().int().min(0).default(0),
});

export const ProfileLinkUpdateSchema = z.object({
  links: z.array(ProfileLinkSchema),
});

export const ProfileThemeUpdateSchema = z.object({
  themeCode: ThemeCodeSchema,
  accentHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
});

// Follow system schemas
export const FollowRequestSchema = z.object({
  targetId: IdSchema,
});

export const FollowResponseSchema = z.object({
  success: z.boolean(),
  isFollowing: z.boolean(),
  followerCount: z.number().int().min(0),
});

export const FollowersResponseSchema = z.object({
  followers: z.array(
    z.object({
      id: IdSchema,
      username: z.string(),
      display_name: z.string().nullable(),
      avatarUrl: z.string().nullable(),
      isFollowing: z.boolean(),
      createdAt: z.string().datetime(),
    }),
  ),
  total: z.number().int().min(0),
  hasMore: z.boolean(),
});

export const FollowingResponseSchema = z.object({
  following: z.array(
    z.object({
      id: IdSchema,
      username: z.string(),
      display_name: z.string().nullable(),
      avatarUrl: z.string().nullable(),
      isFollowing: z.boolean(),
      createdAt: z.string().datetime(),
    }),
  ),
  total: z.number().int().min(0),
  hasMore: z.boolean(),
});

// Block system schemas
export const BlockRequestSchema = z.object({
  targetId: IdSchema,
});

export const BlockResponseSchema = z.object({
  success: z.boolean(),
  isBlocked: z.boolean(),
});

// Presence system schemas
export const PresenceUpdateSchema = z.object({
  status: StatusSchema,
  activity: z
    .object({
      page: z.string().optional(),
      game: z.string().optional(),
      details: z.string().optional(),
    })
    .optional(),
  showActivity: z.boolean().optional(),
});

export const PresenceResponseSchema = z.object({
  profileId: IdSchema,
  status: StatusSchema,
  lastSeen: z.string().datetime(),
  activity: z
    .object({
      page: z.string().optional(),
      game: z.string().optional(),
      details: z.string().optional(),
    })
    .optional(),
  showActivity: z.boolean(),
});

export const FriendsPresenceResponseSchema = z.object({
  friends: z.array(PresenceResponseSchema),
});

// Profile view schemas
export const ProfileViewSchema = z.object({
  id: IdSchema,
  username: z.string(),
  display_name: z.string().nullable(),
  bio: z.string().nullable(),
  location: z.string().nullable(),
  website: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  bannerUrl: z.string().nullable(),
  visibility: VisibilitySchema,
  isFollowing: z.boolean(),
  isBlocked: z.boolean(),
  followerCount: z.number().int().min(0),
  followingCount: z.number().int().min(0),
  sections: z.array(ProfileSectionSchema),
  links: z.array(
    z.object({
      id: IdSchema,
      label: z.string(),
      url: z.string(),
      orderIdx: z.number().int(),
    }),
  ),
  theme: z
    .object({
      themeCode: ThemeCodeSchema,
      accentHex: z.string(),
    })
    .optional(),
  presence: PresenceResponseSchema.optional(),
  createdAt: z.string().datetime(),
});

// Search schemas
export const UserSearchSchema = z.object({
  q: z.string().min(1).max(100),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
});

export const UserSearchResponseSchema = z.object({
  users: z.array(
    z.object({
      id: IdSchema,
      username: z.string(),
      display_name: z.string().nullable(),
      avatarUrl: z.string().nullable(),
      isFollowing: z.boolean(),
      isBlocked: z.boolean(),
      followerCount: z.number().int().min(0),
    }),
  ),
  total: z.number().int().min(0),
  hasMore: z.boolean(),
});

// Type exports
export type ProfileUpdate = z.infer<typeof ProfileUpdateSchema>;
export type ProfileSection = z.infer<typeof ProfileSectionSchema>;
export type ProfileSectionUpdate = z.infer<typeof ProfileSectionUpdateSchema>;
export type ProfileLink = z.infer<typeof ProfileLinkSchema>;
export type ProfileLinkUpdate = z.infer<typeof ProfileLinkUpdateSchema>;
export type ProfileThemeUpdate = z.infer<typeof ProfileThemeUpdateSchema>;
export type FollowRequest = z.infer<typeof FollowRequestSchema>;
export type FollowResponse = z.infer<typeof FollowResponseSchema>;
export type FollowersResponse = z.infer<typeof FollowersResponseSchema>;
export type FollowingResponse = z.infer<typeof FollowingResponseSchema>;
export type BlockRequest = z.infer<typeof BlockRequestSchema>;
export type BlockResponse = z.infer<typeof BlockResponseSchema>;
export type PresenceUpdate = z.infer<typeof PresenceUpdateSchema>;
export type PresenceResponse = z.infer<typeof PresenceResponseSchema>;
export type FriendsPresenceResponse = z.infer<typeof FriendsPresenceResponseSchema>;
export type ProfileView = z.infer<typeof ProfileViewSchema>;
export type UserSearch = z.infer<typeof UserSearchSchema>;
export type UserSearchResponse = z.infer<typeof UserSearchResponseSchema>;
export type GetGameStatsResponse = z.infer<typeof GetGameStatsResponseSchema>;

// Sprint 2: Activity Feed, Notifications, Enhanced Leaderboards

// Activity Feed schemas
export const ActivityTypeSchema = z.enum([
  'achievement',
  'score',
  'purchase',
  'unlock',
  'trade',
  'follow',
]);

export const ActivitySchema = z.object({
  id: IdSchema,
  profileId: IdSchema,
  type: ActivityTypeSchema,
  payload: z.record(z.string(), z.any()).default({}),
  visibility: VisibilitySchema,
  createdAt: z.string().datetime(),
});

export const ActivityFeedRequestSchema = z.object({
  scope: z.enum(['global', 'friends', 'user']).default('friends'),
  type: ActivityTypeSchema.optional(),
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(50).default(20),
});

export const ActivityFeedResponseSchema = z.object({
  activities: z.array(ActivitySchema),
  nextCursor: z.string().optional(),
  hasMore: z.boolean(),
});

// Notification schemas
export const NotificationTypeSchema = z.enum([
  'follow',
  'request',
  'achievement',
  'trade',
  'score-beaten',
  'comment',
  'system',
]);

export const NotificationSchema = z.object({
  id: IdSchema,
  profileId: IdSchema,
  type: NotificationTypeSchema,
  payload: z.record(z.string(), z.any()).default({}),
  read: z.boolean(),
  createdAt: z.string().datetime(),
});

export const NotificationRequestSchema = z.object({
  type: NotificationTypeSchema.optional(),
  read: z.boolean().optional(),
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(50).default(20),
});

export const NotificationResponseSchema = z.object({
  notifications: z.array(NotificationSchema),
  unreadCount: z.number().int().min(0),
  nextCursor: z.string().optional(),
  hasMore: z.boolean(),
});

export const MarkNotificationsReadSchema = z.object({
  notificationIds: z.array(IdSchema),
});

// Enhanced Leaderboard schemas
export const LeaderboardScopeSchema = z.enum(['global', 'friends']);
export const LeaderboardPeriodSchema = z.enum(['daily', 'weekly', 'all']);

export const LeaderboardScoreSchema = z.object({
  boardId: IdSchema,
  profileId: IdSchema,
  score: z.number().int().min(0),
  meta: z.record(z.string(), z.any()).default({}).optional(),
  rank: z.number().int().min(1).optional(),
  createdAt: z.string().datetime(),
});

export const LeaderboardRequestSchema = z.object({
  gameCode: z.string().min(1),
  scope: LeaderboardScopeSchema.default('global'),
  period: LeaderboardPeriodSchema.default('daily'),
  limit: z.number().int().min(1).max(100).default(50),
});

export const LeaderboardResponseSchema = z.object({
  gameCode: z.string(),
  scope: LeaderboardScopeSchema,
  period: LeaderboardPeriodSchema,
  scores: z.array(
    z.object({
      profileId: IdSchema,
      username: z.string(),
      display_name: z.string().nullable(),
      avatarUrl: z.string().nullable(),
      score: z.number().int().min(0),
      rank: z.number().int().min(1),
      meta: z.record(z.string(), z.any()).default({}).optional(),
      createdAt: z.string().datetime(),
    }),
  ),
  userRank: z
    .object({
      rank: z.number().int().min(1).optional(),
      score: z.number().int().min(0).optional(),
    })
    .optional(),
  totalPlayers: z.number().int().min(0),
});

export const SubmitScoreRequestSchema = z.object({
  gameCode: z.string().min(1),
  score: z.number().int().min(0),
  meta: z.record(z.string(), z.any()).default({}).optional(),
});

export const SubmitScoreResponseSchema = z.object({
  success: z.boolean(),
  newRank: z.number().int().min(1).optional(),
  previousRank: z.number().int().min(1).optional(),
  isPersonalBest: z.boolean(),
});

// Type exports
export type Activity = z.infer<typeof ActivitySchema>;
export type ActivityFeedRequest = z.infer<typeof ActivityFeedRequestSchema>;
export type ActivityFeedResponse = z.infer<typeof ActivityFeedResponseSchema>;
export type Notification = z.infer<typeof NotificationSchema>;
export type NotificationRequest = z.infer<typeof NotificationRequestSchema>;
export type NotificationResponse = z.infer<typeof NotificationResponseSchema>;
export type MarkNotificationsRead = z.infer<typeof MarkNotificationsReadSchema>;
export type LeaderboardScore = z.infer<typeof LeaderboardScoreSchema>;
export type LeaderboardRequest = z.infer<typeof LeaderboardRequestSchema>;
export type LeaderboardResponse = z.infer<typeof LeaderboardResponseSchema>;
export type SubmitScoreRequest = z.infer<typeof SubmitScoreRequestSchema>;
export type SubmitScoreResponse = z.infer<typeof SubmitScoreResponseSchema>;

// Character Editor Contracts
export const CharacterPresetSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  category: z.enum(['hair', 'face', 'body', 'clothing', 'accessories']),
  meshData: z.record(z.string(), z.any()).default({}),
  textureData: z.record(z.string(), z.any()).default({}),
  colorPalette: z.array(z.string()),
  rarity: z.enum(['common', 'rare', 'epic', 'legendary']),
  unlockCondition: z.record(z.string(), z.any()).default({}).optional(),
  isDefault: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CharacterConfigSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  isActive: z.boolean(),
  configData: z.record(z.string(), z.any()),
  meshData: z.record(z.string(), z.any()),
  textureData: z.record(z.string(), z.any()),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CharacterReactionSchema = z.object({
  id: z.string(),
  characterConfigId: z.string(),
  context: z.enum(['home', 'shop', 'games', 'social', 'achievements']),
  reactionType: z.enum(['idle', 'happy', 'excited', 'focused', 'sleepy']),
  animationData: z.record(z.string(), z.any()),
  triggerConditions: z.record(z.string(), z.any()).default({}).optional(),
  createdAt: z.string(),
});

export const CharacterPresetRequestSchema = z.object({
  category: z.enum(['hair', 'face', 'body', 'clothing', 'accessories']).optional(),
  rarity: z.enum(['common', 'rare', 'epic', 'legendary']).optional(),
  unlocked: z.boolean().optional(),
});

export const CharacterConfigRequestSchema = z.object({
  name: z.string().min(1).max(50),
  configData: z.record(z.string(), z.any()),
  isActive: z.boolean().optional(),
});

export const CharacterConfigResponseSchema = z.object({
  config: CharacterConfigSchema,
  presets: z.array(CharacterPresetSchema),
  reactions: z.array(CharacterReactionSchema),
});

export const CharacterReactionRequestSchema = z.object({
  characterConfigId: z.string(),
  context: z.enum(['home', 'shop', 'games', 'social', 'achievements']),
  reactionType: z.enum(['idle', 'happy', 'excited', 'focused', 'sleepy']),
  animationData: z.record(z.string(), z.any()),
  triggerConditions: z.record(z.string(), z.any()).default({}).optional(),
});

export const CharacterPresetUnlockSchema = z.object({
  presetId: z.string(),
});

export type CharacterPreset = z.infer<typeof CharacterPresetSchema>;
export type CharacterConfig = z.infer<typeof CharacterConfigSchema>;
export type CharacterReaction = z.infer<typeof CharacterReactionSchema>;
export type CharacterPresetRequest = z.infer<typeof CharacterPresetRequestSchema>;
export type CharacterConfigRequest = z.infer<typeof CharacterConfigRequestSchema>;
export type CharacterConfigResponse = z.infer<typeof CharacterConfigResponseSchema>;
export type CharacterReactionRequest = z.infer<typeof CharacterReactionRequestSchema>;
export type CharacterPresetUnlock = z.infer<typeof CharacterPresetUnlockSchema>;

// Messaging System Contracts
export const CommentSchema = z.object({
  id: z.string(),
  content: z.string(),
  authorId: z.string(),
  parentId: z.string().optional(),
  contentType: z.enum(['profile', 'achievement', 'leaderboard', 'activity']),
  contentId: z.string(),
  isDeleted: z.boolean(),
  isModerated: z.boolean(),
  moderationReason: z.string().optional(),
  likeCount: z.number().int().min(0),
  replyCount: z.number().int().min(0),
  createdAt: z.string(),
  updatedAt: z.string(),
  author: z
    .object({
      id: z.string(),
      username: z.string(),
      display_name: z.string().optional(),
      avatarUrl: z.string().optional(),
    })
    .optional(),
  replies: z.array(z.any()).optional(),
  isLiked: z.boolean().optional(),
});

export const CommentCreateSchema = z.object({
  content: z.string().min(1).max(500),
  contentType: z.enum(['profile', 'achievement', 'leaderboard', 'activity']),
  contentId: z.string(),
  parentId: z.string().optional(),
});

export const CommentUpdateSchema = z.object({
  content: z.string().min(1).max(500),
});

export const CommentLikeSchema = z.object({
  commentId: z.string(),
});

export const CommentReportSchema = z.object({
  commentId: z.string(),
  reason: z.enum(['spam', 'harassment', 'inappropriate', 'other']),
  description: z.string().max(200).optional(),
});

export const CommentListRequestSchema = z.object({
  contentType: z.enum(['profile', 'achievement', 'leaderboard', 'activity']),
  contentId: z.string(),
  parentId: z.string().optional(),
  limit: z.number().int().min(1).max(50).default(20),
  offset: z.number().int().min(0).default(0),
});

export const CommentListResponseSchema = z.object({
  comments: z.array(CommentSchema),
  totalCount: z.number().int().min(0),
  hasMore: z.boolean(),
});

export const CommentModerationSchema = z.object({
  commentId: z.string(),
  action: z.enum(['approve', 'delete', 'hide']),
  reason: z.string().optional(),
  notes: z.string().max(200).optional(),
});

export type Comment = z.infer<typeof CommentSchema>;
export type CommentCreate = z.infer<typeof CommentCreateSchema>;
export type CommentUpdate = z.infer<typeof CommentUpdateSchema>;
export type CommentLike = z.infer<typeof CommentLikeSchema>;
export type CommentReport = z.infer<typeof CommentReportSchema>;
export type CommentListRequest = z.infer<typeof CommentListRequestSchema>;
export type CommentListResponse = z.infer<typeof CommentListResponseSchema>;
export type CommentModeration = z.infer<typeof CommentModerationSchema>;

// Party & Coop System Contracts
export const PartySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  leaderId: z.string(),
  maxMembers: z.number().int().min(2).max(8),
  isPublic: z.boolean(),
  gameMode: z.enum(['mini-games', 'exploration', 'social', 'custom']).optional(),
  status: z.enum(['open', 'full', 'in-game', 'closed']),
  settings: z.record(z.string(), z.any()).default({}).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  leader: z
    .object({
      id: z.string(),
      username: z.string(),
      display_name: z.string().optional(),
      avatarUrl: z.string().optional(),
    })
    .optional(),
  members: z
    .array(
      z.object({
        id: z.string(),
        userId: z.string(),
        role: z.enum(['leader', 'moderator', 'member']),
        joinedAt: z.string(),
        lastActiveAt: z.string(),
        user: z.object({
          id: z.string(),
          username: z.string(),
          display_name: z.string().optional(),
          avatarUrl: z.string().optional(),
        }),
      }),
    )
    .optional(),
  memberCount: z.number().int().min(0).optional(),
});

export const PartyCreateSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(200).optional(),
  maxMembers: z.number().int().min(2).max(8).default(4),
  isPublic: z.boolean().default(true),
  gameMode: z.enum(['mini-games', 'exploration', 'social', 'custom']).optional(),
  settings: z.record(z.string(), z.any()).default({}).optional(),
});

export const PartyUpdateSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  description: z.string().max(200).optional(),
  maxMembers: z.number().int().min(2).max(8).optional(),
  isPublic: z.boolean().optional(),
  gameMode: z.enum(['mini-games', 'exploration', 'social', 'custom']).optional(),
  status: z.enum(['open', 'full', 'in-game', 'closed']).optional(),
  settings: z.record(z.string(), z.any()).default({}).optional(),
});

export const PartyInvitationSchema = z.object({
  id: z.string(),
  partyId: z.string(),
  inviterId: z.string(),
  inviteeId: z.string(),
  status: z.enum(['pending', 'accepted', 'declined', 'expired']),
  message: z.string().optional(),
  expiresAt: z.string(),
  createdAt: z.string(),
  respondedAt: z.string().optional(),
  party: PartySchema.optional(),
  inviter: z
    .object({
      id: z.string(),
      username: z.string(),
      display_name: z.string().optional(),
      avatarUrl: z.string().optional(),
    })
    .optional(),
  invitee: z
    .object({
      id: z.string(),
      username: z.string(),
      display_name: z.string().optional(),
      avatarUrl: z.string().optional(),
    })
    .optional(),
});

export const PartyInvitationCreateSchema = z.object({
  partyId: z.string(),
  inviteeId: z.string(),
  message: z.string().max(200).optional(),
  expiresAt: z.string().optional(), // ISO string, defaults to 24h from now
});

export const PartyInvitationResponseSchema = z.object({
  invitationId: z.string(),
  status: z.enum(['accepted', 'declined']),
});

export const CoopSessionSchema = z.object({
  id: z.string(),
  partyId: z.string(),
  gameType: z.enum(['mini-game', 'exploration', 'social']),
  gameId: z.string().optional(),
  status: z.enum(['active', 'paused', 'completed', 'abandoned']),
  settings: z.record(z.string(), z.any()).default({}).optional(),
  progress: z.record(z.string(), z.any()).default({}).optional(),
  startedAt: z.string(),
  endedAt: z.string().optional(),
  createdAt: z.string(),
  party: PartySchema.optional(),
  participants: z
    .array(
      z.object({
        id: z.string(),
        userId: z.string(),
        role: z.enum(['player', 'spectator', 'moderator']),
        joinedAt: z.string(),
        leftAt: z.string().optional(),
        stats: z.record(z.string(), z.any()).default({}).optional(),
        user: z.object({
          id: z.string(),
          username: z.string(),
          display_name: z.string().optional(),
          avatarUrl: z.string().optional(),
        }),
      }),
    )
    .optional(),
});

export const CoopSessionCreateSchema = z.object({
  partyId: z.string(),
  gameType: z.enum(['mini-game', 'exploration', 'social']),
  gameId: z.string().optional(),
  settings: z.record(z.string(), z.any()).default({}).optional(),
});

export const CoopSessionUpdateSchema = z.object({
  status: z.enum(['active', 'paused', 'completed', 'abandoned']).optional(),
  settings: z.record(z.string(), z.any()).default({}).optional(),
  progress: z.record(z.string(), z.any()).default({}).optional(),
  endedAt: z.string().optional(),
});

export const PartyMessageSchema = z.object({
  id: z.string(),
  partyId: z.string(),
  authorId: z.string(),
  content: z.string(),
  messageType: z.enum(['text', 'system', 'game_event']),
  metadata: z.record(z.string(), z.any()).default({}).optional(),
  createdAt: z.string(),
  author: z
    .object({
      id: z.string(),
      username: z.string(),
      display_name: z.string().optional(),
      avatarUrl: z.string().optional(),
    })
    .optional(),
});

export const PartyMessageCreateSchema = z.object({
  partyId: z.string(),
  content: z.string().min(1).max(500),
  messageType: z.enum(['text', 'system', 'game_event']).default('text'),
  metadata: z.record(z.string(), z.any()).default({}).optional(),
});

export const PartyListRequestSchema = z.object({
  gameMode: z.enum(['mini-games', 'exploration', 'social', 'custom']).optional(),
  status: z.enum(['open', 'full', 'in-game', 'closed']).optional(),
  isPublic: z.boolean().optional(),
  limit: z.number().int().min(1).max(50).default(20),
  offset: z.number().int().min(0).default(0),
});

export const PartyListResponseSchema = z.object({
  parties: z.array(PartySchema),
  totalCount: z.number().int().min(0),
  hasMore: z.boolean(),
});

export const PartyMessageListRequestSchema = z.object({
  partyId: z.string(),
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
});

export const PartyMessageListResponseSchema = z.object({
  messages: z.array(PartyMessageSchema),
  totalCount: z.number().int().min(0),
  hasMore: z.boolean(),
});

// Type exports
export type Party = z.infer<typeof PartySchema>;
export type PartyCreate = z.infer<typeof PartyCreateSchema>;
export type PartyUpdate = z.infer<typeof PartyUpdateSchema>;
export type PartyInvitation = z.infer<typeof PartyInvitationSchema>;
export type PartyInvitationCreate = z.infer<typeof PartyInvitationCreateSchema>;
export type PartyInvitationResponse = z.infer<typeof PartyInvitationResponseSchema>;
export type CoopSession = z.infer<typeof CoopSessionSchema>;
export type CoopSessionCreate = z.infer<typeof CoopSessionCreateSchema>;
export type CoopSessionUpdate = z.infer<typeof CoopSessionUpdateSchema>;
export type PartyMessage = z.infer<typeof PartyMessageSchema>;
export type PartyMessageCreate = z.infer<typeof PartyMessageCreateSchema>;
export type PartyListRequest = z.infer<typeof PartyListRequestSchema>;
export type PartyListResponse = z.infer<typeof PartyListResponseSchema>;
export type PartyMessageListRequest = z.infer<typeof PartyMessageListRequestSchema>;
export type PartyMessageListResponse = z.infer<typeof PartyMessageListResponseSchema>;

// Safety, Reporting & Moderation System Contracts
export const UserReportSchema = z.object({
  id: z.string(),
  reporterId: z.string(),
  reportedUserId: z.string().optional(),
  contentType: z.enum(['user', 'comment', 'party', 'party_message', 'activity']),
  contentId: z.string().optional(),
  reason: z.enum(['spam', 'harassment', 'inappropriate', 'fake', 'underage', 'other']),
  description: z.string().optional(),
  evidence: z.record(z.string(), z.any()).default({}).optional(),
  status: z.enum(['pending', 'reviewed', 'resolved', 'dismissed']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  assignedModeratorId: z.string().optional(),
  moderatorNotes: z.string().optional(),
  resolution: z
    .enum(['warning', 'content_removed', 'user_suspended', 'user_banned', 'no_action'])
    .optional(),
  createdAt: z.string(),
  resolvedAt: z.string().optional(),
  reporter: z
    .object({
      id: z.string(),
      username: z.string(),
      display_name: z.string().optional(),
      avatarUrl: z.string().optional(),
    })
    .optional(),
  reportedUser: z
    .object({
      id: z.string(),
      username: z.string(),
      display_name: z.string().optional(),
      avatarUrl: z.string().optional(),
    })
    .optional(),
  assignedModerator: z
    .object({
      id: z.string(),
      username: z.string(),
      display_name: z.string().optional(),
      avatarUrl: z.string().optional(),
    })
    .optional(),
});

export const UserReportCreateSchema = z.object({
  reportedUserId: z.string().optional(),
  contentType: z.enum(['user', 'comment', 'party', 'party_message', 'activity']),
  contentId: z.string().optional(),
  reason: z.enum(['spam', 'harassment', 'inappropriate', 'fake', 'underage', 'other']),
  description: z.string().max(1000).optional(),
  evidence: z.record(z.string(), z.any()).default({}).optional(),
});

export const UserReportUpdateSchema = z.object({
  status: z.enum(['pending', 'reviewed', 'resolved', 'dismissed']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  assignedModeratorId: z.string().optional(),
  moderatorNotes: z.string().max(500).optional(),
  resolution: z
    .enum(['warning', 'content_removed', 'user_suspended', 'user_banned', 'no_action'])
    .optional(),
});

export const ModerationActionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  moderatorId: z.string(),
  actionType: z.enum(['warning', 'content_removed', 'suspension', 'ban', 'restriction']),
  reason: z.string(),
  details: z.record(z.string(), z.any()).default({}).optional(),
  reportId: z.string().optional(),
  expiresAt: z.string().optional(),
  isActive: z.boolean(),
  createdAt: z.string(),
  appealedAt: z.string().optional(),
  appealStatus: z.enum(['none', 'pending', 'approved', 'denied']),
  user: z
    .object({
      id: z.string(),
      username: z.string(),
      display_name: z.string().optional(),
      avatarUrl: z.string().optional(),
    })
    .optional(),
  moderator: z
    .object({
      id: z.string(),
      username: z.string(),
      display_name: z.string().optional(),
      avatarUrl: z.string().optional(),
    })
    .optional(),
});

export const ModerationActionCreateSchema = z.object({
  userId: z.string(),
  actionType: z.enum(['warning', 'content_removed', 'suspension', 'ban', 'restriction']),
  reason: z.string().min(1).max(500),
  details: z.record(z.string(), z.any()).default({}).optional(),
  reportId: z.string().optional(),
  expiresAt: z.string().optional(), // ISO string for temporary actions
});

export const ContentModerationSchema = z.object({
  id: z.string(),
  contentType: z.enum(['comment', 'party_message', 'profile_bio', 'activity']),
  contentId: z.string(),
  content: z.string(),
  authorId: z.string(),
  status: z.enum(['pending', 'approved', 'rejected', 'flagged']),
  automatedScore: z.number().min(0).max(1).optional(),
  moderatorId: z.string().optional(),
  moderatorNotes: z.string().optional(),
  flags: z.record(z.string(), z.any()).default({}).optional(),
  createdAt: z.string(),
  reviewedAt: z.string().optional(),
  author: z
    .object({
      id: z.string(),
      username: z.string(),
      display_name: z.string().optional(),
      avatarUrl: z.string().optional(),
    })
    .optional(),
  moderator: z
    .object({
      id: z.string(),
      username: z.string(),
      display_name: z.string().optional(),
      avatarUrl: z.string().optional(),
    })
    .optional(),
});

export const ContentModerationUpdateSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'flagged']).optional(),
  moderatorNotes: z.string().max(500).optional(),
});

export const UserSafetySettingsSchema = z.object({
  id: z.string(),
  userId: z.string(),
  allowFriendRequests: z.boolean(),
  allowPartyInvites: z.boolean(),
  allowMessages: z.boolean(),
  blockedUsers: z.array(z.string()),
  contentFilter: z.enum(['strict', 'moderate', 'lenient']),
  reportNotifications: z.boolean(),
  moderationNotifications: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const UserSafetySettingsUpdateSchema = z.object({
  allowFriendRequests: z.boolean().optional(),
  allowPartyInvites: z.boolean().optional(),
  allowMessages: z.boolean().optional(),
  blockedUsers: z.array(z.string()).optional(),
  contentFilter: z.enum(['strict', 'moderate', 'lenient']).optional(),
  reportNotifications: z.boolean().optional(),
  moderationNotifications: z.boolean().optional(),
});

export const ModeratorRoleSchema = z.object({
  id: z.string(),
  userId: z.string(),
  role: z.enum(['moderator', 'senior_moderator', 'admin']),
  permissions: z.record(z.string(), z.any()),
  assignedBy: z.string(),
  isActive: z.boolean(),
  createdAt: z.string(),
  expiresAt: z.string().optional(),
  user: z
    .object({
      id: z.string(),
      username: z.string(),
      display_name: z.string().optional(),
      avatarUrl: z.string().optional(),
    })
    .optional(),
  assignedByUser: z
    .object({
      id: z.string(),
      username: z.string(),
      display_name: z.string().optional(),
      avatarUrl: z.string().optional(),
    })
    .optional(),
});

export const ModeratorRoleCreateSchema = z.object({
  userId: z.string(),
  role: z.enum(['moderator', 'senior_moderator', 'admin']),
  permissions: z.record(z.string(), z.any()),
  expiresAt: z.string().optional(), // ISO string for temporary roles
});

export const ModerationAppealSchema = z.object({
  id: z.string(),
  actionId: z.string(),
  userId: z.string(),
  reason: z.string(),
  evidence: z.record(z.string(), z.any()).default({}).optional(),
  status: z.enum(['pending', 'under_review', 'approved', 'denied']),
  reviewedBy: z.string().optional(),
  reviewNotes: z.string().optional(),
  createdAt: z.string(),
  resolvedAt: z.string().optional(),
  action: ModerationActionSchema.optional(),
  user: z
    .object({
      id: z.string(),
      username: z.string(),
      display_name: z.string().optional(),
      avatarUrl: z.string().optional(),
    })
    .optional(),
  reviewer: z
    .object({
      id: z.string(),
      username: z.string(),
      display_name: z.string().optional(),
      avatarUrl: z.string().optional(),
    })
    .optional(),
});

export const ModerationAppealCreateSchema = z.object({
  actionId: z.string(),
  reason: z.string().min(1).max(1000),
  evidence: z.record(z.string(), z.any()).default({}).optional(),
});

export const ModerationAppealUpdateSchema = z.object({
  status: z.enum(['pending', 'under_review', 'approved', 'denied']).optional(),
  reviewNotes: z.string().max(500).optional(),
});

export const ReportListRequestSchema = z.object({
  status: z.enum(['pending', 'reviewed', 'resolved', 'dismissed']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  contentType: z.enum(['user', 'comment', 'party', 'party_message', 'activity']).optional(),
  assignedModeratorId: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

export const ReportListResponseSchema = z.object({
  reports: z.array(UserReportSchema),
  totalCount: z.number().int().min(0),
  hasMore: z.boolean(),
});

export const ContentModerationListRequestSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'flagged']).optional(),
  contentType: z.enum(['comment', 'party_message', 'profile_bio', 'activity']).optional(),
  authorId: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

export const ContentModerationListResponseSchema = z.object({
  content: z.array(ContentModerationSchema),
  totalCount: z.number().int().min(0),
  hasMore: z.boolean(),
});

// Type exports
export type UserReport = z.infer<typeof UserReportSchema>;
export type UserReportCreate = z.infer<typeof UserReportCreateSchema>;
export type UserReportUpdate = z.infer<typeof UserReportUpdateSchema>;
export type ModerationAction = z.infer<typeof ModerationActionSchema>;
export type ModerationActionCreate = z.infer<typeof ModerationActionCreateSchema>;
export type ContentModeration = z.infer<typeof ContentModerationSchema>;
export type ContentModerationUpdate = z.infer<typeof ContentModerationUpdateSchema>;
export type UserSafetySettings = z.infer<typeof UserSafetySettingsSchema>;
export type UserSafetySettingsUpdate = z.infer<typeof UserSafetySettingsUpdateSchema>;
export type ModeratorRole = z.infer<typeof ModeratorRoleSchema>;
export type ModeratorRoleCreate = z.infer<typeof ModeratorRoleCreateSchema>;
export type ModerationAppeal = z.infer<typeof ModerationAppealSchema>;
export type ModerationAppealCreate = z.infer<typeof ModerationAppealCreateSchema>;
export type ModerationAppealUpdate = z.infer<typeof ModerationAppealUpdateSchema>;
export type ReportListRequest = z.infer<typeof ReportListRequestSchema>;
export type ReportListResponse = z.infer<typeof ReportListResponseSchema>;
export type ContentModerationListRequest = z.infer<typeof ContentModerationListRequestSchema>;
export type ContentModerationListResponse = z.infer<typeof ContentModerationListResponseSchema>;

// Search & Discovery Schemas
export const SearchHistorySchema = z.object({
  id: z.string(),
  userId: z.string(),
  query: z.string(),
  searchType: z.enum(['people', 'content', 'products', 'all']),
  filters: z.record(z.string(), z.any()).default({}).optional(),
  resultCount: z.number().int().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const SearchSuggestionSchema = z.object({
  id: z.string(),
  query: z.string(),
  suggestionType: z.enum(['user', 'product', 'content', 'tag']),
  targetId: z.string().optional(),
  targetType: z.string().optional(),
  popularity: z.number().int(),
  lastUsed: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const SearchAnalyticsSchema = z.object({
  id: z.string(),
  query: z.string(),
  searchType: z.string(),
  resultCount: z.number().int(),
  clickedResultId: z.string().optional(),
  clickedResultType: z.string().optional(),
  sessionId: z.string().optional(),
  userId: z.string().optional(),
  createdAt: z.string(),
});

export const SearchRequestSchema = z.object({
  query: z.string().min(1).max(100),
  searchType: z.enum(['people', 'content', 'products', 'all']).default('all'),
  filters: z
    .object({
      contentType: z.enum(['user', 'product', 'comment', 'party', 'activity']).optional(),
      dateRange: z
        .object({
          start: z.string().optional(),
          end: z.string().optional(),
        })
        .optional(),
      userId: z.string().optional(),
      tags: z.array(z.string()).optional(),
      // Product-specific filters
      minPrice: z.number().optional(),
      maxPrice: z.number().optional(),
      inStock: z.boolean().optional(),
      category: z.string().optional(),
    })
    .optional(),
  limit: z.number().int().min(1).max(50).default(20),
  offset: z.number().int().min(0).default(0),
});

export const SearchResultSchema = z.object({
  id: z.string(),
  type: z.enum(['user', 'product', 'comment', 'party', 'activity']),
  title: z.string(),
  description: z.string().optional(),
  url: z.string(),
  relevanceScore: z.number().optional(),
  metadata: z.record(z.string(), z.any()).default({}).optional(),
});

export const SearchResponseSchema = z.object({
  results: z.array(SearchResultSchema),
  totalCount: z.number().int().min(0),
  hasMore: z.boolean(),
  suggestions: z.array(SearchSuggestionSchema).optional(),
  filters: z.record(z.string(), z.any()).default({}).optional(),
});

export const SearchSuggestionRequestSchema = z.object({
  query: z.string().min(1).max(50),
  searchType: z.enum(['people', 'content', 'products', 'all']).default('all'),
  limit: z.number().int().min(1).max(10).default(5),
});

export const SearchSuggestionResponseSchema = z.object({
  suggestions: z.array(SearchSuggestionSchema),
});

export const SearchHistoryRequestSchema = z.object({
  limit: z.number().int().min(1).max(50).default(20),
  offset: z.number().int().min(0).default(0),
});

export const SearchHistoryResponseSchema = z.object({
  history: z.array(SearchHistorySchema),
  totalCount: z.number().int().min(0),
  hasMore: z.boolean(),
});

export const SearchAnalyticsRequestSchema = z.object({
  query: z.string().min(1).max(100),
  searchType: z.string(),
  resultCount: z.number().int(),
  clickedResultId: z.string().optional(),
  clickedResultType: z.string().optional(),
  sessionId: z.string().optional(),
});

// Type exports
export type SearchHistory = z.infer<typeof SearchHistorySchema>;
export type SearchSuggestion = z.infer<typeof SearchSuggestionSchema>;
export type SearchAnalytics = z.infer<typeof SearchAnalyticsSchema>;
export type SearchRequest = z.infer<typeof SearchRequestSchema>;
export type SearchResult = z.infer<typeof SearchResultSchema>;
export type SearchResponse = z.infer<typeof SearchResponseSchema>;
export type SearchSuggestionRequest = z.infer<typeof SearchSuggestionRequestSchema>;
export type SearchSuggestionResponse = z.infer<typeof SearchSuggestionResponseSchema>;
export type SearchHistoryRequest = z.infer<typeof SearchHistoryRequestSchema>;
export type SearchHistoryResponse = z.infer<typeof SearchHistoryResponseSchema>;
export type SearchAnalyticsRequest = z.infer<typeof SearchAnalyticsRequestSchema>;

// User Settings & Preferences Schemas
export const UserSettingsSchema = z.object({
  id: z.string(),
  userId: z.string(),
  profileVisibility: z.enum(['public', 'friends', 'private']),
  allowFriendRequests: z.boolean(),
  allowPartyInvites: z.boolean(),
  allowMessages: z.boolean(),
  activityVisibility: z.enum(['public', 'friends', 'private']),
  leaderboardOptOut: z.boolean(),
  notificationPreferences: z.object({
    email: z.boolean(),
    push: z.boolean(),
    inApp: z.boolean(),
    friendRequests: z.boolean(),
    partyInvites: z.boolean(),
    achievements: z.boolean(),
    leaderboards: z.boolean(),
    comments: z.boolean(),
    activities: z.boolean(),
  }),
  contentFilter: z.enum(['strict', 'moderate', 'lenient']),
  language: z.string(),
  timezone: z.string(),
  theme: z.enum(['light', 'dark', 'auto']),
  motionReduced: z.boolean(),
  soundEnabled: z.boolean(),
  musicEnabled: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const UserSettingsUpdateSchema = z.object({
  profileVisibility: z.enum(['public', 'friends', 'private']).optional(),
  allowFriendRequests: z.boolean().optional(),
  allowPartyInvites: z.boolean().optional(),
  allowMessages: z.boolean().optional(),
  activityVisibility: z.enum(['public', 'friends', 'private']).optional(),
  leaderboardOptOut: z.boolean().optional(),
  notificationPreferences: z
    .object({
      email: z.boolean().optional(),
      push: z.boolean().optional(),
      inApp: z.boolean().optional(),
      friendRequests: z.boolean().optional(),
      partyInvites: z.boolean().optional(),
      achievements: z.boolean().optional(),
      leaderboards: z.boolean().optional(),
      comments: z.boolean().optional(),
      activities: z.boolean().optional(),
    })
    .optional(),
  contentFilter: z.enum(['strict', 'moderate', 'lenient']).optional(),
  language: z.string().optional(),
  timezone: z.string().optional(),
  theme: z.enum(['light', 'dark', 'auto']).optional(),
  motionReduced: z.boolean().optional(),
  soundEnabled: z.boolean().optional(),
  musicEnabled: z.boolean().optional(),
});

export const PrivacySettingsSchema = z.object({
  id: z.string(),
  userId: z.string(),
  showOnlineStatus: z.boolean(),
  showLastSeen: z.boolean(),
  showActivity: z.boolean(),
  showAchievements: z.boolean(),
  showLeaderboardScores: z.boolean(),
  showPartyActivity: z.boolean(),
  showPurchaseHistory: z.boolean(),
  allowSearchIndexing: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const PrivacySettingsUpdateSchema = z.object({
  showOnlineStatus: z.boolean().optional(),
  showLastSeen: z.boolean().optional(),
  showActivity: z.boolean().optional(),
  showAchievements: z.boolean().optional(),
  showLeaderboardScores: z.boolean().optional(),
  showPartyActivity: z.boolean().optional(),
  showPurchaseHistory: z.boolean().optional(),
  allowSearchIndexing: z.boolean().optional(),
});

export const GameSettingsSchema = z.object({
  id: z.string(),
  userId: z.string(),
  gameCode: z.enum(['petal_samurai', 'puzzle_reveal', 'bubble_girl', 'memory_match']),
  difficulty: z.enum(['easy', 'normal', 'hard']),
  soundEffects: z.boolean(),
  music: z.boolean(),
  hapticFeedback: z.boolean(),
  autoSave: z.boolean(),
  customSettings: z.record(z.string(), z.any()).default({}).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const GameSettingsUpdateSchema = z.object({
  gameCode: z.enum(['petal_samurai', 'puzzle_reveal', 'bubble_girl', 'memory_match']),
  difficulty: z.enum(['easy', 'normal', 'hard']).optional(),
  soundEffects: z.boolean().optional(),
  music: z.boolean().optional(),
  hapticFeedback: z.boolean().optional(),
  autoSave: z.boolean().optional(),
  customSettings: z.record(z.string(), z.any()).default({}).optional(),
});

export const GameSettingsListRequestSchema = z.object({
  gameCode: z.enum(['petal_samurai', 'puzzle_reveal', 'bubble_girl', 'memory_match']).optional(),
});

export const GameSettingsListResponseSchema = z.object({
  settings: z.array(GameSettingsSchema),
});

// Type exports
export type UserSettings = z.infer<typeof UserSettingsSchema>;
export type UserSettingsUpdate = z.infer<typeof UserSettingsUpdateSchema>;
export type PrivacySettings = z.infer<typeof PrivacySettingsSchema>;
export type PrivacySettingsUpdate = z.infer<typeof PrivacySettingsUpdateSchema>;
export type GameSettings = z.infer<typeof GameSettingsSchema>;
export type GameSettingsUpdate = z.infer<typeof GameSettingsUpdateSchema>;
export type GameSettingsListRequest = z.infer<typeof GameSettingsListRequestSchema>;
export type GameSettingsListResponse = z.infer<typeof GameSettingsListResponseSchema>;
