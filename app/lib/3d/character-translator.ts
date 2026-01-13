/**
 * Character Translation System
 * Converts creator character config to game-appropriate representation
 * Handles perspective, rendering style, and quality adaptations
 * Comprehensive error handling
 */

import type { FullCharacterConfig } from '@/app/test/character-creator/types';
import type { AvatarConfiguration } from '@/app/lib/3d/avatar-parts';
import { CODE_VEIN_PRESET, ULTRA_PRESET, type AdvancedCelShadingConfig } from './advanced-cel-shading';

async function getLogger() {
  const { logger } = await import('@/app/lib/logger');
  return logger;
}

export type RepresentationMode =
  | 'fullBody'
  | 'bust'
  | 'portrait'
  | 'chibi'
  | 'firstPerson'
  | 'handsOnly'
  | 'sideScroller'
  | 'stageFullBody';

export interface GamePerspective {
  type: 'first-person' | 'third-person' | 'top-down' | 'side-scroller' | 'isometric';
  cameraOffset: [number, number, number];
  cameraRotation?: [number, number, number];
  fov?: number;
  lookAt?: [number, number, number];
}

export interface RenderingStyle {
  type: 'anime-cel' | 'anime-soft' | 'realistic' | 'stylized' | 'low-poly';
  celShadingConfig?: AdvancedCelShadingConfig | 'code-vein' | 'ultra';
  shaderConfig?: {
    toonSteps?: number;
    outlineWidth?: number;
    bloomIntensity?: number;
    roughness?: number;
    metalness?: number;
  };
}

export interface GameTranslationConfig {
  gameId: string;
  representationMode: RepresentationMode;
  perspective: GamePerspective;
  renderingStyle: RenderingStyle;
  qualityPreset: 'low' | 'medium' | 'high' | 'ultra';
  lodLevel?: 'high' | 'medium' | 'low';
  visibleParts?: string[];
  hideParts?: string[];
  customScale?: [number, number, number];
  animationSet?: string[];
  customLighting?: {
    intensity?: number;
    color?: string;
    position?: [number, number, number];
  };
}

export interface TranslatedCharacterConfig {
  avatarConfig: AvatarConfiguration;
  representationConfig: {
    mode: RepresentationMode;
    scale: [number, number, number];
    cameraOffset: [number, number, number];
    cameraRotation?: [number, number, number];
    fov?: number;
    visibleParts: string[];
    hideParts: string[];
  };
  renderingConfig: RenderingStyle;
  qualityConfig: {
    lodLevel: 'high' | 'medium' | 'low';
    textureResolution: number;
    geometryComplexity: number;
  };
  lightingConfig: {
    intensity: number;
    color: string;
    position: [number, number, number];
  };
}

/**
 * Game-specific translation configs
 * Pre-configured for each game type
 */
export const GAME_TRANSLATION_CONFIGS: Record<string, GameTranslationConfig> = {
  // Third-person action game (like Petal Samurai)
  'petal-samurai': {
    gameId: 'petal-samurai',
    representationMode: 'fullBody',
    perspective: {
      type: 'third-person',
      cameraOffset: [0, 1.5, 3.5],
      fov: 50,
      lookAt: [0, 1.0, 0],
    },
    renderingStyle: {
      type: 'anime-cel',
      celShadingConfig: 'code-vein',
      shaderConfig: {
        toonSteps: 4,
        outlineWidth: 0.015,
        bloomIntensity: 0.5,
      },
    },
    qualityPreset: 'high',
    visibleParts: ['head', 'torso', 'arms', 'legs', 'hair', 'clothing'],
    animationSet: ['idle', 'run', 'attack', 'defend', 'dodge'],
  },

  // First-person game
  'fps-game': {
    gameId: 'fps-game',
    representationMode: 'firstPerson',
    perspective: {
      type: 'first-person',
      cameraOffset: [0, 1.6, 0],
      fov: 75,
    },
    renderingStyle: {
      type: 'realistic',
      shaderConfig: {
        roughness: 0.4,
        metalness: 0.1,
      },
    },
    qualityPreset: 'ultra',
    visibleParts: ['arms', 'hands', 'weapon'],
    hideParts: ['head', 'torso', 'legs', 'hair'],
    animationSet: ['idle', 'aim', 'reload', 'throw'],
  },

  // Side-scroller game
  'side-scroller': {
    gameId: 'side-scroller',
    representationMode: 'sideScroller',
    perspective: {
      type: 'side-scroller',
      cameraOffset: [2, 1.5, 0],
      cameraRotation: [0, Math.PI / 2, 0],
      fov: 45,
    },
    renderingStyle: {
      type: 'stylized',
      celShadingConfig: {
        baseColor: '#fdbcb4',
        toonSteps: 3,
        rimIntensity: 0.8,
        outlineWidth: 0.02,
      },
      shaderConfig: {
        toonSteps: 3,
        outlineWidth: 0.02,
        bloomIntensity: 0.4,
      },
    },
    qualityPreset: 'medium',
    customScale: [1.2, 1.2, 1.2],
    animationSet: ['idle', 'run', 'jump', 'fall'],
  },

  // Puzzle/portrait game
  'puzzle-reveal': {
    gameId: 'puzzle-reveal',
    representationMode: 'portrait',
    perspective: {
      type: 'third-person',
      cameraOffset: [0, 1.0, 2.0],
      fov: 45,
      lookAt: [0, 1.2, 0],
    },
    renderingStyle: {
      type: 'anime-soft',
      celShadingConfig: {
        baseColor: '#ffdbac',
        toonSteps: 2,
        rimIntensity: 0.6,
        outlineWidth: 0.012,
        bloomIntensity: 0.6,
      },
      shaderConfig: {
        toonSteps: 2,
        outlineWidth: 0.012,
        bloomIntensity: 0.6,
      },
    },
    qualityPreset: 'high',
    visibleParts: ['head', 'shoulders', 'hair'],
    hideParts: ['arms', 'torso', 'legs'],
    animationSet: ['idle', 'blink', 'smile'],
  },

  // Chibi/cute style game
  'chibi-game': {
    gameId: 'chibi-game',
    representationMode: 'chibi',
    perspective: {
      type: 'third-person',
      cameraOffset: [0, 0.8, 2.5],
      fov: 55,
    },
    renderingStyle: {
      type: 'stylized',
      celShadingConfig: {
        baseColor: '#ffdbac',
        toonSteps: 2,
        rimIntensity: 0.8,
        outlineWidth: 0.025,
        bloomIntensity: 0.8,
      },
      shaderConfig: {
        toonSteps: 2,
        outlineWidth: 0.025,
        bloomIntensity: 0.8,
      },
    },
    qualityPreset: 'medium',
    customScale: [0.7, 0.7, 0.7],
    animationSet: ['idle', 'wave', 'jump', 'dance'],
  },

  // Top-down strategy game
  'top-down': {
    gameId: 'top-down',
    representationMode: 'stageFullBody',
    perspective: {
      type: 'top-down',
      cameraOffset: [0, 4, 0],
      cameraRotation: [-Math.PI / 2, 0, 0],
      fov: 60,
    },
    renderingStyle: {
      type: 'low-poly',
      shaderConfig: {
        toonSteps: 2,
        roughness: 0.6,
      },
    },
    qualityPreset: 'low',
    lodLevel: 'low',
    animationSet: ['idle', 'walk', 'attack'],
  },
};

/**
 * Translate creator character config to game-specific representation
 * Comprehensive error handling
 */
export function translateCharacterForGame(
  creatorConfig: FullCharacterConfig,
  gameConfig: GameTranslationConfig
): TranslatedCharacterConfig {
  try {
    if (!creatorConfig) {
      throw new Error('Creator config is required');
    }

    if (!gameConfig) {
      throw new Error('Game config is required');
    }

    // Convert creator config to avatar config
    const avatarConfig = creatorConfigToAvatarConfig(creatorConfig);

    // Get representation transform based on mode
    const representationTransform = getRepresentationTransform(gameConfig.representationMode);

    // Determine scale
    const scale = gameConfig.customScale || representationTransform.scale;

    // Determine visible/hidden parts
    const visibleParts = gameConfig.visibleParts || representationTransform.defaultVisibleParts;
    const hideParts = gameConfig.hideParts || representationTransform.defaultHideParts;

    // Determine quality settings
    const qualityConfig = getQualityConfig(gameConfig.qualityPreset, gameConfig.lodLevel);

    // Determine lighting
    const lightingConfig = gameConfig.customLighting
      ? {
          intensity: gameConfig.customLighting.intensity || 1.0,
          color: gameConfig.customLighting.color || '#ffffff',
          position: gameConfig.customLighting.position || [1, 1, 1],
        }
      : {
          intensity: 1.0,
          color: '#ffffff',
          position: [1, 1, 1] as [number, number, number],
        };

    // Process rendering style
    const renderingConfig = processRenderingStyle(gameConfig.renderingStyle);

    return {
      avatarConfig,
      representationConfig: {
        mode: gameConfig.representationMode,
        scale,
        cameraOffset: gameConfig.perspective.cameraOffset,
        cameraRotation: gameConfig.perspective.cameraRotation,
        fov: gameConfig.perspective.fov,
        visibleParts,
        hideParts,
      },
      renderingConfig,
      qualityConfig,
      lightingConfig,
    };
  } catch (error) {
    getLogger().then((logger) => {
      logger.error('Failed to translate character:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    });
    throw error;
  }
}

/**
 * Get representation transform for a mode
 */
function getRepresentationTransform(mode: RepresentationMode): {
  scale: [number, number, number];
  defaultVisibleParts: string[];
  defaultHideParts: string[];
} {
  switch (mode) {
    case 'fullBody':
      return {
        scale: [1, 1, 1],
        defaultVisibleParts: ['head', 'torso', 'arms', 'legs', 'hair'],
        defaultHideParts: [],
      };
    case 'bust':
      return {
        scale: [1.2, 1.2, 1.2],
        defaultVisibleParts: ['head', 'shoulders', 'torso', 'hair'],
        defaultHideParts: ['arms', 'legs'],
      };
    case 'portrait':
      return {
        scale: [1.5, 1.5, 1.5],
        defaultVisibleParts: ['head', 'shoulders', 'hair'],
        defaultHideParts: ['torso', 'arms', 'legs'],
      };
    case 'chibi':
      return {
        scale: [0.7, 0.7, 0.7],
        defaultVisibleParts: ['head', 'torso', 'arms', 'legs', 'hair'],
        defaultHideParts: [],
      };
    case 'firstPerson':
      return {
        scale: [1, 1, 1],
        defaultVisibleParts: ['arms', 'hands'],
        defaultHideParts: ['head', 'torso', 'legs', 'hair'],
      };
    case 'handsOnly':
      return {
        scale: [2, 2, 2],
        defaultVisibleParts: ['hands'],
        defaultHideParts: ['head', 'torso', 'arms', 'legs', 'hair'],
      };
    case 'sideScroller':
      return {
        scale: [1.2, 1.2, 1.2],
        defaultVisibleParts: ['head', 'torso', 'arms', 'legs', 'hair'],
        defaultHideParts: [],
      };
    case 'stageFullBody':
      return {
        scale: [1, 1, 1],
        defaultVisibleParts: ['head', 'torso', 'arms', 'legs', 'hair'],
        defaultHideParts: [],
      };
    default:
      return {
        scale: [1, 1, 1],
        defaultVisibleParts: ['head', 'torso', 'arms', 'legs', 'hair'],
        defaultHideParts: [],
      };
  }
}

/**
 * Convert creator config to avatar config
 */
function creatorConfigToAvatarConfig(
  creatorConfig: FullCharacterConfig
): AvatarConfiguration {
  try {
    return {
      id: `creator-${Date.now()}`,
      userId: 'guest',
      baseModel: creatorConfig.gender === 'male' ? 'male' : 'female',
      parts: {
        head: creatorConfig.face?.shape || 'oval',
        torso: 'torso_default',
        hair: 'hair_default',
      },
      morphTargets: {
        breastSize: creatorConfig.torso?.breastSize || 1.0,
        hipWidth: creatorConfig.hips?.width || 1.0,
        waistSize: creatorConfig.torso?.waistWidth || 0.8,
        eyeSize: creatorConfig.eyes?.size || 1.2,
        noseWidth: creatorConfig.nose?.width || 1.0,
        noseHeight: creatorConfig.nose?.height || 1.0,
        mouthWidth: creatorConfig.mouth?.width || 1.0,
        lipThickness: creatorConfig.mouth?.upperLipThickness || 1.0,
      },
      materialOverrides: {
        skin: {
          slot: 'skin',
          type: 'color',
          value: creatorConfig.skin?.tone || '#fde4d0',
          roughness: 1.0 - (creatorConfig.skin?.glossiness || 0.3),
          metallic: 0.0,
        },
        hair: {
          slot: 'hair',
          type: 'color',
          value: creatorConfig.hair?.baseColor || '#f5deb3',
          roughness: 0.7,
          metallic: 0.0,
        },
      },
      contentRating: creatorConfig.nsfw?.enabled ? 'nsfw' : 'sfw',
      showNsfwContent: creatorConfig.nsfw?.enabled || false,
      ageVerified: false,
      defaultAnimation: 'idle',
      idleAnimations: ['idle', 'breathe'],
      allowExport: true,
      exportFormat: 'glb',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error) {
    getLogger().then((logger) => {
      logger.error('Failed to convert creator config:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    });
    throw error;
  }
}

/**
 * Process rendering style configuration
 */
function processRenderingStyle(
  style: RenderingStyle
): RenderingStyle {
  try {
    // Handle preset names
    if (style.celShadingConfig === 'code-vein') {
      return {
        ...style,
        celShadingConfig: CODE_VEIN_PRESET.config,
      };
    } else if (style.celShadingConfig === 'ultra') {
      return {
        ...style,
        celShadingConfig: ULTRA_PRESET.config,
      };
    }

    return style;
  } catch (error) {
    getLogger().then((logger) => {
      logger.error('Failed to process rendering style:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    });
    // Return default style
    return {
      type: 'anime-cel',
      celShadingConfig: CODE_VEIN_PRESET.config,
    };
  }
}

/**
 * Get quality configuration
 */
function getQualityConfig(
  qualityPreset: 'low' | 'medium' | 'high' | 'ultra',
  lodLevel?: 'high' | 'medium' | 'low'
): {
  lodLevel: 'high' | 'medium' | 'low';
  textureResolution: number;
  geometryComplexity: number;
} {
  const qualityMap = {
    low: { textureResolution: 512, geometryComplexity: 0.5 },
    medium: { textureResolution: 1024, geometryComplexity: 0.75 },
    high: { textureResolution: 2048, geometryComplexity: 1.0 },
    ultra: { textureResolution: 4096, geometryComplexity: 1.5 },
  };

  const quality = qualityMap[qualityPreset];
  const finalLodLevel = lodLevel || (qualityPreset === 'ultra' ? 'high' : qualityPreset === 'high' ? 'medium' : 'low');

  return {
    lodLevel: finalLodLevel,
    textureResolution: quality.textureResolution,
    geometryComplexity: quality.geometryComplexity,
  };
}

/**
 * Get game translation config by game ID
 */
export function getGameTranslationConfig(gameId: string): GameTranslationConfig | null {
  try {
    return GAME_TRANSLATION_CONFIGS[gameId] || null;
  } catch (error) {
    getLogger().then((logger) => {
      logger.error('Failed to get game translation config:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    });
    return null;
  }
}

/**
 * Validate game translation config
 */
export function validateGameTranslationConfig(
  config: GameTranslationConfig
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.gameId) {
    errors.push('Game ID is required');
  }

  if (!config.representationMode) {
    errors.push('Representation mode is required');
  }

  if (!config.perspective) {
    errors.push('Perspective is required');
  } else {
    if (!config.perspective.type) {
      errors.push('Perspective type is required');
    }
    if (!config.perspective.cameraOffset || config.perspective.cameraOffset.length !== 3) {
      errors.push('Camera offset must be a 3-element array');
    }
  }

  if (!config.renderingStyle) {
    errors.push('Rendering style is required');
  }

  if (!config.qualityPreset) {
    errors.push('Quality preset is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

