/**
 * Character Converter Utilities
 * Converts between AvatarConfiguration and AvatarProfile formats
 * Ensures all character data flows through AvatarConfiguration
 */

import type { AvatarConfiguration } from '@/app/lib/3d/avatar-parts';
import type { AvatarProfile, ColorPalette } from '@om/avatar-engine/types/avatar';

/**
 * Extract color palette from AvatarConfiguration
 */
function extractColorPalette(config: AvatarConfiguration): ColorPalette {
  const skinColor =
    typeof config.materialOverrides?.skin?.value === 'string'
      ? config.materialOverrides.skin.value
      : config.materialOverrides?.skin?.value instanceof Object
        ? `#${(config.materialOverrides.skin.value as any).getHexString()}`
        : '#FFDBAC';

  const hairColor =
    typeof config.materialOverrides?.hair?.value === 'string'
      ? config.materialOverrides.hair.value
      : config.materialOverrides?.hair?.value instanceof Object
        ? `#${(config.materialOverrides.hair.value as any).getHexString()}`
        : '#3D2817';

  const outfitColor =
    typeof config.materialOverrides?.clothing_primary?.value === 'string'
      ? config.materialOverrides.clothing_primary.value
      : config.materialOverrides?.clothing_primary?.value instanceof Object
        ? `#${(config.materialOverrides.clothing_primary.value as any).getHexString()}`
        : '#666666';

  // Extract eye color from material overrides or use default
  const eyesColor = '#4A5568'; // Default eye color

  // Extract accent color (could be from accessories or outfit secondary)
  const accentColor =
    typeof config.materialOverrides?.accent?.value === 'string'
      ? config.materialOverrides.accent.value
      : '#FF69B4'; // Default pink accent

  return {
    skin: skinColor,
    hair: hairColor,
    eyes: eyesColor,
    outfit: outfitColor,
    accent: accentColor,
  };
}

/**
 * Convert AvatarConfiguration to AvatarProfile
 */
export function avatarConfigToProfile(config: AvatarConfiguration): AvatarProfile {
  const colorPalette = extractColorPalette(config);

  // Map parts to AvatarProfile format
  const head = config.parts.head || 'head_default';
  const torso = config.parts.torso || config.parts.body || 'torso_default';
  const legs = config.parts.legs || 'legs_default';
  const accessory = config.parts.accessories || config.parts.jewelry || undefined;

  // Extract morph weights (flatten nested structure if needed)
  const morphWeights: Record<string, number> = {};
  Object.entries(config.morphTargets || {}).forEach(([key, value]) => {
    morphWeights[key] = value;
  });

  // Extract NSFW layers if applicable
  const nsfwLayers: string[] = [];
  if (config.showNsfwContent && config.contentRating !== 'sfw') {
    if (config.parts.lingerie) nsfwLayers.push('lingerie');
    if (config.parts.intimate_accessories) nsfwLayers.push('intimate_accessories');
    if (config.parts.nsfw_anatomy) nsfwLayers.push('nsfw_anatomy');
  }

  return {
    id: config.id,
    head,
    torso,
    legs,
    accessory,
    colorPalette,
    morphWeights: Object.keys(morphWeights).length > 0 ? morphWeights : undefined,
    nsfwLayers: nsfwLayers.length > 0 ? nsfwLayers : undefined,
  };
}

/**
 * Convert AvatarProfile to AvatarConfiguration (partial)
 * This is used when loading existing profiles into the editor
 */
export function avatarProfileToConfig(
  profile: AvatarProfile,
  userId: string,
): Partial<AvatarConfiguration> {
  const materialOverrides: Record<string, any> = {};

  // Set skin color
  if (profile.colorPalette.skin) {
    materialOverrides.skin = {
      slot: 'skin',
      type: 'color',
      value: profile.colorPalette.skin,
    };
  }

  // Set hair color
  if (profile.colorPalette.hair) {
    materialOverrides.hair = {
      slot: 'hair',
      type: 'color',
      value: profile.colorPalette.hair,
    };
  }

  // Set outfit color
  if (profile.colorPalette.outfit) {
    materialOverrides.clothing_primary = {
      slot: 'clothing',
      type: 'color',
      value: profile.colorPalette.outfit,
    };
  }

  // Set accent color
  if (profile.colorPalette.accent) {
    materialOverrides.accent = {
      slot: 'accent',
      type: 'color',
      value: profile.colorPalette.accent,
    };
  }

  const parts: Partial<Record<string, string>> = {};
  if (profile.head) parts.head = profile.head;
  if (profile.torso) parts.torso = profile.torso;
  if (profile.legs) parts.legs = profile.legs;
  if (profile.accessory) parts.accessories = profile.accessory;

  // Determine base model from parts or default to female
  let baseModel: 'male' | 'female' | 'custom' = 'female';
  if (profile.head?.includes('male') || profile.torso?.includes('male')) {
    baseModel = 'male';
  }

  // Determine content rating
  const contentRating = profile.nsfwLayers && profile.nsfwLayers.length > 0 ? 'nsfw' : 'sfw';

  return {
    id: profile.id,
    userId,
    baseModel,
    parts,
    morphTargets: profile.morphWeights || {},
    materialOverrides,
    contentRating,
    showNsfwContent: contentRating !== 'sfw',
    ageVerified: contentRating !== 'sfw',
    defaultAnimation: 'idle',
    idleAnimations: ['idle', 'idle_2'],
    allowExport: false,
    exportFormat: 'glb',
  };
}

/**
 * Validate AvatarConfiguration integrity
 */
export function validateAvatarConfiguration(config: Partial<AvatarConfiguration>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!config.id) {
    errors.push('Missing id');
  }

  if (!config.userId) {
    errors.push('Missing userId');
  }

  if (!config.baseModel) {
    errors.push('Missing baseModel');
  } else if (!['male', 'female', 'custom'].includes(config.baseModel)) {
    errors.push(`Invalid baseModel: ${config.baseModel}`);
  }

  if (config.contentRating && !['sfw', 'nsfw', 'explicit'].includes(config.contentRating)) {
    errors.push(`Invalid contentRating: ${config.contentRating}`);
  }

  // Validate morph targets are within reasonable ranges
  if (config.morphTargets) {
    Object.entries(config.morphTargets).forEach(([key, value]) => {
      if (typeof value !== 'number' || value < -2 || value > 2) {
        errors.push(`Invalid morph target ${key}: ${value} (should be between -2 and 2)`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Normalize AvatarConfiguration (ensure all required fields are present)
 */
export function normalizeAvatarConfiguration(
  config: Partial<AvatarConfiguration>,
  userId: string,
): AvatarConfiguration {
  const now = new Date();

  return {
    id: config.id || `config_${Date.now()}`,
    userId: config.userId || userId,
    baseModel: config.baseModel || 'female',
    baseModelUrl: config.baseModelUrl,
    parts: config.parts || {},
    morphTargets: config.morphTargets || {},
    materialOverrides: config.materialOverrides || {},
    contentRating: config.contentRating || 'sfw',
    showNsfwContent: config.showNsfwContent ?? false,
    ageVerified: config.ageVerified ?? false,
    defaultAnimation: config.defaultAnimation || 'idle',
    idleAnimations: config.idleAnimations || ['idle', 'idle_2'],
    allowExport: config.allowExport ?? false,
    exportFormat: config.exportFormat || 'glb',
    createdAt: config.createdAt || now,
    updatedAt: config.updatedAt || now,
  };
}
