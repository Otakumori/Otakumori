/**
 * Character Config Bridge
 * Converts between FullCharacterConfig (creator format) and AvatarConfiguration (game format)
 * Handles saving/loading character configurations for use across games
 */

import type { FullCharacterConfig } from '@/app/test/character-creator/types';
import type { AvatarConfiguration } from '@/app/lib/3d/avatar-parts';

async function getLogger() {
  const { logger } = await import('@/app/lib/logger');
  return logger;
}

/**
 * Converts FullCharacterConfig (creator format) to AvatarConfiguration (game format)
 */
export function creatorConfigToAvatarConfig(
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
        height: creatorConfig.body?.height || 1.0,
        weight: creatorConfig.body?.weight || 1.0,
        muscularity: creatorConfig.body?.muscularity || 0.5,
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
      logger.error('Failed to convert creator config to avatar config:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    });
    throw error;
  }
}

/**
 * Saves character config for use in games
 */
export async function saveCharacterConfigForGames(
  creatorConfig: FullCharacterConfig,
  userId?: string
): Promise<string> {
  try {
    const avatarConfig = creatorConfigToAvatarConfig(creatorConfig);

    if (userId) {
      // Save to database
      const response = await fetch('/api/v1/character/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(avatarConfig),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to save character config: ${errorText}`);
      }

      const result = await response.json();
      return result.data?.id || 'unknown';
    } else {
      // Save to localStorage for guest
      const key = 'otm-creator-character-config';
      localStorage.setItem(key, JSON.stringify(creatorConfig));
      return 'guest';
    }
  } catch (error) {
    getLogger().then((logger) => {
      logger.error('Failed to save character config:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    });
    throw error;
  }
}

/**
 * Loads character config for use in games
 */
export async function loadCharacterConfigForGames(
  userId?: string
): Promise<FullCharacterConfig | null> {
  try {
    if (userId) {
      // Load from database
      const response = await fetch('/api/v1/character/config');
      if (response.ok) {
        const result = await response.json();
        if (result.ok && result.data) {
          // Convert back from AvatarConfiguration to FullCharacterConfig
          return avatarConfigToCreatorConfig(result.data);
        }
      }
      return null;
    } else {
      // Load from localStorage for guest
      const key = 'otm-creator-character-config';
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored) as FullCharacterConfig;
      }
      return null;
    }
  } catch (error) {
    getLogger().then((logger) => {
      logger.error('Failed to load character config:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    });
    return null;
  }
}

/**
 * Converts AvatarConfiguration back to FullCharacterConfig
 * Simplified version - full mapping would require more context
 */
export function avatarConfigToCreatorConfig(
  avatarConfig: AvatarConfiguration
): FullCharacterConfig {
  try {
    // This is a simplified reverse mapping
    // In a full implementation, you'd want to store the original FullCharacterConfig
    // in the database or include more mapping logic here
    
    const defaultConfig: FullCharacterConfig = {
      name: 'My Character',
      gender: avatarConfig.baseModel === 'male' ? 'male' : 'female',
      physique: 'curvy',
      age: 'young-adult',
      head: {
        size: 1.0,
        width: 1.0,
        depth: 1.0,
      },
      body: {
        height: (avatarConfig.morphTargets.height as number) || 1.0,
        weight: (avatarConfig.morphTargets.weight as number) || 1.0,
        muscularity: (avatarConfig.morphTargets.muscularity as number) || 0.5,
        bodyFat: 0.3,
        posture: 0.8,
      },
      face: {
        shape: (avatarConfig.parts.head as 'oval' | 'round' | 'heart' | 'square' | 'diamond') || 'oval',
        cheekbones: 0.5,
        jawWidth: 0.5,
        jawDepth: 0.5,
        chinShape: 0.5,
        chinProminence: 0.5,
        foreheadHeight: 0.5,
      },
      eyes: {
        preset: 'anime-sparkle',
        size: (avatarConfig.morphTargets.eyeSize as number) || 1.2,
        spacing: 1.0,
        depth: 0.5,
        tilt: 0.0,
        irisSize: 0.7,
        pupilSize: 0.35,
        irisColor: '#4a90e2',
        scleraColor: '#ffffff',
        pupilColor: '#000000',
        highlightStyle: 'double',
        highlightColor: '#ffffff',
        highlightIntensity: 0.5,
        eyelidShape: 0.5,
        eyelashLength: 0.5,
      },
      eyebrows: {
        style: 'default',
        thickness: 0.5,
        arch: 0.5,
        angle: 0.0,
        color: '#000000',
      },
      nose: {
        width: (avatarConfig.morphTargets.noseWidth as number) || 1.0,
        height: (avatarConfig.morphTargets.noseHeight as number) || 1.0,
        length: 1.0,
        bridgeWidth: 0.5,
        bridgeDepth: 0.5,
        tipShape: 0.5,
        nostrilSize: 0.5,
        nostrilFlare: 0.5,
      },
      mouth: {
        width: (avatarConfig.morphTargets.mouthWidth as number) || 1.0,
        size: 1.0,
        upperLipThickness: (avatarConfig.morphTargets.lipThickness as number) || 1.0,
        lowerLipThickness: 1.0,
        cornerPosition: 0.0,
        philtrumDepth: 0.5,
      },
      ears: {
        size: 1.0,
        angle: 0.0,
        lobeShape: 0.5,
      },
      neck: {
        thickness: 0.5,
        length: 1.0,
        adamsApple: 0.0,
      },
      hair: {
        baseStyle: 'long-straight',
        length: 1.0,
        volume: 1.0,
        baseColor: (typeof avatarConfig.materialOverrides.hair?.value === 'string' 
          ? avatarConfig.materialOverrides.hair.value 
          : '#f5deb3') || '#f5deb3',
        highlightsEnabled: false,
        highlightColor: '#ffffff',
        highlightPattern: 'streaks',
        splitColor: false,
        splitColorRight: '#ffffff',
        extensions: [],
        physicsEnabled: true,
        physicsIntensity: 0.5,
      },
      torso: {
        chestWidth: 1.0,
        chestDepth: 1.0,
        abdomenDefinition: 0.5,
        waistWidth: (avatarConfig.morphTargets.waistSize as number) || 0.8,
        breastSize: (avatarConfig.morphTargets.breastSize as number) || 1.0,
        breastShape: 0.5,
        breastSeparation: 0.5,
        breastSag: 0.0,
        pectoralSize: 0.5,
      },
      shoulders: {
        width: 1.0,
        angle: 0.0,
        definition: 0.5,
      },
      arms: {
        upperArmSize: 1.0,
        forearmSize: 1.0,
        armLength: 1.0,
        shoulderShape: 0.5,
      },
      hands: {
        fingerLength: 1.0,
        fingerThickness: 0.5,
        nailLength: 0.5,
        nailColor: '#ffffff',
      },
      hips: {
        width: (avatarConfig.morphTargets.hipWidth as number) || 1.0,
        depth: 1.0,
        shape: 0.5,
      },
      buttocks: {
        size: 1.0,
        shape: 0.5,
        lift: 0.5,
      },
      legs: {
        thighCircumference: 1.0,
        calfSize: 1.0,
        upperLegLength: 1.0,
        lowerLegLength: 1.0,
        kneeDefinition: 0.5,
        thighGap: 0.5,
      },
      feet: {
        size: 1.0,
      },
      skin: {
        tone: (typeof avatarConfig.materialOverrides.skin?.value === 'string' 
          ? avatarConfig.materialOverrides.skin.value 
          : '#fde4d0') || '#fde4d0',
        smoothness: 0.8,
        glossiness: 1.0 - ((avatarConfig.materialOverrides.skin?.roughness as number) || 0.7),
        pores: 0.2,
        freckles: 0.0,
        freckleColor: '#d4a574',
        moles: 0.0,
        beautyMarks: [],
        acne: 0.0,
        acneColor: '#ff0000',
        flushedCheeks: 0.2,
        flushedColor: '#ff6b9d',
        tanLines: false,
      },
      scars: [],
      tattoos: [],
      piercings: [],
      facialHair: {
        style: 'none',
        thickness: 0.0,
        color: '#000000',
      },
      bodyHair: {
        chest: 0.0,
        back: 0.0,
        arms: 0.0,
        legs: 0.0,
        color: '#000000',
      },
      nsfw: {
        enabled: avatarConfig.showNsfwContent || false,
        genitals: {
          type: 'none',
          size: 1.0,
          detail: 0.5,
        },
        breasts: {
          nippleSize: 1.0,
          nippleShape: 0.5,
          nippleColor: '#f4a6b8',
          areolaSize: 1.0,
          areolaColor: '#f4a6b8',
        },
        pubicHair: {
          style: 'none',
          density: 0.0,
          color: '#000000',
        },
      },
      outfit: {
        innerwear: {
          bra: null,
          braColor: '#ffffff',
          panties: null,
          pantiesColor: '#ffffff',
        },
        top: {
          style: '',
          color: '#ffffff',
          pattern: 'solid',
          patternColor: '#ffffff',
          metallic: 0.0,
          collarColor: '#ffffff',
          sleevesColor: '#ffffff',
          mainColor: '#ffffff',
        },
        bottom: {
          style: '',
          color: '#ffffff',
          pattern: 'solid',
          patternColor: '#ffffff',
        },
        shoes: {
          style: '',
          color: '#000000',
        },
        accessories: [],
        bloodVeil: {
          style: '',
          color: '#ffffff',
          visible: false,
        },
      },
      physics: {
        enabled: true,
        quality: 'high' as const,
        breast: {
          jiggleIntensity: 0.5,
          jiggleSpeed: 1.0,
          damping: 0.5,
          gravity: 1.0,
        },
        butt: {
          jiggleIntensity: 0.5,
          damping: 0.5,
        },
        hair: {
          swayIntensity: 0.5,
          windResponse: 0.5,
          damping: 0.5,
        },
        clothing: {
          clothPhysics: false,
          stiffness: 0.5,
          damping: 0.5,
        },
      },
      makeup: {
        foundation: {
          enabled: false,
          color: '#fde4d0',
          opacity: 1.0,
        },
        blush: {
          enabled: false,
          color: '#ffb3ba',
          intensity: 0.5,
          placement: 'cheeks',
        },
        eyeshadow: {
          enabled: false,
          color: '#e4c4a8',
          intensity: 0.5,
          style: 'natural',
        },
        eyeliner: {
          enabled: false,
          color: '#000000',
          thickness: 0.5,
          style: 'thin',
        },
        lipstick: {
          enabled: false,
          color: '#f5a9a9',
          glossiness: 0.5,
          style: 'natural',
        },
      },
      vfx: {
        aura: {
          enabled: false,
          type: 'glow',
          color: '#ffffff',
          intensity: 0.5,
        },
        glow: {
          enabled: false,
          parts: [],
          color: '#ffffff',
          intensity: 0.5,
        },
        particles: {
          enabled: false,
          type: 'sparkles',
          density: 0.5,
          color: '#ffffff',
        },
      },
      expression: {
        default: 'neutral',
        eyebrowAngle: 0.0,
        mouthCorners: 0.0,
      },
      animations: {
        idlePose: 'standing',
        walkStyle: 'normal',
      },
      meta: {
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: '1.0.0',
        presetBase: null,
      },
    };

    return defaultConfig;
  } catch (error) {
    getLogger().then((logger) => {
      logger.error('Failed to convert avatar config to creator config:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    });
    throw error;
  }
}

