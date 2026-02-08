import { z } from 'zod';

/**
 * Canonical Avatar Configuration Schema
 * 
 * Simplified schema for game avatar integration.
 * All games can use this schema without knowing storage details.
 */

export const AvatarColorSchema = z.object({
  primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  secondary: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  accent: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

export const AvatarBodySchema = z.object({
  type: z.string().default('default'),
  height: z.number().min(0.7).max(1.3).default(1.0),
  weight: z.number().min(0.6).max(1.5).default(1.0),
  proportions: z.object({
    headSize: z.number().min(0.8).max(1.2).default(1.0),
    shoulderWidth: z.number().min(0.7).max(1.4).default(1.0),
    chestSize: z.number().min(0.6).max(1.4).default(1.0),
    waistSize: z.number().min(0.6).max(1.3).default(1.0),
    hipWidth: z.number().min(0.7).max(1.4).default(1.0),
  }).default({}),
});

export const AvatarHairSchema = z.object({
  style: z.string().default('default'),
  length: z.number().min(0.0).max(1.0).default(0.5),
  color: AvatarColorSchema,
});

export const AvatarOutfitSchema = z.object({
  type: z.string().default('casual'),
  color: AvatarColorSchema,
  pattern: z.string().optional(),
});

export const AvatarAccessoriesSchema = z.array(z.string()).default([]);

export const AvatarColorsSchema = z.object({
  skin: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#ffdbac'),
  hair: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#3d2817'),
  eyes: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#4a5568'),
  outfit: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#666666'),
  accent: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#ff69b4'),
});

/**
 * Canonical Avatar Configuration
 * 
 * This is the schema that all games should use.
 * Storage details are abstracted away.
 */
export const AvatarConfigSchema = z.object({
  body: AvatarBodySchema,
  hair: AvatarHairSchema,
  outfit: AvatarOutfitSchema,
  accessories: AvatarAccessoriesSchema,
  colors: AvatarColorsSchema,
  nsfwEnabled: z.boolean().default(false),
  version: z.number().int().positive().default(1),
});

export type AvatarConfig = z.infer<typeof AvatarConfigSchema>;
export type AvatarBody = z.infer<typeof AvatarBodySchema>;
export type AvatarHair = z.infer<typeof AvatarHairSchema>;
export type AvatarOutfit = z.infer<typeof AvatarOutfitSchema>;
export type AvatarColors = z.infer<typeof AvatarColorsSchema>;

/**
 * Default avatar configuration
 * Used as fallback when user has no avatar or loading fails
 */
export const DEFAULT_AVATAR_CONFIG: AvatarConfig = {
  body: {
    type: 'default',
    height: 1.0,
    weight: 1.0,
    proportions: {
      headSize: 1.0,
      shoulderWidth: 1.0,
      chestSize: 1.0,
      waistSize: 1.0,
      hipWidth: 1.0,
    },
  },
  hair: {
    style: 'default',
    length: 0.5,
    color: {
      primary: '#3d2817',
    },
  },
  outfit: {
    type: 'casual',
    color: {
      primary: '#666666',
    },
  },
  accessories: [],
  colors: {
    skin: '#ffdbac',
    hair: '#3d2817',
    eyes: '#4a5568',
    outfit: '#666666',
    accent: '#ff69b4',
  },
  nsfwEnabled: false,
  version: 1,
};

/**
 * Validate and normalize avatar config
 */
export function validateAvatarConfig(data: unknown): AvatarConfig {
  const result = AvatarConfigSchema.safeParse(data);
  if (!result.success) {
    // Return default on validation failure
    return DEFAULT_AVATAR_CONFIG;
  }
  return result.data;
}

/**
 * Filter NSFW parts from accessories if NSFW is disabled
 */
export function filterNSFWParts(config: AvatarConfig): AvatarConfig {
  if (config.nsfwEnabled) {
    return config;
  }

  // Filter out NSFW accessories
  const nsfwAccessoryPatterns = ['nsfw', 'adult', 'explicit'];
  const filteredAccessories = config.accessories.filter(
    (accessory) => !nsfwAccessoryPatterns.some((pattern) => 
      accessory.toLowerCase().includes(pattern)
    )
  );

  return {
    ...config,
    accessories: filteredAccessories,
  };
}

