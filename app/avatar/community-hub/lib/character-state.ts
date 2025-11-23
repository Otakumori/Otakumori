/**
 * Character state management and TypeScript interfaces
 */

import { DEFAULT_CHARACTER_CONFIG } from './constants';

export interface CharacterConfig {
  gender: 'male' | 'female';
  faceId: number;
  baseBody: string;
  hair: {
    style: string;
    rootColor: string;
    tipColor: string;
    gloss: number;
  };
  eyes: {
    irisShape: number;
    colorLeft: string;
    colorRight: string;
  };
  outfit: {
    id: string;
    primaryColor: string;
    secondaryColor: string;
  };
  accessories: Array<{
    id: string;
    pos: [number, number, number];
    rot: [number, number, number];
    scale: number;
  }>;
  physique: {
    height: number;
    width: number;
    bust: number;
    waist: number;
    hips: number;
  };
  skinTone: string;
}

export type CharacterConfigKey = keyof CharacterConfig;

/**
 * Create a default character configuration
 */
export function createDefaultConfig(): CharacterConfig {
  return JSON.parse(JSON.stringify(DEFAULT_CHARACTER_CONFIG));
}

/**
 * Validate character configuration
 */
export function validateConfig(config: Partial<CharacterConfig>): config is CharacterConfig {
  return (
    typeof config.gender === 'string' &&
    (config.gender === 'male' || config.gender === 'female') &&
    typeof config.faceId === 'number' &&
    typeof config.baseBody === 'string' &&
    config.hair !== undefined &&
    config.eyes !== undefined &&
    config.outfit !== undefined &&
    Array.isArray(config.accessories) &&
    config.physique !== undefined &&
    typeof config.skinTone === 'string'
  );
}

/**
 * Deep clone configuration
 */
export function cloneConfig(config: CharacterConfig): CharacterConfig {
  return JSON.parse(JSON.stringify(config));
}

/**
 * Generate a random configuration
 */
export function generateRandomConfig(): CharacterConfig {
  const config = createDefaultConfig();
  
  // Random gender
  config.gender = Math.random() > 0.5 ? 'male' : 'female';
  
  // Random face
  config.faceId = Math.floor(Math.random() * 4) + 1;
  
  // Random hair style
  const hairStyles = ['short', 'long', 'twin-tails', 'ponytail', 'bob', 'messy'];
  config.hair.style = hairStyles[Math.floor(Math.random() * hairStyles.length)];
  
  // Random hair colors
  const hairColors = ['#FF66CC', '#FFAAC0', '#8B4513', '#000000', '#FFD700', '#FF1493'];
  config.hair.rootColor = hairColors[Math.floor(Math.random() * hairColors.length)];
  config.hair.tipColor = hairColors[Math.floor(Math.random() * hairColors.length)];
  config.hair.gloss = Math.random();
  
  // Random eye colors
  const eyeColors = ['#4B0082', '#0000FF', '#00CED1', '#8B008B', '#FF1493'];
  config.eyes.colorLeft = eyeColors[Math.floor(Math.random() * eyeColors.length)];
  config.eyes.colorRight = eyeColors[Math.floor(Math.random() * eyeColors.length)];
  
  // Random outfit
  const outfits = ['casual', 'school', 'dress', 'sporty'];
  config.outfit.id = outfits[Math.floor(Math.random() * outfits.length)];
  
  // Random outfit colors
  const outfitColors = ['#1C1C1C', '#444444', '#8B0000', '#000080', '#4B0082'];
  config.outfit.primaryColor = outfitColors[Math.floor(Math.random() * outfitColors.length)];
  config.outfit.secondaryColor = outfitColors[Math.floor(Math.random() * outfitColors.length)];
  
  // Random physique
  config.physique.height = 0.3 + Math.random() * 0.4;
  config.physique.width = 0.3 + Math.random() * 0.4;
  config.physique.bust = 0.3 + Math.random() * 0.4;
  config.physique.waist = 0.3 + Math.random() * 0.4;
  config.physique.hips = 0.3 + Math.random() * 0.4;
  
  // Random skin tone
  const skinTones = ['#FFDBAC', '#F4C2A1', '#E6BC9A', '#D4A574', '#C68642'];
  config.skinTone = skinTones[Math.floor(Math.random() * skinTones.length)];
  
  // Random accessories (0-2)
  const accessoryCount = Math.floor(Math.random() * 3);
  const accessoryTypes = ['horn_01', 'horn_02', 'tail_01', 'tail_02', 'goggles', 'mask'];
  config.accessories = [];
  for (let i = 0; i < accessoryCount; i++) {
    config.accessories.push({
      id: accessoryTypes[Math.floor(Math.random() * accessoryTypes.length)],
      pos: [
        (Math.random() - 0.5) * 0.2,
        1.5 + (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 0.2,
      ],
      rot: [
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.5,
      ],
      scale: 0.8 + Math.random() * 0.4,
    });
  }
  
  return config;
}

