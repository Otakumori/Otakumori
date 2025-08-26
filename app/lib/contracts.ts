/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import { z } from 'zod';

// Game API Contracts
export const GameStartRequestSchema = z.object({
  gameKey: z.string().min(1),
  idempotencyKey: z.string().min(1)
});

export const GameStartResponseSchema = z.object({
  ok: z.boolean(),
  data: z.object({
    runId: z.string(),
    seed: z.number(),
    flags: z.record(z.any()).optional()
  }).optional(),
  error: z.string().optional()
});

export const GameFinishRequestSchema = z.object({
  runId: z.string().min(1),
  score: z.number().min(0),
  statsHash: z.string().min(1),
  meta: z.record(z.any()).optional(),
  idempotencyKey: z.string().min(1)
});

export const GameFinishResponseSchema = z.object({
  ok: z.boolean(),
  data: z.object({
    petalsAwarded: z.number(),
    itemsGranted: z.array(z.string()).optional(),
    achievements: z.array(z.string()).optional(),
    balance: z.number(),
    runeGrants: z.number().optional()
  }).optional(),
  error: z.string().optional()
});

export const GameProgressRequestSchema = z.object({
  runId: z.string().min(1),
  checkpoint: z.string().min(1),
  data: z.record(z.any()),
  idempotencyKey: z.string().min(1)
});

export const GameProgressResponseSchema = z.object({
  ok: z.boolean(),
  data: z.object({
    acknowledged: z.boolean(),
    timestamp: z.number()
  }).optional(),
  error: z.string().optional()
});

// Achievement Contracts
export const AchievementUnlockRequestSchema = z.object({
  achievementCode: z.string().min(1),
  idempotencyKey: z.string().min(1)
});

export const AchievementUnlockResponseSchema = z.object({
  ok: z.boolean(),
  data: z.object({
    achievementId: z.string(),
    rewardGranted: z.boolean(),
    rewardDetails: z.record(z.any()).optional()
  }).optional(),
  error: z.string().optional()
});

// Achievement List Contracts
export const AchievementSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  description: z.string(),
  unlocked: z.boolean(),
  unlockedAt: z.string().optional(),
  iconUrl: z.string().optional()
});

export const GetAchievementsResponseSchema = z.object({
  ok: z.boolean(),
  data: z.object({
    achievements: z.array(AchievementSchema),
    total: z.number()
  }).optional(),
  error: z.string().optional()
});

// Inventory Contracts
export const InventoryItemSchema = z.object({
  id: z.string(),
  sku: z.string(),
  kind: z.enum(['COSMETIC', 'OVERLAY']),
  acquiredAt: z.string(),
  metadata: z.record(z.any()).optional()
});

export const GetInventoryResponseSchema = z.object({
  ok: z.boolean(),
  data: z.object({
    items: z.array(InventoryItemSchema),
    total: z.number()
  }).optional(),
  error: z.string().optional()
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
  redeemedAt: z.string().optional()
});

export const GetCouponsResponseSchema = z.object({
  ok: z.boolean(),
  data: z.object({
    coupons: z.array(CouponGrantSchema),
    total: z.number()
  }).optional(),
  error: z.string().optional()
});

// Game Stats Contracts
export const GameStatsSchema = z.object({
  gameKey: z.string(),
  totalRuns: z.number(),
  bestScore: z.number(),
  averageScore: z.number(),
  totalPetalsEarned: z.number(),
  lastPlayed: z.string().optional()
});

export const GetGameStatsResponseSchema = z.object({
  ok: z.boolean(),
  data: z.object({
    stats: z.array(GameStatsSchema),
    totalStats: z.object({
      totalRuns: z.number(),
      totalPetalsEarned: z.number(),
      favoriteGame: z.string().optional()
    })
  }).optional(),
  error: z.string().optional()
});

// Admin Contracts
export const AdminUpdateGameFlagRequestSchema = z.object({
  gameKey: z.string().min(1),
  enabled: z.boolean(),
  idempotencyKey: z.string().min(1)
});

export const AdminUpdateGameFlagResponseSchema = z.object({
  ok: z.boolean(),
  data: z.object({
    updated: z.boolean(),
    gameKey: z.string(),
    enabled: z.boolean()
  }).optional(),
  error: z.string().optional()
});

export const AdminUpdateDailyLimitRequestSchema = z.object({
  newLimit: z.number().min(1).max(10000),
  idempotencyKey: z.string().min(1)
});

export const AdminUpdateDailyLimitResponseSchema = z.object({
  ok: z.boolean(),
  data: z.object({
    updated: z.boolean(),
    newLimit: z.number(),
    previousLimit: z.number()
  }).optional(),
  error: z.string().optional()
});

// Petal Shop Contracts
export const PetalShopItemSchema = z.object({
  id: z.string(),
  sku: z.string(),
  name: z.string(),
  kind: z.string(),
  priceRunes: z.number().nullable(),
  pricePetals: z.number().nullable(),
  eventTag: z.string().nullable(),
  visibleFrom: z.string().nullable(),
  visibleTo: z.string().nullable(),
  metadata: z.record(z.any()).nullable(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const GetPetalShopItemsResponseSchema = z.object({
  ok: z.boolean(),
  data: z.object({
    items: z.array(PetalShopItemSchema),
    total: z.number()
  }).optional(),
  error: z.string().optional()
});

// Product Shop Contracts
export const ProductVariantSchema = z.object({
  id: z.string(),
  productId: z.string(),
  previewImageUrl: z.string().nullable(),
  printifyVariantId: z.number(),
  printProviderName: z.string().nullable(),
  leadMinDays: z.number().nullable(),
  leadMaxDays: z.number().nullable(),
  isEnabled: z.boolean(),
  inStock: z.boolean(),
  priceCents: z.number().nullable(),
  currency: z.string(),
  stripePriceId: z.string().nullable()
});

export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  primaryImageUrl: z.string().nullable(),
  stripeProductId: z.string().nullable(),
  printifyProductId: z.string().nullable(),
  active: z.boolean(),
  category: z.string().nullable(),
  isNSFW: z.boolean(),
  variants: z.array(ProductVariantSchema)
});

export const GetProductsResponseSchema = z.object({
  ok: z.boolean(),
  data: z.object({
    products: z.array(ProductSchema),
    total: z.number()
  }).optional(),
  error: z.string().optional()
});

// Type exports
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
export type GetInventoryResponse = z.infer<typeof GetInventoryResponseSchema>;
export type GetCouponsResponse = z.infer<typeof GetCouponsResponseSchema>;
export type GetGameStatsResponse = z.infer<typeof GetGameStatsResponseSchema>;
export type AdminUpdateGameFlagRequest = z.infer<typeof AdminUpdateGameFlagRequestSchema>;
export type AdminUpdateGameFlagResponse = z.infer<typeof AdminUpdateGameFlagResponseSchema>;
export type AdminUpdateDailyLimitRequest = z.infer<typeof AdminUpdateDailyLimitRequestSchema>;
export type AdminUpdateDailyLimitResponse = z.infer<typeof AdminUpdateDailyLimitResponseSchema>;

// Petal Shop Types
export type PetalShopItem = z.infer<typeof PetalShopItemSchema>;
export type GetPetalShopItemsResponse = z.infer<typeof GetPetalShopItemsResponseSchema>;

// Product Shop Types
export type ProductVariant = z.infer<typeof ProductVariantSchema>;
export type Product = z.infer<typeof ProductSchema>;
export type GetProductsResponse = z.infer<typeof GetProductsResponseSchema>;
