/**
 * Avatar profile and representation types
 */

export interface ColorPalette {
  skin: string;
  hair: string;
  eyes: string;
  outfit: string;
  accent: string;
}

export interface AvatarProfile {
  id: string;
  head: string; // asset ID or 'procedural'
  torso: string;
  legs: string;
  accessory?: string;
  colorPalette: ColorPalette;
  morphWeights?: Record<string, number>;
  nsfwLayers?: string[]; // Only if NSFW_AVATARS_ENABLED
}

export interface ShadingConfig {
  rimPower: number;
  rimColor: string;
  toonSteps: number;
  smoothness: number;
  bloomIntensity: number;
  outlineWidth: number;
  outlineColor: string;
}

export type RepresentationMode = 'fullBody' | 'bust' | 'portrait' | 'chibi';

export interface AvatarRepresentationConfig {
  mode: RepresentationMode;
  scale: [number, number, number];
  cameraOffset: [number, number, number];
  shadingTweaks: ShadingConfig;
  preset?: string;
}

export interface AssetMeta {
  id: string;
  slot: 'Head' | 'Torso' | 'Legs' | 'Accessory';
  nsfw: boolean;
  url: string;
  host: 'local' | 'cdn';
  hash: string;
  coverage: 'standard' | 'minimal' | 'full';
}

export interface AssetRegistry {
  version: number;
  assets: Record<string, AssetMeta>;
  fallbacks: Record<'Head' | 'Torso' | 'Legs' | 'Accessory', string>;
}
