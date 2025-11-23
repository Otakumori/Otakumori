/**
 * Create Game Presets Script
 * Generates preset characters for each mini-game using the character creator system
 * These presets are created via AvatarConfiguration and stored in the database
 */

import { PrismaClient } from '@prisma/client';
import type { AvatarConfiguration } from '@/app/lib/3d/avatar-parts';
import { avatarPartManager } from '@/app/lib/3d/avatar-parts';

const prisma = new PrismaClient();

/**
 * 90s Anime Style Presets
 * Each preset represents a character with 90s anime aesthetic
 */
const GAME_PRESETS: Array<{
  gameId: string;
  name: string;
  description: string;
  category: string;
  config: Partial<AvatarConfiguration>;
}> = [
  // Petal Samurai - Warrior character
  {
    gameId: 'petal-samurai',
    name: 'Sakura Warrior',
    description: 'A fierce warrior with pink hair and traditional samurai attire',
    category: 'action',
    config: {
      baseModel: 'female',
      parts: {
        head: 'head_001',
        hair: 'hair_long_pink',
        body: 'body_athletic',
        clothing: 'clothing_samurai',
        accessories: 'accessory_katana',
      },
      morphTargets: {
        eyeSize: 1.2, // Large anime eyes
        eyeShape: 0.8, // Round eyes
        cheekbones: 0.6,
        hip_width: 0.9,
        thigh_thickness: 0.8,
      },
      materialOverrides: {
        skin: {
          slot: 'skin',
          type: 'color',
          value: '#FFDBAC',
        },
        hair: {
          slot: 'hair',
          type: 'color',
          value: '#FF69B4', // Pink hair
        },
        clothing_primary: {
          slot: 'clothing',
          type: 'color',
          value: '#8B0000', // Dark red
        },
      },
      contentRating: 'sfw',
      showNsfwContent: false,
      ageVerified: false,
      defaultAnimation: 'idle',
      idleAnimations: ['idle', 'idle_2'],
      allowExport: false,
      exportFormat: 'glb',
    },
  },

  // Memory Match - Cute character
  {
    gameId: 'memory-match',
    name: 'Memory Keeper',
    description: 'A cute character with big eyes and colorful outfit',
    category: 'puzzle',
    config: {
      baseModel: 'female',
      parts: {
        head: 'head_001',
        hair: 'hair_twin_tails',
        body: 'body_petite',
        clothing: 'clothing_school_uniform',
        accessories: 'accessory_glasses',
      },
      morphTargets: {
        eyeSize: 1.5, // Very large eyes
        eyeShape: 1.0, // Round
        cheekbones: 0.7,
        hip_width: 0.8,
        thigh_thickness: 0.7,
      },
      materialOverrides: {
        skin: {
          slot: 'skin',
          type: 'color',
          value: '#FFE4B5',
        },
        hair: {
          slot: 'hair',
          type: 'color',
          value: '#FFD700', // Gold hair
        },
        clothing_primary: {
          slot: 'clothing',
          type: 'color',
          value: '#4169E1', // Royal blue
        },
      },
      contentRating: 'sfw',
      showNsfwContent: false,
      ageVerified: false,
      defaultAnimation: 'idle',
      idleAnimations: ['idle', 'idle_2'],
      allowExport: false,
      exportFormat: 'glb',
    },
  },

  // Petal Storm Rhythm - Energetic character
  {
    gameId: 'petal-storm-rhythm',
    name: 'Rhythm Dancer',
    description: 'An energetic dancer with flowing hair and dynamic outfit',
    category: 'rhythm',
    config: {
      baseModel: 'female',
      parts: {
        head: 'head_001',
        hair: 'hair_long_flowing',
        body: 'body_athletic',
        clothing: 'clothing_dance_outfit',
        accessories: 'accessory_ribbons',
      },
      morphTargets: {
        eyeSize: 1.3,
        eyeShape: 0.9,
        cheekbones: 0.5,
        hip_width: 1.0,
        thigh_thickness: 0.9,
      },
      materialOverrides: {
        skin: {
          slot: 'skin',
          type: 'color',
          value: '#FFDBAC',
        },
        hair: {
          slot: 'hair',
          type: 'color',
          value: '#FF1493', // Deep pink
        },
        clothing_primary: {
          slot: 'clothing',
          type: 'color',
          value: '#9370DB', // Medium purple
        },
      },
      contentRating: 'sfw',
      showNsfwContent: false,
      ageVerified: false,
      defaultAnimation: 'idle',
      idleAnimations: ['idle', 'idle_2'],
      allowExport: false,
      exportFormat: 'glb',
    },
  },

  // Default preset for games without specific presets
  {
    gameId: 'default',
    name: 'Anime Hero',
    description: 'A classic 90s anime style character',
    category: 'default',
    config: {
      baseModel: 'female',
      parts: {
        head: 'head_001',
        hair: 'hair_medium_wavy',
        body: 'body_normal',
        clothing: 'clothing_casual',
      },
      morphTargets: {
        eyeSize: 1.2,
        eyeShape: 0.9,
        cheekbones: 0.6,
        hip_width: 0.9,
        thigh_thickness: 0.8,
      },
      materialOverrides: {
        skin: {
          slot: 'skin',
          type: 'color',
          value: '#FFDBAC',
        },
        hair: {
          slot: 'hair',
          type: 'color',
          value: '#8B4513', // Brown
        },
        clothing_primary: {
          slot: 'clothing',
          type: 'color',
          value: '#FF69B4', // Pink
        },
      },
      contentRating: 'sfw',
      showNsfwContent: false,
      ageVerified: false,
      defaultAnimation: 'idle',
      idleAnimations: ['idle', 'idle_2'],
      allowExport: false,
      exportFormat: 'glb',
    },
  },
];

/**
 * Create preset from AvatarConfiguration
 */
async function createPreset(
  gameId: string,
  name: string,
  description: string,
  category: string,
  config: Partial<AvatarConfiguration>,
) {
  const fullConfig = avatarPartManager.createConfiguration(
    'preset-system',
    config.baseModel || 'female',
  );
  const mergedConfig: AvatarConfiguration = {
    ...fullConfig,
    ...config,
    id: `preset_${gameId}_${Date.now()}`,
    userId: 'preset-system',
  };

  // Extract color palette for quick access
  const colorPalette = {
    skin:
      typeof mergedConfig.materialOverrides?.skin?.value === 'string'
        ? mergedConfig.materialOverrides.skin.value
        : '#FFDBAC',
    hair:
      typeof mergedConfig.materialOverrides?.hair?.value === 'string'
        ? mergedConfig.materialOverrides.hair.value
        : '#3D2817',
    eyes: '#4A5568',
    outfit:
      typeof mergedConfig.materialOverrides?.clothing_primary?.value === 'string'
        ? mergedConfig.materialOverrides.clothing_primary.value
        : '#666666',
    accent: '#FF69B4',
  };

  // Create preset in database
  const preset = await prisma.characterPreset.create({
    data: {
      name,
      description,
      category,
      meshData: {}, // Will be generated when rendering
      textureData: {}, // Will be generated when rendering
      colorPalette: colorPalette as any,
      configData: mergedConfig as any, // Store full AvatarConfiguration
      rarity: 'common',
      isDefault: gameId === 'default',
      unlockCondition: null,
    },
  });

  console.log(`Created preset: ${preset.name} (${preset.id}) for game: ${gameId}`);
  return preset;
}

/**
 * Main function to create all game presets
 */
async function main() {
  console.log('Creating game presets...');

  try {
    for (const presetData of GAME_PRESETS) {
      await createPreset(
        presetData.gameId,
        presetData.name,
        presetData.description,
        presetData.category,
        presetData.config,
      );
    }

    console.log('✅ All presets created successfully!');
  } catch (error) {
    console.error('❌ Error creating presets:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

export { createPreset, GAME_PRESETS };
