// Placeholder Drizzle schema - this project uses Prisma instead
// This file exists to satisfy any remaining imports during the transition

export const users = {} as any;
export const posts = {} as any;
export const profiles = {} as any;
export const orders = {} as any;
export const orderItems = {} as any;
export const products = {} as any;
export const productVariants = {} as any;
export const cartItems = {} as any;
export const wishlistItems = {} as any;
export const rewardLedger = {} as any;
export const contentPages = {} as any;

// Export any other tables that might be referenced
export const cosmetics = {} as any;
export const achievements = {} as any;
export const userAchievements = {} as any;
export const echoLikes = {} as any;
export const petalnoteLikes = {} as any;

// Export types from deprecated lib/assets/schema.ts for backward compatibility
import { z } from 'zod';

export const ImageRef = z.object({
  url: z.string().min(1),
  alt: z.string().min(1),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

export const OGSources = z.object({
  default: ImageRef,
  productTemplate: ImageRef.optional(),
});

export const CategoryBanner = ImageRef;

export type TImageRef = z.infer<typeof ImageRef>;
export type TOGSources = z.infer<typeof OGSources>;
export type TCategoryBanner = z.infer<typeof CategoryBanner>;
