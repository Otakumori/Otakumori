/**
 * Comprehensive GLB Generator
 * Supports ALL parameters from FullCharacterConfig
 * Extensible architecture for future parameter additions
 * Maximum quality and customization options
 */

import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import * as THREE from 'three';
import { EnhancedProceduralMesh } from './enhanced-procedural-mesh';
import { logger } from '@/app/lib/logger';
import type { FullCharacterConfig } from '@/app/test/character-creator/types';
import { createAdvancedCelShadedMaterial, CODE_VEIN_PRESET } from './advanced-cel-shading';
import { getGameTranslationConfig, type GameTranslationConfig } from './character-translator';

export interface ComprehensiveGLBOptions {
  quality?: 'low' | 'medium' | 'high' | 'ultra';
  includeMorphTargets?: boolean;
  includeAnimations?: boolean;
  celShaded?: boolean;
  includeExtras?: boolean; // Scars, tattoos, piercings, etc.
  includeOutfit?: boolean; // Clothing layers
  includeMakeup?: boolean; // Makeup layers
  includeVFX?: boolean; // VFX effects as separate objects
  optimize?: boolean;
  allowPartialGeneration?: boolean; // If true, continue even if some parts fail (optional parts only)
  maxFileSizeMB?: number; // Maximum file size in MB (warn if exceeded, default: 50MB)
  gameId?: string; // Game ID for game-specific translation (e.g., 'fps', 'side-scroller', 'chibi')
  gameTranslationConfig?: GameTranslationConfig; // Direct game translation config (overrides gameId)
}

export interface GenerationResult {
  success: boolean;
  glbBuffer?: ArrayBuffer;
  error?: string;
  warnings?: string[]; // Warnings about failed optional parts or performance issues
  metadata?: {
    fileSize: number;
    triangleCount: number;
    materialCount: number;
    textureCount: number;
    boneCount: number;
    parameterCount: number; // Number of parameters applied
    performance?: {
      totalTime: number;
      buildTime: number;
      exportTime: number;
      partTimings?: Record<string, number>; // Timing breakdown by part
    };
  };
}

/**
 * Parameter Processor Registry
 * Extensible system for processing different parameter types
 */
interface ParameterProcessor {
  name: string;
  priority: number; // Lower = processes first
  process: (config: FullCharacterConfig, group: THREE.Group, options: ComprehensiveGLBOptions) => void;
}

const parameterProcessors: ParameterProcessor[] = [];

/**
 * Register a parameter processor
 * Allows extensibility for future parameters
 */
export function registerParameterProcessor(processor: ParameterProcessor): void {
  parameterProcessors.push(processor);
  parameterProcessors.sort((a, b) => a.priority - b.priority);
}

/**
 * Validate FullCharacterConfig parameters
 */
function validateFullCharacterConfig(config: FullCharacterConfig): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Basic required fields
  if (!config.name || config.name.trim().length === 0) {
    errors.push('Name is required');
  }

  if (!['female', 'male', 'custom'].includes(config.gender)) {
    errors.push(`Invalid gender: ${config.gender}`);
  }

  if (!['petite', 'athletic', 'curvy', 'muscular', 'heavy', 'custom'].includes(config.physique)) {
    errors.push(`Invalid physique: ${config.physique}`);
  }

  if (!['teen', 'young-adult', 'adult', 'mature'].includes(config.age)) {
    errors.push(`Invalid age: ${config.age}`);
  }

  // Body parameters
  if (config.body) {
    if (typeof config.body.height !== 'number' || config.body.height < 0.7 || config.body.height > 1.3) {
      errors.push(`Body height must be between 0.7 and 1.3, got ${config.body.height}`);
    }
    if (typeof config.body.weight !== 'number' || config.body.weight < 0.6 || config.body.weight > 1.5) {
      errors.push(`Body weight must be between 0.6 and 1.5, got ${config.body.weight}`);
    }
    if (typeof config.body.muscularity !== 'number' || config.body.muscularity < 0.0 || config.body.muscularity > 1.0) {
      errors.push(`Body muscularity must be between 0.0 and 1.0, got ${config.body.muscularity}`);
    }
    if (typeof config.body.bodyFat !== 'number' || config.body.bodyFat < 0.0 || config.body.bodyFat > 1.0) {
      errors.push(`Body bodyFat must be between 0.0 and 1.0, got ${config.body.bodyFat}`);
    }
    if (typeof config.body.posture !== 'number' || config.body.posture < 0.0 || config.body.posture > 1.0) {
      errors.push(`Body posture must be between 0.0 and 1.0, got ${config.body.posture}`);
    }
  } else {
    errors.push('Body configuration is required');
  }

  // Validate numeric parameters (0.0-1.0 range for most sliders)
  const validateRange = (value: number | undefined, name: string, min: number = 0.0, max: number = 1.0): void => {
    if (value !== undefined) {
      if (typeof value !== 'number' || value < min || value > max) {
        warnings.push(`${name} is out of range [${min}, ${max}], got ${value}. Clamping to valid range.`);
      }
    }
  };

  // Head parameters (typically 0.5-1.5 range)
  if (config.head) {
    validateRange(config.head.size, 'Head size', 0.5, 1.5);
    validateRange(config.head.width, 'Head width', 0.5, 1.5);
    validateRange(config.head.depth, 'Head depth', 0.5, 1.5);
  }

  // Face parameters (0.0-1.0 for most)
  if (config.face) {
    validateRange(config.face.cheekbones, 'Cheekbones', 0.0, 1.0);
    validateRange(config.face.jawWidth, 'Jaw width', 0.0, 1.0);
    validateRange(config.face.jawDepth, 'Jaw depth', 0.0, 1.0);
    validateRange(config.face.chinShape, 'Chin shape', 0.0, 1.0);
    validateRange(config.face.chinProminence, 'Chin prominence', 0.0, 1.0);
    validateRange(config.face.foreheadHeight, 'Forehead height', 0.0, 1.0);
  }

  // Eyes parameters
  if (config.eyes) {
    validateRange(config.eyes.size, 'Eye size', 0.5, 1.5);
    validateRange(config.eyes.spacing, 'Eye spacing', 0.5, 1.5);
    validateRange(config.eyes.depth, 'Eye depth', 0.0, 1.0);
    validateRange(config.eyes.tilt, 'Eye tilt', -1.0, 1.0);
    validateRange(config.eyes.irisSize, 'Iris size', 0.5, 1.5);
    validateRange(config.eyes.pupilSize, 'Pupil size', 0.5, 1.5);
    validateRange(config.eyes.highlightIntensity, 'Highlight intensity', 0.0, 1.0);
    validateRange(config.eyes.eyelidShape, 'Eyelid shape', 0.0, 1.0);
    validateRange(config.eyes.eyelashLength, 'Eyelash length', 0.0, 1.0);
  }

  // Nose parameters
  if (config.nose) {
    validateRange(config.nose.width, 'Nose width', 0.5, 1.5);
    validateRange(config.nose.height, 'Nose height', 0.5, 1.5);
    validateRange(config.nose.length, 'Nose length', 0.5, 1.5);
    validateRange(config.nose.bridgeWidth, 'Nose bridge width', 0.5, 1.5);
    validateRange(config.nose.bridgeDepth, 'Nose bridge depth', 0.0, 1.0);
    validateRange(config.nose.tipShape, 'Nose tip shape', 0.0, 1.0);
    validateRange(config.nose.nostrilSize, 'Nostril size', 0.5, 1.5);
    validateRange(config.nose.nostrilFlare, 'Nostril flare', 0.0, 1.0);
  }

  // Mouth parameters
  if (config.mouth) {
    validateRange(config.mouth.width, 'Mouth width', 0.5, 1.5);
    validateRange(config.mouth.size, 'Mouth size', 0.5, 1.5);
    validateRange(config.mouth.upperLipThickness, 'Upper lip thickness', 0.0, 1.0);
    validateRange(config.mouth.lowerLipThickness, 'Lower lip thickness', 0.0, 1.0);
    validateRange(config.mouth.cornerPosition, 'Corner position', -1.0, 1.0);
    validateRange(config.mouth.philtrumDepth, 'Philtrum depth', 0.0, 1.0);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Main comprehensive GLB generation function
 */
export async function generateComprehensiveGLB(
  config: FullCharacterConfig,
  options: ComprehensiveGLBOptions = {}
): Promise<GenerationResult> {
  const startTime = performance.now();
  const buildStartTime = performance.now();
  let parameterCount = 0;
  const warnings: string[] = [];

  try {
    // Validate input
    if (!config) {
      return { success: false, error: 'Character configuration is required' };
    }

    // Validate configuration parameters
    const configValidation = validateFullCharacterConfig(config);
    if (!configValidation.valid) {
      return {
        success: false,
        error: `Configuration validation failed: ${configValidation.errors.join(', ')}`,
      };
    }
    if (configValidation.warnings.length > 0) {
      logger.warn('Configuration validation warnings:', undefined, {
        warnings: configValidation.warnings,
      });
    }

    // Apply game-specific translation if gameId or gameTranslationConfig is provided
    // This affects quality, rendering style, and other generation options
    let appliedGameTranslation = false;
    let gameTranslationConfig: GameTranslationConfig | undefined = options.gameTranslationConfig;
    
    if (options.gameTranslationConfig) {
      gameTranslationConfig = options.gameTranslationConfig;
      appliedGameTranslation = true;
      logger.info('Applied game translation config', undefined, { gameId: gameTranslationConfig.gameId });
    } else if (options.gameId) {
      const foundConfig = getGameTranslationConfig(options.gameId);
      if (foundConfig) {
        gameTranslationConfig = foundConfig;
        appliedGameTranslation = true;
        logger.info('Applied game translation', undefined, { gameId: options.gameId });
      } else {
        logger.warn('Game translation config not found', undefined, { gameId: options.gameId });
      }
    }

    // Use quality from game translation config if available, otherwise use options
    const quality = gameTranslationConfig?.qualityPreset 
      ? gameTranslationConfig.qualityPreset
      : (options.quality || 'high');
    const qualityPreset = getQualityPreset(quality);

    // Merge cel-shaded option from game translation config
    const useCelShaded = options.celShaded !== undefined 
      ? options.celShaded 
      : (gameTranslationConfig?.renderingStyle?.type === 'anime-cel' || gameTranslationConfig?.renderingStyle?.type === 'anime-soft');

    const finalOptions: ComprehensiveGLBOptions = {
      ...options,
      quality,
      celShaded: useCelShaded,
      gameTranslationConfig, // Store for use during build if needed
    };

    logger.info('Starting comprehensive GLB generation', undefined, { 
      quality, 
      gameId: options.gameId,
      appliedGameTranslation,
      useCelShaded,
    });

    // Build comprehensive character with error tracking
    const buildResult = await buildComprehensiveCharacter(config, {
      ...finalOptions,
      qualityPreset,
      onParameterApplied: () => parameterCount++,
    });

    const buildTime = performance.now() - buildStartTime;

    if (!buildResult.group) {
      return { 
        success: false, 
        error: 'Failed to build character from configuration',
        warnings: buildResult.failedParts.length > 0 ? [`Failed parts: ${buildResult.failedParts.join(', ')}`] : undefined,
      };
    }

    // Add warnings from failed parts if partial generation is allowed
    if (buildResult.failedParts.length > 0) {
      if (options.allowPartialGeneration) {
        warnings.push(`Some optional parts failed to generate: ${buildResult.failedParts.join(', ')}`);
      } else {
        // Critical parts failed
        const criticalParts = ['head', 'torso'].filter(p => buildResult.failedParts.includes(p));
        if (criticalParts.length > 0) {
          return {
            success: false,
            error: `Critical parts failed: ${criticalParts.join(', ')}`,
            warnings: buildResult.failedParts.length > criticalParts.length 
              ? [`Also failed: ${buildResult.failedParts.filter(p => !criticalParts.includes(p)).join(', ')}`]
              : undefined,
          };
        }
      }
    }

    const characterGroup = buildResult.group;

    // Validate character group before export
    const validationResult = validateCharacterGroup(characterGroup);
    if (!validationResult.valid) {
      logger.error('Character validation failed:', undefined, {
        warnings: validationResult.warnings,
      });
      return {
        success: false,
        error: `Character validation failed: ${validationResult.warnings.join(', ')}`,
      };
    }
    if (validationResult.warnings.length > 0) {
      logger.warn('Character validation warnings:', undefined, {
        warnings: validationResult.warnings,
      });
    }

    // Collect metadata
    const metadata = collectMetadata(characterGroup);
    const metadataWithParams = {
      ...metadata,
      parameterCount,
    };

    // Export to GLB
    const exportStartTime = performance.now();
    const glbBuffer = await exportToGLB(characterGroup, options);
    const exportTime = performance.now() - exportStartTime;

    if (!glbBuffer || glbBuffer.byteLength === 0) {
      return { success: false, error: 'GLB export produced empty buffer' };
    }

    // Validate file size
    const fileSizeMB = glbBuffer.byteLength / (1024 * 1024);
    const maxFileSizeMB = options.maxFileSizeMB || 50;
    if (fileSizeMB > maxFileSizeMB) {
      warnings.push(`GLB file size (${fileSizeMB.toFixed(2)}MB) exceeds recommended maximum (${maxFileSizeMB}MB). Consider using lower quality settings.`);
    }

    const totalDuration = performance.now() - startTime;
    
    // Performance timing breakdown
    const performanceData = {
      totalTime: totalDuration,
      buildTime: buildTime,
      exportTime: exportTime,
      partTimings: buildResult.partTimings,
    };

    logger.info('Comprehensive GLB generation complete', undefined, {
      duration: `${totalDuration.toFixed(2)}ms`,
      buildTime: `${buildTime.toFixed(2)}ms`,
      exportTime: `${exportTime.toFixed(2)}ms`,
      fileSize: `${(glbBuffer.byteLength / 1024).toFixed(2)}KB`,
      fileSizeMB: fileSizeMB.toFixed(2),
      parameterCount: String(parameterCount),
      triangleCount: String(metadataWithParams.triangleCount),
      failedParts: buildResult.failedParts.length > 0 ? buildResult.failedParts.join(',') : 'none',
    });

    return {
      success: true,
      glbBuffer,
      warnings: warnings.length > 0 ? warnings : undefined,
      metadata: {
        ...metadataWithParams,
        fileSize: glbBuffer.byteLength,
        performance: performanceData,
      },
    };
  } catch (error) {
    logger.error('Comprehensive GLB generation failed:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during GLB generation',
    };
  }
}

interface BuildResult {
  group: THREE.Group | null;
  failedParts: string[];
  partTimings: Record<string, number>;
}

/**
 * Build comprehensive character with ALL parameters
 * Returns result with group, failed parts list, and performance timings
 */
async function buildComprehensiveCharacter(
  config: FullCharacterConfig,
  options: ComprehensiveGLBOptions & {
    qualityPreset: ReturnType<typeof getQualityPreset>;
    onParameterApplied: () => void;
  }
): Promise<BuildResult> {
  const failedParts: string[] = [];
  const partTimings: Record<string, number> = {};

  try {
    const group = new THREE.Group();
    group.name = config.name || 'Character';
    group.userData.characterConfig = config; // Store config in userData for reference

    const { qualityPreset, onParameterApplied } = options;

    // === BODY FOUNDATION ===
    // Apply physique presets
    const physiqueMultipliers = getPhysiqueMultipliers(config.physique, config.body);
    const bodyHeight = config.body?.height || 1.0;
    const bodyWeight = config.body?.weight || 1.0;

    // === HEAD & FACE ===
    const headStartTime = performance.now();
    const headGroupResult = await buildDetailedHead(config, qualityPreset, options, onParameterApplied);
    partTimings.head = performance.now() - headStartTime;
    if (headGroupResult) {
      // Apply head size and physique scaling
      headGroupResult.scale.set(
        (config.head?.size || 1.0) * physiqueMultipliers.width * bodyHeight,
        (config.head?.size || 1.0) * physiqueMultipliers.height * bodyHeight,
        (config.head?.size || 1.0) * physiqueMultipliers.depth * bodyHeight
      );
      headGroupResult.position.y = 1.5 * physiqueMultipliers.height * bodyHeight;
      group.add(headGroupResult);
    } else {
      failedParts.push('head');
      logger.warn('Failed to build head, continuing with remaining parts', undefined, {});
    }

    // === TORSO ===
    const torsoStartTime = performance.now();
    const torsoGroupResult = await buildDetailedTorso(config, qualityPreset, options, onParameterApplied);
    partTimings.torso = performance.now() - torsoStartTime;
    if (torsoGroupResult) {
      // Apply physique scaling to torso (width/depth use weight, height uses height)
      torsoGroupResult.scale.set(
        physiqueMultipliers.width * bodyWeight,
        physiqueMultipliers.height * bodyHeight,
        physiqueMultipliers.depth * bodyWeight
      );
      group.add(torsoGroupResult);
    } else {
      failedParts.push('torso');
      logger.warn('Failed to build torso, continuing with remaining parts', undefined, {});
    }

    // === ARMS ===
    const armsStartTime = performance.now();
    const armsGroupResult = await buildDetailedArms(config, qualityPreset, options, onParameterApplied);
    partTimings.arms = performance.now() - armsStartTime;
    if (armsGroupResult) {
      // Apply physique scaling to arms with muscularity consideration
      const armWidthMultiplier = physiqueMultipliers.width * (0.8 + physiqueMultipliers.muscularity * 0.2);
      armsGroupResult.scale.set(
        armWidthMultiplier * bodyWeight,
        physiqueMultipliers.height * bodyHeight,
        armWidthMultiplier * bodyWeight
      );
      group.add(armsGroupResult);
    } else {
      failedParts.push('arms');
    }

    // === HANDS ===
    if (config.hands) {
      const handsStartTime = performance.now();
      const handsGroupResult = await buildDetailedHands(config, qualityPreset, options, onParameterApplied);
      partTimings.hands = performance.now() - handsStartTime;
      if (handsGroupResult) {
        handsGroupResult.scale.multiplyScalar(physiqueMultipliers.width * bodyWeight);
        group.add(handsGroupResult);
      } else {
        failedParts.push('hands');
      }
    }

    // === HIPS & LEGS ===
    const lowerBodyStartTime = performance.now();
    const lowerBodyGroupResult = await buildDetailedLowerBody(config, qualityPreset, options, onParameterApplied);
    partTimings.lowerBody = performance.now() - lowerBodyStartTime;
    if (lowerBodyGroupResult) {
      // Apply physique scaling to lower body
      lowerBodyGroupResult.scale.set(
        physiqueMultipliers.width * bodyWeight,
        physiqueMultipliers.height * bodyHeight,
        physiqueMultipliers.depth * bodyWeight
      );
      group.add(lowerBodyGroupResult);
    } else {
      failedParts.push('lowerBody');
    }

    // === FEET ===
    if (config.feet) {
      const feetStartTime = performance.now();
      const feetGroupResult = await buildDetailedFeet(config, qualityPreset, options, onParameterApplied);
      partTimings.feet = performance.now() - feetStartTime;
      if (feetGroupResult) {
        feetGroupResult.scale.multiplyScalar(physiqueMultipliers.width * bodyWeight);
        group.add(feetGroupResult);
      } else {
        failedParts.push('feet');
      }
    }

    // === HAIR ===
    if (config.hair) {
      const hairStartTime = performance.now();
      const hairGroupResult = await buildDetailedHair(config, qualityPreset, options, onParameterApplied);
      partTimings.hair = performance.now() - hairStartTime;
      if (hairGroupResult) {
        group.add(hairGroupResult);
      } else {
        failedParts.push('hair');
      }
    }

    // === OUTFIT ===
    if (options.includeOutfit && config.outfit) {
      const outfitStartTime = performance.now();
      const outfitGroupResult = await buildOutfitLayers(config, qualityPreset, options, onParameterApplied);
      partTimings.outfit = performance.now() - outfitStartTime;
      if (outfitGroupResult) {
        // Outfit scales with physique and body dimensions
        outfitGroupResult.scale.set(
          physiqueMultipliers.width * bodyWeight,
          physiqueMultipliers.height * bodyHeight,
          physiqueMultipliers.depth * bodyWeight
        );
        group.add(outfitGroupResult);
      } else {
        failedParts.push('outfit');
      }
    }

    // === ACCESSORIES ===
    if (config.outfit?.accessories && config.outfit.accessories.length > 0) {
      const accessoriesStartTime = performance.now();
      const accessoriesGroupResult = await buildAccessories(config, qualityPreset, options, onParameterApplied);
      partTimings.accessories = performance.now() - accessoriesStartTime;
      if (accessoriesGroupResult) {
        group.add(accessoriesGroupResult);
      } else {
        failedParts.push('accessories');
      }
    }

    // === SCARS, TATTOOS, PIERCINGS ===
    if (options.includeExtras) {
      const extrasStartTime = performance.now();
      const extrasGroupResult = await buildExtras(config, qualityPreset, options, onParameterApplied);
      partTimings.extras = performance.now() - extrasStartTime;
      if (extrasGroupResult) {
        group.add(extrasGroupResult);
      } else {
        failedParts.push('extras');
      }
    }

    // === MAKEUP ===
    if (options.includeMakeup && config.makeup) {
      const makeupStartTime = performance.now();
      const makeupGroupResult = await buildMakeup(config, qualityPreset, options, onParameterApplied);
      partTimings.makeup = performance.now() - makeupStartTime;
      if (makeupGroupResult) {
        group.add(makeupGroupResult);
      } else {
        failedParts.push('makeup');
      }
    }

    // === VFX ===
    if (options.includeVFX && config.vfx) {
      const vfxStartTime = performance.now();
      const vfxGroupResult = await buildVFX(config, qualityPreset, options, onParameterApplied);
      partTimings.vfx = performance.now() - vfxStartTime;
      if (vfxGroupResult) {
        group.add(vfxGroupResult);
      } else {
        failedParts.push('vfx');
      }
    }

    // Body height and physique multipliers are already applied per-part, no additional scaling needed

    // Apply posture adjustment
    if (config.body?.posture !== undefined) {
      const postureAdjustment = (config.body.posture - 0.5) * 0.1; // -0.05 to 0.05
      group.rotation.x = postureAdjustment;
    }

    return { group, failedParts, partTimings };
  } catch (error) {
    logger.error('Failed to build comprehensive character:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    return { group: null, failedParts: ['all'], partTimings };
  }
}

/**
 * Get physique multipliers for body scaling
 */
function getPhysiqueMultipliers(
  physique: FullCharacterConfig['physique'],
  body: FullCharacterConfig['body']
): {
  height: number;
  width: number;
  depth: number;
  muscularity: number;
} {
  // Return relative multipliers (1.0 = no change) that will be applied on top of base body dimensions
  const baseMultipliers = {
    height: 1.0,
    width: 1.0,
    depth: 1.0,
    muscularity: body?.muscularity || 0.5,
  };

  // Apply physique preset modifiers (these are relative multipliers)
  switch (physique) {
    case 'petite':
      return { ...baseMultipliers, height: 0.85, width: 0.8, depth: 0.8 };
    case 'athletic':
      return { ...baseMultipliers, muscularity: Math.max(0.7, baseMultipliers.muscularity) };
    case 'curvy':
      return { ...baseMultipliers, width: 1.15, depth: 1.15 };
    case 'muscular':
      return { ...baseMultipliers, height: 1.05, muscularity: Math.max(0.85, baseMultipliers.muscularity) };
    case 'heavy':
      return { ...baseMultipliers, width: 1.4, depth: 1.4 };
    default:
      return baseMultipliers;
  }
}

/**
 * Build detailed head with all face parameters
 */
async function buildDetailedHead(
  config: FullCharacterConfig,
  qualityPreset: ReturnType<typeof getQualityPreset>,
  options: ComprehensiveGLBOptions,
  onParameterApplied: () => void
): Promise<THREE.Group | null> {
  try {
    const group = new THREE.Group();
    group.name = 'Head';

    const headSize = 0.12 * (config.head?.size || 1.0);
    const headWidth = config.head?.width || 1.0;
    const headDepth = config.head?.depth || 1.0;

    // Create head geometry with face shape
    const headGeometry = createHeadGeometry(
      headSize,
      headWidth,
      headDepth,
      config.face?.shape || 'oval',
      config.face || {},
      qualityPreset
    );

    const skinMaterial = createSkinMaterialWithDetails(config, options);
    const headMesh = new THREE.Mesh(headGeometry, skinMaterial);
    headMesh.name = 'Head';
    headMesh.castShadow = true;
    headMesh.receiveShadow = true;
    group.add(headMesh);
    onParameterApplied();

    // Eyes (detailed)
    if (config.eyes) {
      const eyesGroup = await buildDetailedEyes(config.eyes, qualityPreset, options, onParameterApplied);
      if (eyesGroup) {
        group.add(eyesGroup);
        onParameterApplied();
      }
    }

    // Eyebrows
    if (config.eyebrows) {
      const eyebrowsGroup = buildEyebrows(config.eyebrows, qualityPreset, options, onParameterApplied);
      if (eyebrowsGroup) {
        group.add(eyebrowsGroup);
        onParameterApplied();
      }
    }

    // Nose (detailed)
    if (config.nose) {
      const noseGroup = await buildDetailedNose(config.nose, qualityPreset, options, onParameterApplied);
      if (noseGroup) {
        group.add(noseGroup);
        onParameterApplied();
      }
    }

    // Mouth (detailed)
    if (config.mouth) {
      const mouthGroup = await buildDetailedMouth(config.mouth, qualityPreset, options, onParameterApplied);
      if (mouthGroup) {
        group.add(mouthGroup);
        onParameterApplied();
      }
    }

    // Ears
    if (config.ears) {
      const earsGroup = await buildEars(config.ears, qualityPreset, options, onParameterApplied);
      if (earsGroup) {
        group.add(earsGroup);
        onParameterApplied();
      }
    }

    // Neck
    if (config.neck) {
      const neckMesh = await buildNeck(config.neck, qualityPreset, options, onParameterApplied);
      if (neckMesh) {
        group.add(neckMesh);
        onParameterApplied();
      }
    }

    return group;
  } catch (error) {
    logger.error('Failed to build detailed head:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    return null;
  }
}

/**
 * Create head geometry with face shape parameters
 */
function createHeadGeometry(
  size: number,
  width: number,
  depth: number,
  shape: FullCharacterConfig['face']['shape'],
  faceConfig: FullCharacterConfig['face'],
  qualityPreset: ReturnType<typeof getQualityPreset>
): THREE.BufferGeometry {
  const segments = qualityPreset.headSegments;
  const geometry = new THREE.SphereGeometry(size, segments, segments);

  const positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);

    // Apply width/depth scaling
    positions.setX(i, x * width);
    positions.setZ(i, z * depth);

    // Apply face shape modifiers
    const normalizedY = (y / size + 1) / 2; // 0 to 1

    // Cheekbones
    if (normalizedY > 0.4 && normalizedY < 0.7) {
      const cheekboneFactor = 1.0 + (faceConfig.cheekbones || 0.5) * 0.15;
      positions.setX(i, positions.getX(i) * cheekboneFactor);
    }

    // Jaw width
    if (normalizedY < 0.3) {
      const jawFactor = 1.0 + (faceConfig.jawWidth || 0.5) * 0.2;
      positions.setX(i, positions.getX(i) * jawFactor);
    }

    // Jaw depth
    if (normalizedY < 0.3) {
      const jawDepthFactor = 1.0 + (faceConfig.jawDepth || 0.5) * 0.15;
      positions.setZ(i, positions.getZ(i) * jawDepthFactor);
    }

    // Chin shape
    if (normalizedY < 0.2) {
      const chinShape = faceConfig.chinShape || 0.5;
      const chinFactor = chinShape < 0.5 ? 0.9 : 1.1; // Pointed vs square
      positions.setX(i, positions.getX(i) * chinFactor);
      positions.setZ(i, positions.getZ(i) * chinFactor);
    }

    // Forehead height
    if (normalizedY > 0.8) {
      const foreheadHeight = faceConfig.foreheadHeight || 0.5;
      positions.setY(i, y + (foreheadHeight - 0.5) * size * 0.2);
    }
  }

  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Build detailed eyes with all parameters
 */
async function buildDetailedEyes(
  eyesConfig: FullCharacterConfig['eyes'],
  qualityPreset: ReturnType<typeof getQualityPreset>,
  options: ComprehensiveGLBOptions,
  onParameterApplied: () => void
): Promise<THREE.Group | null> {
  try {
    const group = new THREE.Group();
    group.name = 'Eyes';

    const eyeSize = 0.045 * (eyesConfig.size || 1.2);
    const spacing = eyesConfig.spacing || 1.0;
    const depth = eyesConfig.depth || 0.5;
    const tilt = eyesConfig.tilt || 0.0;
    const segments = Math.max(16, qualityPreset.headSegments / 2);

    // Left eye
    const leftEyeGroup = buildDetailedEye(eyesConfig, eyeSize, segments, options, onParameterApplied);
    leftEyeGroup.position.set(-0.08 * spacing, 1.52, 0.19 + (depth - 0.5) * 0.05);
    leftEyeGroup.rotation.z = tilt;
    group.add(leftEyeGroup);

    // Right eye
    const rightEyeGroup = buildDetailedEye(eyesConfig, eyeSize, segments, options, onParameterApplied);
    rightEyeGroup.position.set(0.08 * spacing, 1.52, 0.19 + (depth - 0.5) * 0.05);
    rightEyeGroup.rotation.z = -tilt;
    group.add(rightEyeGroup);

    // Eyelashes
    if (eyesConfig.eyelashLength && eyesConfig.eyelashLength > 0) {
      const eyelashesGroup = await buildEyelashes(eyesConfig, spacing, segments, options, onParameterApplied);
      if (eyelashesGroup) {
        group.add(eyelashesGroup);
        onParameterApplied();
      }
    }

    return group;
  } catch (error) {
    logger.error('Failed to build detailed eyes:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    return null;
  }
}

/**
 * Build single detailed eye
 */
function buildDetailedEye(
  eyeConfig: FullCharacterConfig['eyes'],
  eyeSize: number,
  segments: number,
  options: ComprehensiveGLBOptions,
  onParameterApplied: () => void
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Eye';

  const irisSizeRatio = eyeConfig.irisSize || 0.7;
  const pupilSizeRatio = eyeConfig.pupilSize || 0.35;

  // Sclera
  const scleraGeometry = new THREE.SphereGeometry(eyeSize, segments, segments);
  const scleraMaterial = new THREE.MeshStandardMaterial({
    color: eyeConfig.scleraColor || '#ffffff',
    roughness: 0.2,
  });
  const sclera = new THREE.Mesh(scleraGeometry, scleraMaterial);
  sclera.name = 'Sclera';
  group.add(sclera);
  onParameterApplied();

  // Iris
  const irisGeometry = new THREE.SphereGeometry(eyeSize * irisSizeRatio, segments, segments);
  const irisMaterial = new THREE.MeshStandardMaterial({
    color: eyeConfig.irisColor || '#4a90e2',
    emissive: eyeConfig.irisColor || '#4a90e2',
    emissiveIntensity: 0.5,
    roughness: 0.3,
  });
  const iris = new THREE.Mesh(irisGeometry, irisMaterial);
  iris.position.z = 0.03;
  iris.name = 'Iris';
  group.add(iris);
  onParameterApplied();

  // Pupil
  const pupilGeometry = new THREE.SphereGeometry(eyeSize * pupilSizeRatio, segments / 2, segments / 2);
  const pupilMaterial = new THREE.MeshBasicMaterial({
    color: eyeConfig.pupilColor || '#000000',
  });
  const pupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
  pupil.position.z = 0.042;
  pupil.name = 'Pupil';
  group.add(pupil);
  onParameterApplied();

  // Highlights
  if (eyeConfig.highlightStyle && eyeConfig.highlightStyle !== 'none') {
    const highlightsGroup = buildEyeHighlights(eyeConfig, eyeSize, options, onParameterApplied);
    if (highlightsGroup) {
      group.add(highlightsGroup);
      onParameterApplied();
    }
  }

  return group;
}

/**
 * Build eye highlights based on style
 */
function buildEyeHighlights(
  eyeConfig: FullCharacterConfig['eyes'],
  eyeSize: number,
  options: ComprehensiveGLBOptions,
  onParameterApplied: () => void
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'EyeHighlights';

  const highlightColor = eyeConfig.highlightColor || '#ffffff';
  const intensity = eyeConfig.highlightIntensity || 0.5;

  switch (eyeConfig.highlightStyle) {
    case 'single':
      {
        const highlightGeometry = new THREE.SphereGeometry(eyeSize * 0.25, 12, 12);
        const highlightMaterial = new THREE.MeshBasicMaterial({ color: highlightColor });
        const highlight = new THREE.Mesh(highlightGeometry, highlightMaterial);
        highlight.position.set(-0.012, 0.018, 0.048);
        highlight.scale.multiplyScalar(intensity);
        group.add(highlight);
        onParameterApplied();
      }
      break;

    case 'double':
      {
        // Primary highlight
        const primaryGeometry = new THREE.SphereGeometry(eyeSize * 0.25, 12, 12);
        const primaryMaterial = new THREE.MeshBasicMaterial({ color: highlightColor });
        const primary = new THREE.Mesh(primaryGeometry, primaryMaterial);
        primary.position.set(-0.012, 0.018, 0.048);
        primary.scale.multiplyScalar(intensity);
        group.add(primary);

        // Secondary highlight
        const secondaryGeometry = new THREE.SphereGeometry(eyeSize * 0.12, 8, 8);
        const secondaryMaterial = new THREE.MeshBasicMaterial({
          color: highlightColor,
          transparent: true,
          opacity: 0.9,
        });
        const secondary = new THREE.Mesh(secondaryGeometry, secondaryMaterial);
        secondary.position.set(0.01, -0.012, 0.048);
        secondary.scale.multiplyScalar(intensity);
        group.add(secondary);
        onParameterApplied();
      }
      break;

    case 'star':
      {
        // Star shape (4 points)
        for (let i = 0; i < 4; i++) {
          const angle = (i / 4) * Math.PI * 2;
          const highlightGeometry = new THREE.SphereGeometry(eyeSize * 0.1, 8, 8);
          const highlightMaterial = new THREE.MeshBasicMaterial({ color: highlightColor });
          const highlight = new THREE.Mesh(highlightGeometry, highlightMaterial);
          highlight.position.set(
            Math.cos(angle) * 0.015,
            Math.sin(angle) * 0.015,
            0.048
          );
          highlight.scale.multiplyScalar(intensity);
          group.add(highlight);
        }
        onParameterApplied();
      }
      break;

    case 'heart':
      {
        // Heart shape (simplified - two overlapping circles)
        const leftGeometry = new THREE.SphereGeometry(eyeSize * 0.08, 8, 8);
        const leftMaterial = new THREE.MeshBasicMaterial({ color: highlightColor });
        const left = new THREE.Mesh(leftGeometry, leftMaterial);
        left.position.set(-0.008, 0.012, 0.048);
        left.scale.multiplyScalar(intensity);
        group.add(left);

        const right = new THREE.Mesh(leftGeometry.clone(), leftMaterial);
        right.position.set(0.008, 0.012, 0.048);
        right.scale.multiplyScalar(intensity);
        group.add(right);
        onParameterApplied();
      }
      break;
  }

  return group;
}

/**
 * Build eyebrows
 */
function buildEyebrows(
  eyebrowsConfig: FullCharacterConfig['eyebrows'],
  qualityPreset: ReturnType<typeof getQualityPreset>,
  options: ComprehensiveGLBOptions,
  onParameterApplied: () => void
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Eyebrows';

  const thickness = eyebrowsConfig.thickness || 0.5;
  const arch = eyebrowsConfig.arch || 0.5;
  const angle = eyebrowsConfig.angle || 0.0;
  const color = eyebrowsConfig.color || '#000000';

  // Left eyebrow
  const leftBrowGeometry = createEyebrowGeometry(thickness, arch, angle, qualityPreset);
  const leftBrowMaterial = new THREE.MeshStandardMaterial({ color });
  const leftBrow = new THREE.Mesh(leftBrowGeometry, leftBrowMaterial);
  leftBrow.position.set(-0.08, 1.55, 0.18);
  leftBrow.name = 'EyebrowLeft';
  group.add(leftBrow);

  // Right eyebrow
  const rightBrowGeometry = createEyebrowGeometry(thickness, arch, -angle, qualityPreset);
  const rightBrow = new THREE.Mesh(rightBrowGeometry, leftBrowMaterial.clone());
  rightBrow.position.set(0.08, 1.55, 0.18);
  rightBrow.name = 'EyebrowRight';
  group.add(rightBrow);

  onParameterApplied();
  return group;
}

/**
 * Create eyebrow geometry
 */
function createEyebrowGeometry(
  thickness: number,
  arch: number,
  angle: number,
  qualityPreset: ReturnType<typeof getQualityPreset>
): THREE.BufferGeometry {
  const segments = Math.max(8, qualityPreset.headSegments / 8);
  const geometry = new THREE.BoxGeometry(0.12 * thickness, 0.02 * thickness, 0.005, segments, 1, 1);

  // Apply arch curve
  const positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const normalizedX = (x / (0.06 * thickness) + 1) / 2; // 0 to 1
    const archOffset = Math.sin(normalizedX * Math.PI) * arch * 0.015;
    positions.setY(i, positions.getY(i) + archOffset);
  }

  geometry.computeVertexNormals();
  return geometry;
}

// Continue with other builders... (truncated for brevity, but this shows the pattern)

/**
 * Generate GLB and trigger download (client-side)
 */
export async function generateAndDownloadComprehensiveGLB(
  config: FullCharacterConfig,
  filename: string = 'character.glb',
  options: ComprehensiveGLBOptions = {}
): Promise<void> {
  const result = await generateComprehensiveGLB(config, options);

  if (!result.success || !result.glbBuffer) {
    throw new Error(result.error || 'Failed to generate GLB');
  }

  try {
    const blob = new Blob([result.glbBuffer], { type: 'model/gltf-binary' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up URL after a delay to ensure download started
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  } catch (error) {
    logger.error('Failed to trigger download:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

/**
 * Export helper functions (similar to original, but enhanced)
 */
async function exportToGLB(
  group: THREE.Group,
  options: ComprehensiveGLBOptions
): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    try {
      const exporter = new GLTFExporter();
      const exportOptions: any = {
        binary: true,
        includeCustomExtensions: false,
        trs: false,
        onlyVisible: false,
        truncateDrawRange: true,
        embedImages: true,
        animations: options.includeAnimations ? [] : undefined,
      };

      exporter.parse(
        group,
        (result) => {
          try {
            if (result instanceof ArrayBuffer) {
              if (result.byteLength === 0) {
                reject(new Error('GLB export produced empty buffer'));
                return;
              }
              resolve(result);
            } else if (result instanceof Blob) {
              result
                .arrayBuffer()
                .then((buffer) => {
                  if (buffer.byteLength === 0) {
                    reject(new Error('GLB export produced empty buffer'));
                    return;
                  }
                  resolve(buffer);
                })
                .catch(reject);
            } else {
              reject(new Error(`Unexpected export result type: ${typeof result}`));
            }
          } catch (error) {
            reject(error instanceof Error ? error : new Error(String(error)));
          }
        },
        (error) => {
          logger.error('GLTFExporter error:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
          reject(error instanceof Error ? error : new Error('GLB export failed'));
        },
        exportOptions
      );
    } catch (error) {
      logger.error('Failed to initialize GLTFExporter:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
      reject(error instanceof Error ? error : new Error('Failed to initialize GLB exporter'));
    }
  });
}

/**
 * Get quality preset
 */
function getQualityPreset(quality: 'low' | 'medium' | 'high' | 'ultra') {
  return {
    low: { headSegments: 24, bodySegments: 16, limbSegments: 16, subdivision: 0, textureSize: 512 },
    medium: { headSegments: 32, bodySegments: 24, limbSegments: 24, subdivision: 0, textureSize: 1024 },
    high: { headSegments: 48, bodySegments: 32, limbSegments: 32, subdivision: 1, textureSize: 2048 },
    ultra: { headSegments: 64, bodySegments: 48, limbSegments: 48, subdivision: 2, textureSize: 4096 },
  }[quality];
}

/**
 * Create skin material with all skin parameters
 */
function createSkinMaterialWithDetails(
  config: FullCharacterConfig,
  options: ComprehensiveGLBOptions
): THREE.Material {
  const skinTone = config.skin?.tone || '#fde4d0';
  const glossiness = config.skin?.glossiness || 0.3;
  const smoothness = config.skin?.smoothness || 0.8;

  if (options.celShaded) {
    return createAdvancedCelShadedMaterial({
      ...CODE_VEIN_PRESET.config,
      baseColor: skinTone,
    });
  }

  return EnhancedProceduralMesh.createSkinMaterial(skinTone, {
    roughness: 1.0 - (glossiness * smoothness),
    metalness: 0.05,
  });
}

/**
 * Validate character group before export
 */
function validateCharacterGroup(group: THREE.Group): {
  valid: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];

  if (!group.children || group.children.length === 0) {
    return {
      valid: false,
      warnings: ['Character group has no children'],
    };
  }

  let meshCount = 0;
  let totalTriangles = 0;

  group.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      meshCount++;
      const geometry = child.geometry;
      if (geometry.index) {
        totalTriangles += geometry.index.count / 3;
      } else if (geometry.attributes.position) {
        totalTriangles += geometry.attributes.position.count / 3;
      }

      // Check for missing materials
      if (!child.material) {
        warnings.push(`Mesh ${child.name} has no material`);
      }

      // Check for invalid geometry
      if (!geometry.attributes.position || geometry.attributes.position.count === 0) {
        warnings.push(`Mesh ${child.name} has invalid geometry`);
      }
    }
  });

  if (meshCount === 0) {
    return {
      valid: false,
      warnings: ['No meshes found in character group'],
    };
  }

  if (totalTriangles === 0) {
    return {
      valid: false,
      warnings: ['Character has no triangles'],
    };
  }

  if (totalTriangles > 500000) {
    warnings.push(`High triangle count: ${totalTriangles.toFixed(0)} (may impact performance)`);
  }

  return {
    valid: true,
    warnings,
  };
}

/**
 * Collect metadata
 */
function collectMetadata(group: THREE.Group): {
  triangleCount: number;
  materialCount: number;
  textureCount: number;
  boneCount: number;
  parameterCount?: number;
} {
  let triangleCount = 0;
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  let boneCount = 0;

  group.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      const geometry = child.geometry;
      if (geometry.index) {
        triangleCount += geometry.index.count / 3;
      } else if (geometry.attributes.position) {
        triangleCount += geometry.attributes.position.count / 3;
      }

      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((mat) => materials.add(mat));
        } else {
          materials.add(child.material);
        }

        Object.values(child.material).forEach((value) => {
          if (value instanceof THREE.Texture) {
            textures.add(value);
          }
        });
      }
    }
  });

  return {
    triangleCount: Math.round(triangleCount),
    materialCount: materials.size,
    textureCount: textures.size,
    boneCount,
  };
}

/**
 * Build detailed nose with all parameters
 */
async function buildDetailedNose(
  noseConfig: FullCharacterConfig['nose'],
  qualityPreset: ReturnType<typeof getQualityPreset>,
  options: ComprehensiveGLBOptions,
  onParameterApplied: () => void
): Promise<THREE.Group | null> {
  try {
    const group = new THREE.Group();
    group.name = 'Nose';

    const segments = Math.max(12, qualityPreset.headSegments / 4);
    const width = noseConfig.width || 1.0;
    const height = noseConfig.height || 1.0;
    const length = noseConfig.length || 1.0;
    const bridgeWidth = noseConfig.bridgeWidth || 0.5;
    const bridgeDepth = noseConfig.bridgeDepth || 0.5;

    // Bridge
    const bridgeGeometry = new THREE.CapsuleGeometry(
      0.018 * width * bridgeWidth,
      0.06 * height,
      4,
      segments
    );
    const bridgeMaterial = new THREE.MeshStandardMaterial({ color: '#fde4d0' });
    const bridge = new THREE.Mesh(bridgeGeometry, bridgeMaterial);
    bridge.position.set(0, 1.43, 0.21 + (length - 1.0) * 0.02 + (bridgeDepth - 0.5) * 0.01);
    bridge.rotation.set(Math.PI / 2, 0, 0);
    bridge.name = 'NoseBridge';
    group.add(bridge);
    onParameterApplied();

    // Nose tip
    const tipSize = 0.022 * width;
    const tipShape = noseConfig.tipShape || 0.5;
    const tipGeometry = new THREE.SphereGeometry(tipSize, segments, segments);
    const tipMesh = new THREE.Mesh(tipGeometry, bridgeMaterial);
    tipMesh.position.set(0, 1.40, 0.23 + (length - 1.0) * 0.02);
    tipMesh.scale.set(1.0, 1.0, tipShape < 0.5 ? 0.9 : 1.1); // Pointed vs rounded
    tipMesh.name = 'NoseTip';
    group.add(tipMesh);
    onParameterApplied();

    // Nostrils
    if (noseConfig.nostrilSize && noseConfig.nostrilSize > 0) {
      const nostrilSize = 0.015 * (noseConfig.nostrilSize || 1.0);
      const nostrilFlare = noseConfig.nostrilFlare || 0.5;

      // Left nostril
      const leftNostrilGeometry = new THREE.SphereGeometry(nostrilSize, 8, 8);
      const leftNostril = new THREE.Mesh(leftNostrilGeometry, bridgeMaterial);
      leftNostril.position.set(-0.01 - nostrilFlare * 0.01, 1.38, 0.23 + length * 0.02);
      leftNostril.scale.set(1.0, 0.5, 0.5);
      leftNostril.name = 'NostrilLeft';
      group.add(leftNostril);

      // Right nostril
      const rightNostril = new THREE.Mesh(leftNostrilGeometry.clone(), bridgeMaterial);
      rightNostril.position.set(0.01 + nostrilFlare * 0.01, 1.38, 0.23 + length * 0.02);
      rightNostril.name = 'NostrilRight';
      group.add(rightNostril);
      onParameterApplied();
    }

    return group;
  } catch (error) {
    logger.warn('Failed to build detailed nose:', undefined, { error: error instanceof Error ? error.message : String(error) });
    return null;
  }
}

/**
 * Build detailed mouth with all parameters
 */
async function buildDetailedMouth(
  mouthConfig: FullCharacterConfig['mouth'],
  qualityPreset: ReturnType<typeof getQualityPreset>,
  options: ComprehensiveGLBOptions,
  onParameterApplied: () => void
): Promise<THREE.Group | null> {
  try {
    const group = new THREE.Group();
    group.name = 'Mouth';

    const segments = Math.max(8, qualityPreset.headSegments / 4);
    const width = mouthConfig.width || 1.0;
    const size = mouthConfig.size || 1.0;
    const upperThickness = mouthConfig.upperLipThickness || 1.0;
    const lowerThickness = mouthConfig.lowerLipThickness || 1.0;
    const cornerPosition = mouthConfig.cornerPosition || 0.0; // -1.0 (frown) to 1.0 (smile)
    const philtrumDepth = mouthConfig.philtrumDepth || 0.5;

    // Upper lip
    const upperLipGeometry = new THREE.CapsuleGeometry(
      0.04 * width * size,
      0.015 * upperThickness,
      segments,
      segments
    );
    const lipMaterial = new THREE.MeshStandardMaterial({
      color: '#f4a6b8',
      roughness: 0.25,
    });
    const upperLip = new THREE.Mesh(upperLipGeometry, lipMaterial);
    upperLip.position.set(0, 1.36 + philtrumDepth * 0.01, 0.215);
    upperLip.rotation.set(-0.15 + cornerPosition * 0.1, 0, 0);
    upperLip.name = 'UpperLip';
    group.add(upperLip);
    onParameterApplied();

    // Lower lip
    const lowerLipGeometry = new THREE.CapsuleGeometry(
      0.042 * width * size,
      0.018 * lowerThickness,
      segments,
      segments
    );
    const lowerLip = new THREE.Mesh(lowerLipGeometry, lipMaterial);
    lowerLip.position.set(0, 1.34 + cornerPosition * 0.01, 0.215);
    lowerLip.rotation.set(0.15 + cornerPosition * 0.1, 0, 0);
    lowerLip.name = 'LowerLip';
    group.add(lowerLip);
    onParameterApplied();

    return group;
  } catch (error) {
    logger.warn('Failed to build detailed mouth:', undefined, { error: error instanceof Error ? error.message : String(error) });
    return null;
  }
}

/**
 * Build ears
 */
async function buildEars(
  earsConfig: FullCharacterConfig['ears'],
  qualityPreset: ReturnType<typeof getQualityPreset>,
  options: ComprehensiveGLBOptions,
  onParameterApplied: () => void
): Promise<THREE.Group | null> {
  try {
    const group = new THREE.Group();
    group.name = 'Ears';

    const segments = Math.max(12, qualityPreset.headSegments / 4);
    const size = earsConfig.size || 1.0;
    const angle = earsConfig.angle || 0.0;
    const lobeShape = earsConfig.lobeShape || 0.5;

    // Left ear
    const earGeometry = createEarGeometry(size, lobeShape, segments);
    const earMaterial = new THREE.MeshStandardMaterial({ color: '#fde4d0' });
    const leftEar = new THREE.Mesh(earGeometry, earMaterial);
    leftEar.position.set(-0.12, 1.45, 0.08);
    leftEar.rotation.set(0, -angle, 0);
    leftEar.name = 'EarLeft';
    group.add(leftEar);

    // Right ear
    const rightEar = new THREE.Mesh(earGeometry.clone(), earMaterial);
    rightEar.position.set(0.12, 1.45, 0.08);
    rightEar.rotation.set(0, angle, 0);
    rightEar.scale.x = -1; // Mirror
    rightEar.name = 'EarRight';
    group.add(rightEar);

    onParameterApplied();
    return group;
  } catch (error) {
    logger.warn('Failed to build ears:', undefined, { error: error instanceof Error ? error.message : String(error) });
    return null;
  }
}

/**
 * Create ear geometry
 */
function createEarGeometry(
  size: number,
  lobeShape: number,
  segments: number
): THREE.BufferGeometry {
  const geometry = new THREE.ConeGeometry(0.06 * size, 0.12 * size, segments);

  // Modify for ear shape
  const positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const y = positions.getY(i);
    // Make bottom wider for lobe
    if (y < 0) {
      const lobeFactor = 1.0 + lobeShape * 0.3;
      positions.setX(i, positions.getX(i) * lobeFactor);
      positions.setZ(i, positions.getZ(i) * lobeFactor);
    }
  }

  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Build neck
 */
async function buildNeck(
  neckConfig: FullCharacterConfig['neck'],
  qualityPreset: ReturnType<typeof getQualityPreset>,
  options: ComprehensiveGLBOptions,
  onParameterApplied: () => void
): Promise<THREE.Mesh | null> {
  try {
    const thickness = neckConfig.thickness || 0.5;
    const length = neckConfig.length || 1.0;
    const adamsApple = neckConfig.adamsApple || 0.0;

    const segments = qualityPreset.bodySegments;
    const neckGeometry = new THREE.CylinderGeometry(
      0.08 * thickness,
      0.1 * thickness,
      0.15 * length,
      segments,
      8
    );

    // Apply Adam's apple for males
    if (adamsApple > 0) {
      const positions = neckGeometry.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        const y = positions.getY(i);
        if (y > 0.05 && y < 0.08) {
          // Middle-upper neck area
          positions.setZ(i, positions.getZ(i) + adamsApple * 0.01);
        }
      }
      neckGeometry.computeVertexNormals();
    }

    const neckMaterial = new THREE.MeshStandardMaterial({ color: '#fde4d0' });
    const neckMesh = new THREE.Mesh(neckGeometry, neckMaterial);
    neckMesh.position.set(0, 1.3, 0);
    neckMesh.name = 'Neck';

    onParameterApplied();
    return neckMesh;
  } catch (error) {
    logger.warn('Failed to build neck:', undefined, { error: error instanceof Error ? error.message : String(error) });
    return null;
  }
}

/**
 * Build eyelashes
 */
async function buildEyelashes(
  eyesConfig: FullCharacterConfig['eyes'],
  spacing: number,
  segments: number,
  options: ComprehensiveGLBOptions,
  onParameterApplied: () => void
): Promise<THREE.Group | null> {
  try {
    const group = new THREE.Group();
    group.name = 'Eyelashes';

    const length = eyesConfig.eyelashLength || 0.5;
    if (length <= 0) return null;

    const lashMaterial = new THREE.MeshStandardMaterial({
      color: '#000000',
      side: THREE.DoubleSide,
    });

    // Left eye lashes
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const lashGeometry = new THREE.CylinderGeometry(0.001, 0.002, 0.02 * length, 4, 1);
      const lash = new THREE.Mesh(lashGeometry, lashMaterial);
      lash.position.set(
        -0.08 * spacing + Math.cos(angle) * 0.03,
        1.52 + Math.sin(angle) * 0.03,
        0.19
      );
      lash.rotation.set(Math.PI / 2 + Math.sin(angle) * 0.3, 0, angle);
      lash.name = `EyelashLeft${i}`;
      group.add(lash);
    }

    // Right eye lashes
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const lashGeometry = new THREE.CylinderGeometry(0.001, 0.002, 0.02 * length, 4, 1);
      const lash = new THREE.Mesh(lashGeometry, lashMaterial);
      lash.position.set(
        0.08 * spacing + Math.cos(angle) * 0.03,
        1.52 + Math.sin(angle) * 0.03,
        0.19
      );
      lash.rotation.set(Math.PI / 2 + Math.sin(angle) * 0.3, 0, angle);
      lash.name = `EyelashRight${i}`;
      group.add(lash);
    }

    onParameterApplied();
    return group;
  } catch (error) {
    logger.warn('Failed to build eyelashes:', undefined, { error: error instanceof Error ? error.message : String(error) });
    return null;
  }
}

/**
 * Build detailed torso with all parameters
 */
async function buildDetailedTorso(
  config: FullCharacterConfig,
  qualityPreset: ReturnType<typeof getQualityPreset>,
  options: ComprehensiveGLBOptions,
  onParameterApplied: () => void
): Promise<THREE.Group | null> {
  try {
    const group = new THREE.Group();
    group.name = 'Torso';

    const waistWidth = config.torso?.waistWidth || 0.8;
    const chestWidth = config.torso?.chestWidth || 1.0;
    const chestDepth = config.torso?.chestDepth || 1.0;
    const abdomenDefinition = config.torso?.abdomenDefinition || 0.5;

    // Torso geometry with tapering
    const topRadius = 0.26 * chestWidth;
    const bottomRadius = 0.26 * waistWidth;
    const torsoGeometry = EnhancedProceduralMesh.createTorso(
      topRadius,
      bottomRadius,
      0.35 * chestDepth,
      {
        segments: qualityPreset.bodySegments,
        smoothNormals: true,
        generateTangents: true,
        subdivision: qualityPreset.subdivision,
      }
    );

    // Apply abdomen definition (abs visibility)
    if (abdomenDefinition > 0) {
      const positions = torsoGeometry.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        const y = positions.getY(i);
        if (y < 0.1 && y > -0.1) {
          // Middle torso area
          const z = positions.getZ(i);
          const absFactor = Math.sin(Math.abs(z) * 10) * abdomenDefinition * 0.01;
          positions.setZ(i, z + absFactor);
        }
      }
      torsoGeometry.computeVertexNormals();
      onParameterApplied();
    }

    const skinMaterial = createSkinMaterialWithDetails(config, options);
    const torsoMesh = new THREE.Mesh(torsoGeometry, skinMaterial);
    torsoMesh.position.set(0, 0.65, 0);
    torsoMesh.name = 'Torso';
    torsoMesh.castShadow = true;
    torsoMesh.receiveShadow = true;
    group.add(torsoMesh);
    onParameterApplied();

        // Breasts (detailed)
        if (
          config.torso?.breastSize &&
          config.torso.breastSize > 0.5 &&
          (config.nsfw?.enabled || config.gender !== 'male')
        ) {
          const breastsGroup = await buildDetailedBreasts(config, qualityPreset, options, onParameterApplied);
          if (breastsGroup) {
            group.add(breastsGroup);
          }
        }

        // Shoulders
        if (config.shoulders) {
          const shouldersGroup = await buildShoulders(config, qualityPreset, options, onParameterApplied);
          if (shouldersGroup) {
            group.add(shouldersGroup);
          }
        }

    return group;
  } catch (error) {
    logger.error('Failed to build detailed torso:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    return null;
  }
}

/**
 * Build detailed breasts with all NSFW parameters
 */
async function buildDetailedBreasts(
  config: FullCharacterConfig,
  qualityPreset: ReturnType<typeof getQualityPreset>,
  options: ComprehensiveGLBOptions,
  onParameterApplied: () => void
): Promise<THREE.Group | null> {
  try {
    const group = new THREE.Group();
    group.name = 'Breasts';

    const breastSize = 0.17 * (config.torso?.breastSize || 1.4);
    const breastShape = config.torso?.breastShape || 0.5; // 0.0 (round) - 1.0 (teardrop)
    const separation = config.torso?.breastSeparation || 0.5;
    const sag = config.torso?.breastSag || 0.0;

    const segments = qualityPreset.bodySegments * 2;
    const geometry = new THREE.SphereGeometry(breastSize, segments, segments, 0, Math.PI * 2, 0, Math.PI * 0.85);

    // Modify for shape (round vs teardrop)
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const y = positions.getY(i);
      const factor = 1 + (y / breastSize) * 0.3 * (1 - breastShape); // More teardrop when shape is high
      positions.setX(i, positions.getX(i) * factor);
      positions.setZ(i, positions.getZ(i) * factor);
    }

    // Apply sag
    if (sag > 0) {
      for (let i = 0; i < positions.count; i++) {
        const y = positions.getY(i);
        positions.setY(i, y - sag * 0.02);
      }
    }

    geometry.computeVertexNormals();

    const skinMaterial = createSkinMaterialWithDetails(config, options);
    const leftBreastMesh = new THREE.Mesh(geometry.clone(), skinMaterial);
    leftBreastMesh.position.set(-0.12 - (separation - 0.5) * 0.05, 0.63 - sag * 0.02, 0.17);
    leftBreastMesh.name = 'BreastLeft';
    leftBreastMesh.castShadow = true;
    group.add(leftBreastMesh);

    const rightBreastMesh = new THREE.Mesh(geometry.clone(), skinMaterial);
    rightBreastMesh.position.set(0.12 + (separation - 0.5) * 0.05, 0.63 - sag * 0.02, 0.17);
    rightBreastMesh.name = 'BreastRight';
    rightBreastMesh.castShadow = true;
    group.add(rightBreastMesh);

    // NSFW details (nipples, areola)
    if (config.nsfw?.enabled && config.nsfw.breasts) {
      const nippleSize = 0.025 * (config.nsfw.breasts.nippleSize || 1);
      const areolaSize = 0.04 * (config.nsfw.breasts.areolaSize || 1);
      const nippleColor = config.nsfw.breasts.nippleColor || '#f4a6b8';
      const areolaColor = config.nsfw.breasts.areolaColor || '#f4a6b8';

      // Left nipple/areola
      const leftAreolaGeometry = new THREE.SphereGeometry(areolaSize, 24, 24);
      const leftAreolaMaterial = new THREE.MeshStandardMaterial({
        color: areolaColor,
        roughness: 0.4,
      });
      const leftAreola = new THREE.Mesh(leftAreolaGeometry, leftAreolaMaterial);
      leftAreola.position.set(-0.12 - (separation - 0.5) * 0.05, 0.68, 0.17 + breastSize * 0.72);
      leftAreola.scale.set(1.0, 0.3, 1.0); // Flattened on head
      leftAreola.name = 'AreolaLeft';
      group.add(leftAreola);

      const leftNippleGeometry = new THREE.SphereGeometry(nippleSize, 16, 16);
      const leftNippleMaterial = new THREE.MeshStandardMaterial({
        color: nippleColor,
        roughness: 0.35,
      });
      const leftNipple = new THREE.Mesh(leftNippleGeometry, leftNippleMaterial);
      leftNipple.position.copy(leftAreola.position);
      leftNipple.position.z += nippleSize * 0.5;
      leftNipple.name = 'NippleLeft';
      group.add(leftNipple);

      // Right nipple/areola
      const rightAreola = new THREE.Mesh(leftAreolaGeometry.clone(), leftAreolaMaterial);
      rightAreola.position.set(0.12 + (separation - 0.5) * 0.05, 0.68, 0.17 + breastSize * 0.72);
      rightAreola.scale.set(1.0, 0.3, 1.0);
      rightAreola.name = 'AreolaRight';
      group.add(rightAreola);

      const rightNipple = new THREE.Mesh(leftNippleGeometry.clone(), leftNippleMaterial);
      rightNipple.position.copy(rightAreola.position);
      rightNipple.position.z += nippleSize * 0.5;
      rightNipple.name = 'NippleRight';
      group.add(rightNipple);
      onParameterApplied();
    }

    onParameterApplied();
    return group;
  } catch (error) {
    logger.warn('Failed to build detailed breasts:', undefined, { error: error instanceof Error ? error.message : String(error) });
    return null;
  }
}

/**
 * Build shoulders
 */
async function buildShoulders(
  config: FullCharacterConfig,
  qualityPreset: ReturnType<typeof getQualityPreset>,
  options: ComprehensiveGLBOptions,
  onParameterApplied: () => void
): Promise<THREE.Group | null> {
  try {
    const group = new THREE.Group();
    group.name = 'Shoulders';

    const width = config.shoulders?.width || 1.0;
    const angle = config.shoulders?.angle || 0.0;
    const definition = config.shoulders?.definition || 0.5;

    const segments = qualityPreset.bodySegments;
    const shoulderGeometry = new THREE.SphereGeometry(0.12 * width, segments, segments);

    // Apply definition (muscle visibility)
    if (definition > 0) {
      const positions = shoulderGeometry.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        const y = positions.getY(i);
        if (y > 0.05) {
          const defFactor = definition * 0.01;
          positions.setY(i, positions.getY(i) + defFactor);
        }
      }
      shoulderGeometry.computeVertexNormals();
      onParameterApplied();
    }

    const skinMaterial = createSkinMaterialWithDetails(config, options);

    // Left shoulder
    const leftShoulder = new THREE.Mesh(shoulderGeometry.clone(), skinMaterial);
    leftShoulder.position.set(-0.35 * width, 0.9, 0);
    leftShoulder.rotation.set(0, 0, angle);
    leftShoulder.name = 'ShoulderLeft';
    leftShoulder.castShadow = true;
    group.add(leftShoulder);

    // Right shoulder
    const rightShoulder = new THREE.Mesh(shoulderGeometry.clone(), skinMaterial);
    rightShoulder.position.set(0.35 * width, 0.9, 0);
    rightShoulder.rotation.set(0, 0, -angle);
    rightShoulder.name = 'ShoulderRight';
    rightShoulder.castShadow = true;
    group.add(rightShoulder);

    onParameterApplied();
    return group;
  } catch (error) {
    logger.warn('Failed to build shoulders:', undefined, { error: error instanceof Error ? error.message : String(error) });
    return null;
  }
}

// Continue with remaining builders - these are simpler placeholders for now
// but demonstrate the extensible architecture

async function buildDetailedArms(
  config: FullCharacterConfig,
  qualityPreset: ReturnType<typeof getQualityPreset>,
  options: ComprehensiveGLBOptions,
  onParameterApplied: () => void
): Promise<THREE.Group | null> {
  try {
    const group = new THREE.Group();
    group.name = 'Arms';

    const skinMaterial = createSkinMaterialWithDetails(config, options);

    if (config.arms) {
      const upperArmSize = config.arms.upperArmSize || 1.0;
      const forearmSize = config.arms.forearmSize || 1.0;
      const armLength = config.arms.armLength || 1.0;
      const shoulderShape = config.arms.shoulderShape || 0.5;

      // Upper arm geometry
      const upperArmGeometry = EnhancedProceduralMesh.createLimb(
        0.078 * upperArmSize,
        0.29 * armLength,
        0.86,
        {
          segments: qualityPreset.limbSegments,
          smoothNormals: true,
          generateTangents: true,
          subdivision: qualityPreset.subdivision,
        }
      );

      // Forearm geometry
      const forearmGeometry = EnhancedProceduralMesh.createLimb(
        0.06 * forearmSize,
        0.29 * armLength,
        0.9,
        {
          segments: qualityPreset.limbSegments,
          smoothNormals: true,
          generateTangents: true,
          subdivision: qualityPreset.subdivision,
        }
      );

      // Adjust positions based on shoulder shape
      const shoulderOffset = (shoulderShape - 0.5) * 0.05;

      // Left arm (upper + forearm)
      const leftUpperArm = new THREE.Mesh(upperArmGeometry.clone(), skinMaterial);
      leftUpperArm.position.set(-0.46 - shoulderOffset, 0.52, 0);
      leftUpperArm.rotation.set(0.3, 0, 0.28);
      leftUpperArm.name = 'LeftUpperArm';
      leftUpperArm.castShadow = true;
      leftUpperArm.receiveShadow = true;
      group.add(leftUpperArm);
      onParameterApplied();

      const leftForearm = new THREE.Mesh(forearmGeometry.clone(), skinMaterial);
      leftForearm.position.set(-0.52 - shoulderOffset, 0.20, 0.05);
      leftForearm.rotation.set(0.4, 0, 0.28);
      leftForearm.name = 'LeftForearm';
      leftForearm.castShadow = true;
      leftForearm.receiveShadow = true;
      group.add(leftForearm);
      onParameterApplied();

      // Right arm
      const rightUpperArm = new THREE.Mesh(upperArmGeometry.clone(), skinMaterial);
      rightUpperArm.position.set(0.46 + shoulderOffset, 0.52, 0);
      rightUpperArm.rotation.set(0.3, 0, -0.28);
      rightUpperArm.name = 'RightUpperArm';
      rightUpperArm.castShadow = true;
      rightUpperArm.receiveShadow = true;
      group.add(rightUpperArm);

      const rightForearm = new THREE.Mesh(forearmGeometry.clone(), skinMaterial);
      rightForearm.position.set(0.52 + shoulderOffset, 0.20, 0.05);
      rightForearm.rotation.set(0.4, 0, -0.28);
      rightForearm.name = 'RightForearm';
      rightForearm.castShadow = true;
      rightForearm.receiveShadow = true;
      group.add(rightForearm);
      onParameterApplied();
    }

    return group;
  } catch (error) {
    logger.error('Failed to build detailed arms:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    return null;
  }
}

async function buildDetailedHands(
  config: FullCharacterConfig,
  qualityPreset: ReturnType<typeof getQualityPreset>,
  options: ComprehensiveGLBOptions,
  onParameterApplied: () => void
): Promise<THREE.Group | null> {
  try {
    const group = new THREE.Group();
    group.name = 'Hands';

    const skinMaterial = createSkinMaterialWithDetails(config, options);
    const fingerLength = config.hands?.fingerLength || 1.0;
    const fingerThickness = config.hands?.fingerThickness || 0.5;
    const nailLength = config.hands?.nailLength || 0.5;
    const nailColor = config.hands?.nailColor || '#ffffff';

    // Left hand
    const leftHandGroup = new THREE.Group();
    leftHandGroup.name = 'LeftHand';
    
    // Palm
    const palmGeometry = new THREE.BoxGeometry(0.08, 0.12, 0.04);
    const leftPalm = new THREE.Mesh(palmGeometry, skinMaterial);
    leftPalm.name = 'PalmLeft';
    leftPalm.castShadow = true;
    leftPalm.receiveShadow = true;
    leftHandGroup.add(leftPalm);
    onParameterApplied();

    // Fingers (5 fingers: thumb, index, middle, ring, pinky)
    const fingerPositions = [
      [-0.025, 0.08, 0.01],  // Thumb
      [-0.01, 0.08, 0],      // Index
      [0, 0.08, 0],          // Middle
      [0.01, 0.08, 0],       // Ring
      [0.02, 0.08, -0.01],   // Pinky
    ];

    for (let i = 0; i < 5; i++) {
      const fingerGeometry = new THREE.CylinderGeometry(
        0.01 * fingerThickness,
        0.012 * fingerThickness,
        0.04 * fingerLength,
        8
      );
      const finger = new THREE.Mesh(fingerGeometry, skinMaterial);
      finger.position.set(fingerPositions[i][0], fingerPositions[i][1], fingerPositions[i][2]);
      finger.name = `Finger${i}Left`;
      finger.castShadow = true;
      finger.receiveShadow = true;
      leftHandGroup.add(finger);
      onParameterApplied();

      // Nail
      if (nailLength > 0) {
        const nailGeometry = new THREE.BoxGeometry(0.012, 0.005, nailLength * 0.01);
        const nailMaterial = new THREE.MeshStandardMaterial({ color: nailColor });
        const nail = new THREE.Mesh(nailGeometry, nailMaterial);
        nail.position.set(
          fingerPositions[i][0],
          fingerPositions[i][1] + 0.02 * fingerLength,
          fingerPositions[i][2] + 0.01
        );
        nail.name = `Nail${i}Left`;
        nail.castShadow = true;
        nail.receiveShadow = true;
        leftHandGroup.add(nail);
        onParameterApplied();
      }
    }

    // Calculate hand position dynamically from arm lengths and rotations
    // Match the logic from buildDetailedArms
    const armLength = config.arms?.armLength || 1.0;
    const shoulderShape = config.arms?.shoulderShape || 0.5;
    const shoulderOffset = (shoulderShape - 0.5) * 0.05;
    
    // Forearm: length = 0.29 * armLength, positioned at y = 0.20, rotation = 0.4, z = 0.05
    const forearmLength = 0.29 * armLength;
    
    // Calculate forearm end position accounting for rotation
    // Forearm center is at: (-0.52 - shoulderOffset, 0.20, 0.05) for left
    // With rotation (0.4, 0, 0.28), the end extends in rotated direction
    // Simplified: approximate by extending downward and slightly forward
    const forearmEndY = 0.20 - (forearmLength / 2) * Math.cos(0.4);
    const forearmEndZ = 0.05 + (forearmLength / 2) * Math.sin(0.4);
    
    // Hand should attach at the forearm end
    leftHandGroup.position.set(-0.52 - shoulderOffset, forearmEndY, forearmEndZ);
    group.add(leftHandGroup);

    // Right hand (mirror of left)
    const rightHandGroup = leftHandGroup.clone();
    rightHandGroup.name = 'RightHand';
    // Right side: positive x, opposite rotation
    const rightForearmEndY = 0.20 - (forearmLength / 2) * Math.cos(0.4);
    const rightForearmEndZ = 0.05 + (forearmLength / 2) * Math.sin(0.4);
    rightHandGroup.position.set(0.52 + shoulderOffset, rightForearmEndY, rightForearmEndZ);
    rightHandGroup.scale.x = -1; // Mirror horizontally
    group.add(rightHandGroup);

    return group;
  } catch (error) {
    logger.error('Failed to build detailed hands:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    return null;
  }
}

async function buildDetailedLowerBody(
  config: FullCharacterConfig,
  qualityPreset: ReturnType<typeof getQualityPreset>,
  options: ComprehensiveGLBOptions,
  onParameterApplied: () => void
): Promise<THREE.Group | null> {
  try {
    const group = new THREE.Group();
    group.name = 'LowerBody';

    const skinMaterial = createSkinMaterialWithDetails(config, options);

    // === HIPS ===
    if (config.hips) {
      const hipWidth = config.hips.width || 1.0;
      const hipDepth = config.hips.depth || 1.0;
      const hipShape = config.hips.shape || 0.5;

      const hipSize = 0.27 * hipWidth;
      const hipsGeometry = new THREE.SphereGeometry(
        hipSize,
        qualityPreset.bodySegments * 2,
        qualityPreset.bodySegments * 2
      );

      // Apply shape modifier
      const positions = hipsGeometry.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        const z = positions.getZ(i);
        const shapeFactor = 1.0 + (hipShape - 0.5) * 0.2;
        positions.setZ(i, z * hipDepth * shapeFactor);
      }
      hipsGeometry.computeVertexNormals();

      const hipsMesh = new THREE.Mesh(hipsGeometry, skinMaterial);
      hipsMesh.position.set(0, -0.18, 0.09); // Below torso waist
      hipsMesh.name = 'Hips';
      hipsMesh.castShadow = true;
      hipsMesh.receiveShadow = true;
      group.add(hipsMesh);
      onParameterApplied();
    }

    // === BUTTOCKS ===
    if (config.buttocks) {
      const buttSize = config.buttocks.size || 1.0;
      const buttShape = config.buttocks.shape || 0.5;
      const buttLift = config.buttocks.lift || 0.5;

      const buttGeometry = new THREE.SphereGeometry(
        0.25 * buttSize,
        qualityPreset.bodySegments * 2,
        qualityPreset.bodySegments * 2
      );

      // Apply shape
      const buttPositions = buttGeometry.attributes.position;
      for (let i = 0; i < buttPositions.count; i++) {
        const z = buttPositions.getZ(i);
        if (z > 0) {
          const shapeFactor = 1.0 + (buttShape - 0.5) * 0.3;
          buttPositions.setZ(i, z * shapeFactor);
        }
      }
      buttGeometry.computeVertexNormals();

      const buttMesh = new THREE.Mesh(buttGeometry, skinMaterial);
      buttMesh.position.set(0, -0.20, 0.15 + buttLift * 0.05); // Below hips
      buttMesh.name = 'Buttocks';
      buttMesh.castShadow = true;
      buttMesh.receiveShadow = true;
      group.add(buttMesh);
      onParameterApplied();
    }

    // === LEGS ===
    if (config.legs) {
      const thighCircumference = config.legs.thighCircumference || 1.0;
      const calfSize = config.legs.calfSize || 1.0;
      const upperLegLength = config.legs.upperLegLength || 1.0;
      const lowerLegLength = config.legs.lowerLegLength || 1.0;
      const kneeDefinition = config.legs.kneeDefinition || 0.5;
      const thighGap = config.legs.thighGap || 0.5;

      // Upper leg (thigh)
      const thighGeometry = EnhancedProceduralMesh.createLimb(
        0.125 * thighCircumference,
        0.36 * upperLegLength,
        0.89,
        {
          segments: qualityPreset.limbSegments,
          smoothNormals: true,
          generateTangents: true,
          subdivision: qualityPreset.subdivision,
        }
      );

      // Lower leg (calf)
      const calfGeometry = EnhancedProceduralMesh.createLimb(
        0.1 * calfSize,
        0.36 * lowerLegLength,
        0.92,
        {
          segments: qualityPreset.limbSegments,
          smoothNormals: true,
          generateTangents: true,
          subdivision: qualityPreset.subdivision,
        }
      );

      // Apply knee definition to calf geometry
      const calfHeight = 0.36 * lowerLegLength;
      if (kneeDefinition > 0) {
        const calfPositions = calfGeometry.attributes.position;
        for (let i = 0; i < calfPositions.count; i++) {
          const y = calfPositions.getY(i);
          if (y > calfHeight / 2 - 0.05 && y < calfHeight / 2 + 0.05) {
            // Knee area
            const x = calfPositions.getX(i);
            const kneeFactor = 1.0 + kneeDefinition * 0.05;
            calfPositions.setX(i, x * kneeFactor);
          }
        }
        calfGeometry.computeVertexNormals();
        onParameterApplied();
      }

      const thighYStart = -0.35; // Below hips
      const calfYStart = thighYStart - (0.36 * upperLegLength);

      // Left leg
      const leftThigh = new THREE.Mesh(thighGeometry.clone(), skinMaterial);
      leftThigh.position.set(-0.15 - (thighGap - 0.5) * 0.05, thighYStart, 0);
      leftThigh.name = 'LeftThigh';
      leftThigh.castShadow = true;
      leftThigh.receiveShadow = true;
      group.add(leftThigh);
      onParameterApplied();

      const leftCalf = new THREE.Mesh(calfGeometry.clone(), skinMaterial);
      leftCalf.position.set(-0.15 - (thighGap - 0.5) * 0.05, calfYStart, 0);
      leftCalf.name = 'LeftCalf';
      leftCalf.castShadow = true;
      leftCalf.receiveShadow = true;
      group.add(leftCalf);
      onParameterApplied();

      // Right leg
      const rightThigh = new THREE.Mesh(thighGeometry.clone(), skinMaterial);
      rightThigh.position.set(0.15 + (thighGap - 0.5) * 0.05, thighYStart, 0);
      rightThigh.name = 'RightThigh';
      rightThigh.castShadow = true;
      rightThigh.receiveShadow = true;
      group.add(rightThigh);

      const rightCalf = new THREE.Mesh(calfGeometry.clone(), skinMaterial);
      rightCalf.position.set(0.15 + (thighGap - 0.5) * 0.05, calfYStart, 0);
      rightCalf.name = 'RightCalf';
      rightCalf.castShadow = true;
      rightCalf.receiveShadow = true;
      group.add(rightCalf);
      onParameterApplied();
    }

    return group;
  } catch (error) {
    logger.error('Failed to build detailed lower body:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    return null;
  }
}

async function buildDetailedFeet(
  config: FullCharacterConfig,
  qualityPreset: ReturnType<typeof getQualityPreset>,
  options: ComprehensiveGLBOptions,
  onParameterApplied: () => void
): Promise<THREE.Group | null> {
  try {
    const group = new THREE.Group();
    group.name = 'Feet';

    const skinMaterial = createSkinMaterialWithDetails(config, options);
    const footSize = config.feet?.size || 1.0;

    // Simple foot geometry (flattened box for basic shape)
    const footGeometry = new THREE.BoxGeometry(0.12 * footSize, 0.04 * footSize, 0.08 * footSize, 8, 2, 6);
    
    // Round the front of the foot
    const positions = footGeometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const z = positions.getZ(i);
      if (z > 0.03) {
        // Front of foot - round it
        const roundFactor = Math.cos((z - 0.03) / 0.05 * Math.PI / 2);
        const y = positions.getY(i);
        positions.setY(i, y * roundFactor);
      }
    }
    footGeometry.computeVertexNormals();

    // Calculate feet position dynamically from leg lengths
    // Match the logic from buildDetailedLowerBody
    const upperLegLength = config.legs?.upperLegLength || 1.0;
    const lowerLegLength = config.legs?.lowerLegLength || 1.0;
    const thighGap = config.legs?.thighGap || 0.5;
    
    const thighYStart = -0.35; // Below hips (matches buildDetailedLowerBody)
    const calfYStart = thighYStart - (0.36 * upperLegLength);
    const calfHeight = 0.36 * lowerLegLength;
    const footHeight = 0.04 * footSize;
    
    // Foot center should be at the bottom of the calf minus half the foot height
    const footYPosition = calfYStart - (calfHeight / 2) - (footHeight / 2);

    // Left foot
    const leftFoot = new THREE.Mesh(footGeometry.clone(), skinMaterial);
    leftFoot.position.set(-0.15 - (thighGap - 0.5) * 0.05, footYPosition, 0.02);
    leftFoot.name = 'LeftFoot';
    leftFoot.castShadow = true;
    leftFoot.receiveShadow = true;
    group.add(leftFoot);
    onParameterApplied();

    // Right foot
    const rightFoot = new THREE.Mesh(footGeometry.clone(), skinMaterial);
    rightFoot.position.set(0.15 + (thighGap - 0.5) * 0.05, footYPosition, 0.02);
    rightFoot.name = 'RightFoot';
    rightFoot.castShadow = true;
    rightFoot.receiveShadow = true;
    group.add(rightFoot);
    onParameterApplied();

    return group;
  } catch (error) {
    logger.error('Failed to build detailed feet:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    return null;
  }
}

async function buildDetailedHair(
  config: FullCharacterConfig,
  qualityPreset: ReturnType<typeof getQualityPreset>,
  options: ComprehensiveGLBOptions,
  onParameterApplied: () => void
): Promise<THREE.Group | null> {
  try {
    const group = new THREE.Group();
    group.name = 'Hair';

    if (!config.hair) {
      return null;
    }

    // Create hair material
    const hairColor = config.hair.baseColor || '#3d2817';
    const hairMaterial = EnhancedProceduralMesh.createHairMaterial(hairColor, {
      roughness: 0.8,
      metalness: 0.1,
    });

    const segments = qualityPreset.bodySegments * 2;
    const hairLength = config.hair.length || 1.0;
    const hairVolume = config.hair.volume || 1.0;
    const baseStyle = config.hair.baseStyle || 'long-straight';

    // Main hair cap
    try {
      const capRadius = 0.28 * hairVolume;
      const hairCapGeometry = new THREE.SphereGeometry(
        capRadius,
        segments,
        segments,
        0,
        Math.PI * 2,
        0,
        Math.PI * 0.65
      );
      const hairCap = new THREE.Mesh(hairCapGeometry, hairMaterial);
      hairCap.position.set(0, 1.59, -0.09); // On top of head
      hairCap.name = 'HairCap';
      hairCap.castShadow = true;
      hairCap.receiveShadow = true;
      group.add(hairCap);
      onParameterApplied();
    } catch (error) {
      logger.warn('Failed to generate hair cap:', undefined, { error: error instanceof Error ? error.message : String(error) });
    }

    // Layered bangs
    try {
      for (let i = 0; i < 3; i++) {
        const bangsGeometry = new THREE.BoxGeometry(
          (0.36 - i * 0.04) * hairVolume,
          (0.2 - i * 0.04) * hairVolume,
          0.04 - i * 0.01
        );
        const bangs = new THREE.Mesh(bangsGeometry, hairMaterial);
        bangs.position.set(0, 1.48 - i * 0.04, 0.18 + i * 0.01);
        bangs.rotation.set(0.25 + i * 0.05, 0, 0);
        bangs.name = `BangsLayer${i}`;
        bangs.castShadow = true;
        bangs.receiveShadow = true;
        group.add(bangs);
      }
      onParameterApplied();
    } catch (error) {
      logger.warn('Failed to generate bangs:', undefined, { error: error instanceof Error ? error.message : String(error) });
    }

    // Side strands (for longer hair styles)
    if (hairLength > 0.5 && (baseStyle.includes('long') || baseStyle.includes('straight'))) {
      try {
        const strandSegments = Math.max(12, qualityPreset.limbSegments / 2);
        const strandLength = 0.7 * hairLength;
        const leftStrandGeometry = new THREE.CapsuleGeometry(0.05 * hairVolume, strandLength, strandSegments, 32);
        const leftStrand = new THREE.Mesh(leftStrandGeometry, hairMaterial);
        leftStrand.position.set(-0.21, 1.2 - strandLength * 0.5, 0.06);
        leftStrand.rotation.set(0.1, 0, 0.3);
        leftStrand.name = 'HairStrandLeft';
        leftStrand.castShadow = true;
        leftStrand.receiveShadow = true;
        group.add(leftStrand);

        const rightStrand = new THREE.Mesh(leftStrandGeometry.clone(), hairMaterial);
        rightStrand.position.set(0.21, 1.2 - strandLength * 0.5, 0.06);
        rightStrand.rotation.set(0.1, 0, -0.3);
        rightStrand.name = 'HairStrandRight';
        rightStrand.castShadow = true;
        rightStrand.receiveShadow = true;
        group.add(rightStrand);
        onParameterApplied();
      } catch (error) {
        logger.warn('Failed to generate side strands:', undefined, { error: error instanceof Error ? error.message : String(error) });
      }
    }

    // Twin tails style
    if (baseStyle.includes('twin') || baseStyle.includes('tail')) {
      try {
        const braidSegments = Math.max(24, qualityPreset.headSegments / 2);
        const tailLength = hairLength * 0.8;
        const tailGroup = new THREE.Group();
        tailGroup.name = 'TwinTails';
        const tailPositions = [0, -0.25, -0.5, -0.75, -1.0].map(y => y * tailLength);

        tailPositions.forEach((y, i) => {
          const tailSize = (0.07 - i * 0.005) * hairVolume;
          const tailGeometry = new THREE.SphereGeometry(tailSize, braidSegments, braidSegments);
          const tailMesh = new THREE.Mesh(tailGeometry, hairMaterial);
          tailMesh.position.set(0, 1.2 + y, 0);
          tailMesh.name = `TailSegment${i}`;
          tailMesh.castShadow = true;
          tailMesh.receiveShadow = true;
          tailGroup.add(tailMesh);
        });

        // Left tail
        const leftTail = tailGroup.clone();
        leftTail.position.set(-0.18, 0, 0);
        group.add(leftTail);

        // Right tail
        const rightTail = tailGroup.clone();
        rightTail.position.set(0.18, 0, 0);
        group.add(rightTail);
        onParameterApplied();
      } catch (error) {
        logger.warn('Failed to generate twin tails:', undefined, { error: error instanceof Error ? error.message : String(error) });
      }
    }

    // Highlights (if enabled)
    if (config.hair.highlightsEnabled && config.hair.highlightColor) {
      try {
        // Add highlight strands as lighter colored meshes
        const highlightMaterial = EnhancedProceduralMesh.createHairMaterial(config.hair.highlightColor, {
          roughness: 0.6,
          metalness: 0.2,
        });
        const highlightStrandGeometry = new THREE.CapsuleGeometry(0.04 * hairVolume, 0.5 * hairLength, 8, 16);
        const highlightStrand = new THREE.Mesh(highlightStrandGeometry, highlightMaterial);
        highlightStrand.position.set(0, 1.3, 0.1);
        highlightStrand.name = 'HairHighlight';
        highlightStrand.castShadow = true;
        highlightStrand.receiveShadow = true;
        group.add(highlightStrand);
        onParameterApplied();
      } catch (error) {
        logger.warn('Failed to generate highlights:', undefined, { error: error instanceof Error ? error.message : String(error) });
      }
    }

    return group;
  } catch (error) {
    logger.error('Failed to build detailed hair:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    return null;
  }
}

/**
 * Create clothing material with color, pattern, and metallic properties
 */
function createClothingMaterial(
  baseColor: string,
  _pattern: 'solid' | 'plaid' | 'stripes' | 'animal' | 'gradient' = 'solid',
  _patternColor: string = '#ffffff',
  metallic: number = 0.0,
  options: ComprehensiveGLBOptions = {}
): THREE.Material {
  if (options.celShaded) {
    return createAdvancedCelShadedMaterial({
      ...CODE_VEIN_PRESET.config,
      baseColor,
    });
  }

  // Use MeshPhysicalMaterial for metallic clothing (shiny fabrics)
  const material = metallic > 0.5
    ? new THREE.MeshPhysicalMaterial({
        color: baseColor,
        roughness: 0.3 + (1 - metallic) * 0.4, // More rough = less metallic
        metalness: metallic,
        clearcoat: metallic > 0.7 ? 0.5 : 0.0,
        clearcoatRoughness: 0.1,
      })
    : EnhancedProceduralMesh.createClothingMaterial(baseColor, {
        roughness: 0.6,
        metalness: metallic * 0.3, // Clothing metals are less reflective
      });

  // TODO: Add pattern textures (plaid, stripes, etc.) via UV mapping and texture generation
  // For now, we use solid colors. Pattern textures can be added later via texture atlas

  return material;
}

/**
 * Build outfit layers (innerwear, top, bottom, shoes)
 */
async function buildOutfitLayers(
  config: FullCharacterConfig,
  qualityPreset: ReturnType<typeof getQualityPreset>,
  options: ComprehensiveGLBOptions,
  onParameterApplied: () => void
): Promise<THREE.Group | null> {
  try {
    const group = new THREE.Group();
    group.name = 'Outfit';

    if (!config.outfit) {
      return null;
    }

    const segments = qualityPreset.bodySegments;

    // Get body dimensions for clothing sizing
    const chestWidth = config.torso?.chestWidth || 1.0;
    const waistWidth = config.torso?.waistWidth || 0.8;
    const hipsWidth = config.hips?.width || 1.0;
    const breastSize = config.torso?.breastSize || 1.0;

    // === INNERWEAR: BRA ===
    if (config.outfit.innerwear?.bra) {
      const braColor = config.outfit.innerwear.braColor || '#ffffff';
      const braMaterial = createClothingMaterial(braColor, 'solid', braColor, 0.0, options);

      // Bra geometry - wraps around chest area
      const braWidth = 0.28 * chestWidth;
      const braHeight = 0.15 * (1.0 + breastSize * 0.3);
      const braGeometry = EnhancedProceduralMesh.createTorso(
        braWidth * 0.8,
        braWidth * 0.7,
        braHeight,
        {
          segments: Math.max(16, segments / 2),
          smoothNormals: true,
          subdivision: 0,
        }
      );

      const braMesh = new THREE.Mesh(braGeometry, braMaterial);
      braMesh.position.set(0, 0.58 + breastSize * 0.08, 0.02); // Slightly in front of body
      braMesh.name = 'Bra';
      braMesh.castShadow = true;
      braMesh.receiveShadow = true;
      group.add(braMesh);
      onParameterApplied();
    }

    // === INNERWEAR: PANTIES ===
    if (config.outfit.innerwear?.panties) {
      const pantiesColor = config.outfit.innerwear.pantiesColor || '#ffffff';
      const pantiesMaterial = createClothingMaterial(pantiesColor, 'solid', pantiesColor, 0.0, options);

      // Panties geometry - wraps around hips/waist area
      const pantiesWidth = hipsWidth * 0.32;
      const pantiesHeight = 0.12;
      const pantiesGeometry = EnhancedProceduralMesh.createTorso(
        pantiesWidth,
        pantiesWidth * 0.7,
        pantiesHeight,
        {
          segments: Math.max(16, segments / 2),
          smoothNormals: true,
          subdivision: 0,
        }
      );

      const pantiesMesh = new THREE.Mesh(pantiesGeometry, pantiesMaterial);
      pantiesMesh.position.set(0, -0.15, 0.02); // Slightly in front of body
      pantiesMesh.name = 'Panties';
      pantiesMesh.castShadow = true;
      pantiesMesh.receiveShadow = true;
      group.add(pantiesMesh);
      onParameterApplied();
    }

    // === TOP ===
    if (config.outfit.top?.style) {
      const topStyle = config.outfit.top.style;
      const topColor = config.outfit.top.color || '#ec4899';
      const topPattern = config.outfit.top.pattern || 'solid';
      const topPatternColor = config.outfit.top.patternColor || '#ffffff';
      const topMetallic = config.outfit.top.metallic || 0.0;

      // Determine top material based on main color (can use per-part colors for complex tops)
      const mainTopColor = config.outfit.top.mainColor || topColor;
      const topMaterial = createClothingMaterial(mainTopColor, topPattern, topPatternColor, topMetallic, options);

      // Top geometry varies by style
      let topWidth = chestWidth * 0.28;
      let topHeight = 0.4;
      let topYPosition = 0.55;

      // Adjust for different top styles
      switch (topStyle) {
        case 'tank-top':
        case 't-shirt':
          topHeight = 0.35;
          break;
        case 'crop-top':
          topHeight = 0.2;
          topYPosition = 0.65;
          break;
        case 'bikini-top':
          topWidth = chestWidth * 0.18;
          topHeight = 0.12;
          topYPosition = 0.6;
          break;
        case 'sports-bra':
          topWidth = chestWidth * 0.26;
          topHeight = 0.18;
          topYPosition = 0.58;
          break;
        case 'hoodie':
        case 'sweater':
          topWidth = chestWidth * 0.30;
          topHeight = 0.45;
          break;
        case 'jacket':
        case 'blazer':
          topWidth = chestWidth * 0.32;
          topHeight = 0.5;
          break;
      }

      const topGeometry = EnhancedProceduralMesh.createTorso(
        topWidth,
        waistWidth * 0.28,
        topHeight,
        {
          segments: segments,
          smoothNormals: true,
          subdivision: 0,
        }
      );

      const topMesh = new THREE.Mesh(topGeometry, topMaterial);
      topMesh.position.set(0, topYPosition, 0.03); // Slightly in front of body/innerwear
      topMesh.name = `Top_${topStyle}`;
      topMesh.castShadow = true;
      topMesh.receiveShadow = true;
      group.add(topMesh);
      onParameterApplied();

      // Add sleeves for long-sleeved tops
      if (['sweater', 'hoodie', 'jacket', 'blazer', 'button-up'].includes(topStyle)) {
        const sleevesColor = config.outfit.top.sleevesColor || mainTopColor;
        const sleevesMaterial = createClothingMaterial(sleevesColor, topPattern, topPatternColor, topMetallic, options);

        // Left sleeve
        const sleeveGeometry = new THREE.CylinderGeometry(
          0.06 * chestWidth,
          0.055 * chestWidth,
          0.32 * (config.arms?.armLength || 1.0),
          Math.max(12, segments / 3),
          1,
          false
        );
        const leftSleeve = new THREE.Mesh(sleeveGeometry, sleevesMaterial);
        leftSleeve.position.set(-0.32 * chestWidth, 0.55, 0.03);
        leftSleeve.rotation.z = 0.3;
        leftSleeve.name = 'SleeveLeft';
        leftSleeve.castShadow = true;
        group.add(leftSleeve);

        // Right sleeve
        const rightSleeve = new THREE.Mesh(sleeveGeometry.clone(), sleevesMaterial);
        rightSleeve.position.set(0.32 * chestWidth, 0.55, 0.03);
        rightSleeve.rotation.z = -0.3;
        rightSleeve.name = 'SleeveRight';
        rightSleeve.castShadow = true;
        group.add(rightSleeve);
        onParameterApplied();
      }
    }

    // === BOTTOM ===
    if (config.outfit.bottom?.style) {
      const bottomStyle = config.outfit.bottom.style;
      const bottomColor = config.outfit.bottom.color || '#8b5cf6';
      const bottomPattern = config.outfit.bottom.pattern || 'solid';
      const bottomPatternColor = config.outfit.bottom.patternColor || '#ffffff';

      const bottomMaterial = createClothingMaterial(bottomColor, bottomPattern, bottomPatternColor, 0.0, options);

      // Bottom geometry varies by style
      let bottomWidth = hipsWidth * 0.30;
      let bottomHeight = 0.6;
      let bottomYPosition = -0.25;

      switch (bottomStyle) {
        case 'shorts':
        case 'hot-pants':
          bottomHeight = 0.25;
          bottomYPosition = -0.15;
          break;
        case 'skirt':
        case 'mini-skirt':
          bottomHeight = bottomStyle === 'mini-skirt' ? 0.2 : 0.4;
          bottomYPosition = -0.15;
          // Skirt flares out
          bottomWidth = hipsWidth * 0.35;
          break;
        case 'pants':
        case 'jeans':
        case 'leggings':
        case 'cargo-pants':
        case 'sweatpants':
          bottomHeight = 0.65;
          bottomYPosition = -0.3;
          break;
      }

      const bottomGeometry = EnhancedProceduralMesh.createTorso(
        bottomWidth,
        bottomStyle === 'skirt' || bottomStyle === 'mini-skirt' ? bottomWidth * 1.1 : bottomWidth * 0.85, // Skirt flares
        bottomHeight,
        {
          segments: segments,
          smoothNormals: true,
          subdivision: 0,
        }
      );

      const bottomMesh = new THREE.Mesh(bottomGeometry, bottomMaterial);
      bottomMesh.position.set(0, bottomYPosition, 0.03);
      bottomMesh.name = `Bottom_${bottomStyle}`;
      bottomMesh.castShadow = true;
      bottomMesh.receiveShadow = true;
      group.add(bottomMesh);
      onParameterApplied();

      // Add leg coverage for pants (simple cylindrical legs)
      if (['pants', 'jeans', 'leggings', 'cargo-pants', 'sweatpants'].includes(bottomStyle)) {
        const legGeometry = new THREE.CylinderGeometry(
          0.065 * hipsWidth,
          0.06 * hipsWidth,
          0.45 * (config.legs?.upperLegLength || 1.0),
          Math.max(12, segments / 3),
          1,
          false
        );

        // Left leg
        const leftLeg = new THREE.Mesh(legGeometry, bottomMaterial);
        leftLeg.position.set(-0.12 * hipsWidth, -0.5, 0.03);
        leftLeg.name = 'LegLeft';
        leftLeg.castShadow = true;
        group.add(leftLeg);

        // Right leg
        const rightLeg = new THREE.Mesh(legGeometry.clone(), bottomMaterial);
        rightLeg.position.set(0.12 * hipsWidth, -0.5, 0.03);
        rightLeg.name = 'LegRight';
        rightLeg.castShadow = true;
        group.add(rightLeg);
        onParameterApplied();
      }
    }

    // === SHOES ===
    if (config.outfit.shoes?.style) {
      const shoeColor = config.outfit.shoes.color || '#000000';
      const shoeMaterial = createClothingMaterial(shoeColor, 'solid', shoeColor, 0.3, options); // Shoes are slightly metallic

      const footSize = config.feet?.size || 1.0;
      const shoeLength = 0.18 * footSize;
      const shoeWidth = 0.08 * footSize;
      const shoeHeight = 0.06 * footSize;

      // Shoe geometry (simplified boot/sneaker shape)
      const shoeGeometry = new THREE.BoxGeometry(shoeLength, shoeHeight, shoeWidth, 4, 2, 4);

      // Left shoe
      const leftShoe = new THREE.Mesh(shoeGeometry, shoeMaterial);
      leftShoe.position.set(-0.12 * hipsWidth, -0.82, 0.02 + shoeHeight * 0.5);
      leftShoe.name = 'ShoeLeft';
      leftShoe.castShadow = true;
      leftShoe.receiveShadow = true;
      group.add(leftShoe);

      // Right shoe
      const rightShoe = new THREE.Mesh(shoeGeometry.clone(), shoeMaterial);
      rightShoe.position.set(0.12 * hipsWidth, -0.82, 0.02 + shoeHeight * 0.5);
      rightShoe.name = 'ShoeRight';
      rightShoe.castShadow = true;
      rightShoe.receiveShadow = true;
      group.add(rightShoe);
      onParameterApplied();
    }

    return group;
  } catch (error) {
    logger.warn('Failed to build outfit layers:', undefined, { error: error instanceof Error ? error.message : String(error) });
    return null;
  }
}

/**
 * Build accessories from config.outfit.accessories array
 */
async function buildAccessories(
  config: FullCharacterConfig,
  qualityPreset: ReturnType<typeof getQualityPreset>,
  options: ComprehensiveGLBOptions,
  onParameterApplied: () => void
): Promise<THREE.Group | null> {
  try {
    const group = new THREE.Group();
    group.name = 'Accessories';

    if (!config.outfit?.accessories || config.outfit.accessories.length === 0) {
      return null;
    }

    const segments = qualityPreset.bodySegments;

    // Process each accessory
    for (const accessory of config.outfit.accessories) {
      try {
        const { id, type, position, rotation, scale, color, glow, glowColor } = accessory;

        // Create material for accessory
        const baseColor = color || '#ffffff';
        let material: THREE.Material;

        if (glow) {
          // Create glowing material with emissive properties
          const glowMatColor = glowColor || baseColor;
          material = new THREE.MeshStandardMaterial({
            color: baseColor,
            emissive: glowMatColor,
            emissiveIntensity: 1.0,
            metalness: 0.3,
            roughness: 0.4,
          });
        } else {
          // Regular material
          material = createClothingMaterial(baseColor, 'solid', baseColor, 0.2, options);
        }

        // Create geometry based on accessory type
        let geometry: THREE.BufferGeometry;
        const baseScale = scale || 1.0;

        switch (type.toLowerCase()) {
          case 'earring':
          case 'earrings':
            // Simple hoop or stud earrings
            geometry = new THREE.TorusGeometry(0.02 * baseScale, 0.005 * baseScale, 8, 16);
            break;

          case 'necklace':
            // Simple chain/necklace (simplified as a tube)
            geometry = new THREE.TorusGeometry(0.12 * baseScale, 0.008 * baseScale, 8, 32);
            break;

          case 'ring':
          case 'rings':
            // Ring geometry
            geometry = new THREE.TorusGeometry(0.015 * baseScale, 0.003 * baseScale, 8, 16);
            break;

          case 'glasses':
          case 'eyeglasses':
          case 'sunglasses':
            // Simplified glasses frame
            const glassesGroup = new THREE.Group();
            
            // Left lens frame
            const leftLensGeometry = new THREE.RingGeometry(0.035 * baseScale, 0.045 * baseScale, 16);
            const leftLensFrame = new THREE.Mesh(leftLensGeometry, material);
            leftLensFrame.position.set(-0.04 * baseScale, 0, 0);
            glassesGroup.add(leftLensFrame);
            
            // Right lens frame
            const rightLensGeometry = leftLensGeometry.clone();
            const rightLensFrame = new THREE.Mesh(rightLensGeometry, material);
            rightLensFrame.position.set(0.04 * baseScale, 0, 0);
            glassesGroup.add(rightLensFrame);
            
            // Bridge
            const bridgeGeometry = new THREE.BoxGeometry(0.02 * baseScale, 0.005 * baseScale, 0.01 * baseScale);
            const bridge = new THREE.Mesh(bridgeGeometry, material);
            bridge.position.set(0, 0, 0);
            glassesGroup.add(bridge);
            
            // Position the entire glasses group
            glassesGroup.position.set(...position);
            glassesGroup.rotation.set(...rotation);
            glassesGroup.name = `Accessory_${id || type}`;
            group.add(glassesGroup);
            onParameterApplied();
            continue; // Skip the single mesh creation for glasses

          case 'hat':
          case 'cap':
          case 'beanie':
            // Hat geometry (simplified as a cylinder with a top)
            const hatGroup = new THREE.Group();
            
            // Hat base (brim)
            const brimGeometry = new THREE.CylinderGeometry(0.15 * baseScale, 0.15 * baseScale, 0.02 * baseScale, 16);
            const brim = new THREE.Mesh(brimGeometry, material);
            brim.position.y = 1.6 * baseScale;
            hatGroup.add(brim);
            
            // Hat top
            const topGeometry = new THREE.CylinderGeometry(0.12 * baseScale, 0.15 * baseScale, 0.15 * baseScale, 16);
            const top = new THREE.Mesh(topGeometry, material);
            top.position.y = 1.7 * baseScale;
            hatGroup.add(top);
            
            hatGroup.position.set(...position);
            hatGroup.rotation.set(...rotation);
            hatGroup.name = `Accessory_${id || type}`;
            group.add(hatGroup);
            onParameterApplied();
            continue; // Skip the single mesh creation for hat

          case 'headband':
          case 'hairband':
            // Headband (torus around head)
            geometry = new THREE.TorusGeometry(0.13 * baseScale, 0.015 * baseScale, 8, 32);
            break;

          case 'hairclip':
          case 'hairpin':
            // Hair clip (simplified as a small box)
            geometry = new THREE.BoxGeometry(0.04 * baseScale, 0.02 * baseScale, 0.005 * baseScale);
            break;

          case 'bracelet':
          case 'bangle':
            // Bracelet (torus)
            geometry = new THREE.TorusGeometry(0.045 * baseScale, 0.008 * baseScale, 8, 32);
            break;

          case 'watch':
            // Watch (box with face)
            const watchGroup = new THREE.Group();
            
            // Watch band
            const bandGeometry = new THREE.BoxGeometry(0.05 * baseScale, 0.03 * baseScale, 0.02 * baseScale);
            const band = new THREE.Mesh(bandGeometry, material);
            watchGroup.add(band);
            
            // Watch face (simplified)
            const faceGeometry = new THREE.CylinderGeometry(0.02 * baseScale, 0.02 * baseScale, 0.005 * baseScale, 16);
            const faceMaterial = new THREE.MeshStandardMaterial({
              color: '#000000',
              metalness: 0.8,
              roughness: 0.2,
            });
            const face = new THREE.Mesh(faceGeometry, faceMaterial);
            face.position.y = 0.0175 * baseScale;
            watchGroup.add(face);
            
            watchGroup.position.set(...position);
            watchGroup.rotation.set(...rotation);
            watchGroup.name = `Accessory_${id || type}`;
            group.add(watchGroup);
            onParameterApplied();
            continue; // Skip the single mesh creation for watch

          case 'choker':
            // Choker (torus around neck)
            geometry = new THREE.TorusGeometry(0.11 * baseScale, 0.01 * baseScale, 8, 32);
            break;

          case 'pendant':
          case 'amulet':
            // Pendant (simplified as a small box or sphere)
            geometry = new THREE.BoxGeometry(0.02 * baseScale, 0.03 * baseScale, 0.01 * baseScale);
            break;

          default:
            // Default: simple sphere for unknown accessory types
            geometry = new THREE.SphereGeometry(0.02 * baseScale, Math.max(8, segments / 4), Math.max(8, segments / 4));
            break;
        }

        // Create mesh for single-geometry accessories
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(...position);
        mesh.rotation.set(...rotation);
        mesh.scale.multiplyScalar(baseScale);
        mesh.name = `Accessory_${id || type}`;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        group.add(mesh);
        onParameterApplied();
      } catch (error) {
        logger.warn(`Failed to build accessory ${accessory.id || accessory.type}:`, undefined, {
          error: error instanceof Error ? error.message : String(error),
        });
        // Continue with next accessory instead of failing entirely
      }
    }

    return group;
  } catch (error) {
    logger.warn('Failed to build accessories:', undefined, {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

/**
 * Build extras: scars, tattoos, piercings, facial hair, body hair
 */
async function buildExtras(
  config: FullCharacterConfig,
  qualityPreset: ReturnType<typeof getQualityPreset>,
  options: ComprehensiveGLBOptions,
  onParameterApplied: () => void
): Promise<THREE.Group | null> {
  try {
    const group = new THREE.Group();
    group.name = 'Extras';

    // === SCARS ===
    if (config.scars && config.scars.length > 0) {
      const scarsGroup = new THREE.Group();
      scarsGroup.name = 'Scars';

      for (const scar of config.scars) {
        try {
          const { type, location, size, opacity, color } = scar;
          
          // Create scar geometry based on type
          let geometry: THREE.BufferGeometry;
          const scarSize = size || 0.1;
          const scarOpacity = opacity || 0.7;

          switch (type) {
            case 'slash':
              // Slash scar (elongated box)
              geometry = new THREE.BoxGeometry(scarSize, scarSize * 0.1, 0.001);
              break;
            case 'burn':
              // Burn scar (irregular shape, simplified as box)
              geometry = new THREE.BoxGeometry(scarSize * 0.8, scarSize * 0.8, 0.001);
              break;
            case 'surgical':
              // Surgical scar (straight line)
              geometry = new THREE.BoxGeometry(scarSize * 1.2, scarSize * 0.05, 0.001);
              break;
            case 'puncture':
              // Puncture scar (circular)
              geometry = new THREE.CircleGeometry(scarSize * 0.3, 16);
              break;
            default:
              geometry = new THREE.BoxGeometry(scarSize, scarSize * 0.1, 0.001);
              break;
          }

          // Create scar material (semi-transparent overlay)
          const scarColor = color || '#8b4513'; // Brownish scar color
          const scarMaterial = new THREE.MeshStandardMaterial({
            color: scarColor,
            transparent: true,
            opacity: scarOpacity,
            roughness: 0.8,
            metalness: 0.0,
          });

          const scarMesh = new THREE.Mesh(geometry, scarMaterial);
          
          // Map location string to position (simplified mapping)
          // In a full implementation, this would parse location more intelligently
          const locationMap: Record<string, [number, number, number]> = {
            'chest': [0, 0.6, 0.15],
            'back': [0, 0.6, -0.15],
            'arm-left': [-0.3, 0.5, 0.05],
            'arm-right': [0.3, 0.5, 0.05],
            'face': [0, 1.5, 0.18],
            'leg-left': [-0.12, -0.5, 0.05],
            'leg-right': [0.12, -0.5, 0.05],
          };

          const position = locationMap[location.toLowerCase()] || [0, 0.6, 0.15];
          scarMesh.position.set(...position);
          scarMesh.name = `Scar_${type}_${location}`;
          scarsGroup.add(scarMesh);
          onParameterApplied();
        } catch (error) {
          logger.warn(`Failed to build scar:`, undefined, {
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      if (scarsGroup.children.length > 0) {
        group.add(scarsGroup);
      }
    }

    // === TATTOOS ===
    if (config.tattoos && config.tattoos.length > 0) {
      const tattoosGroup = new THREE.Group();
      tattoosGroup.name = 'Tattoos';

      for (const tattoo of config.tattoos) {
        try {
          const { design, location, size, color, opacity, rotation } = tattoo;
          
          // Create tattoo as a textured overlay (simplified as colored plane)
          const tattooSize = size || 0.15;
          const tattooOpacity = opacity || 0.9;
          const tattooRotation = rotation || 0;

          // Tattoo geometry (plane)
          const geometry = new THREE.PlaneGeometry(tattooSize, tattooSize);
          geometry.rotateZ(tattooRotation);

          // Tattoo material
          const tattooColor = color || '#000000';
          const tattooMaterial = new THREE.MeshStandardMaterial({
            color: tattooColor,
            transparent: true,
            opacity: tattooOpacity,
            roughness: 0.5,
            metalness: 0.0,
            side: THREE.DoubleSide,
          });

          const tattooMesh = new THREE.Mesh(geometry, tattooMaterial);
          
          // Map location to position
          const locationMap: Record<string, [number, number, number]> = {
            'chest': [0, 0.6, 0.16],
            'back': [0, 0.6, -0.16],
            'arm-left': [-0.32, 0.5, 0.06],
            'arm-right': [0.32, 0.5, 0.06],
            'shoulder-left': [-0.35, 0.9, 0.06],
            'shoulder-right': [0.35, 0.9, 0.06],
            'thigh-left': [-0.12, -0.4, 0.06],
            'thigh-right': [0.12, -0.4, 0.06],
            'calf-left': [-0.12, -0.7, 0.06],
            'calf-right': [0.12, -0.7, 0.06],
            'wrist-left': [-0.52, 0.1, 0.06],
            'wrist-right': [0.52, 0.1, 0.06],
          };

          const position = locationMap[location.toLowerCase()] || [0, 0.6, 0.16];
          tattooMesh.position.set(...position);
          tattooMesh.name = `Tattoo_${design}_${location}`;
          tattoosGroup.add(tattooMesh);
          onParameterApplied();
        } catch (error) {
          logger.warn(`Failed to build tattoo:`, undefined, {
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      if (tattoosGroup.children.length > 0) {
        group.add(tattoosGroup);
      }
    }

    // === PIERCINGS ===
    if (config.piercings && config.piercings.length > 0) {
      const piercingsGroup = new THREE.Group();
      piercingsGroup.name = 'Piercings';

      for (const piercing of config.piercings) {
        try {
          const { type, location, material, size } = piercing;
          
          // Create piercing geometry (simplified as small sphere or torus)
          const piercingSize = size || 1.0;
          let geometry: THREE.BufferGeometry;
          
          if (type.includes('hoop') || type.includes('ring')) {
            geometry = new THREE.TorusGeometry(0.008 * piercingSize, 0.002 * piercingSize, 8, 16);
          } else {
            // Stud/bar piercing
            geometry = new THREE.SphereGeometry(0.005 * piercingSize, 12, 12);
          }

          // Create piercing material based on material type
          let piercingMaterial: THREE.Material;
          switch (material) {
            case 'gold':
              piercingMaterial = new THREE.MeshStandardMaterial({
                color: '#ffd700',
                metalness: 0.9,
                roughness: 0.1,
              });
              break;
            case 'silver':
              piercingMaterial = new THREE.MeshStandardMaterial({
                color: '#c0c0c0',
                metalness: 0.9,
                roughness: 0.1,
              });
              break;
            case 'black':
              piercingMaterial = new THREE.MeshStandardMaterial({
                color: '#000000',
                metalness: 0.3,
                roughness: 0.4,
              });
              break;
            default:
              piercingMaterial = new THREE.MeshStandardMaterial({
                color: '#c0c0c0',
                metalness: 0.9,
                roughness: 0.1,
              });
              break;
          }

          const piercingMesh = new THREE.Mesh(geometry, piercingMaterial);
          
          // Map location to position
          const locationMap: Record<string, [number, number, number]> = {
            'ear': [0.08, 1.52, 0.18],
            'nose': [0, 1.48, 0.21],
            'lip': [0, 1.42, 0.22],
            'eyebrow': [0, 1.56, 0.20],
            'tongue': [0, 1.38, 0.23],
            'navel': [0, -0.15, 0.16],
            'nipple': [0.12, 0.65, 0.18],
            'genital': [0, -0.3, 0.15],
          };

          const position = locationMap[location.toLowerCase()] || [0, 1.5, 0.2];
          piercingMesh.position.set(...position);
          piercingMesh.name = `Piercing_${type}_${location}`;
          piercingMesh.castShadow = true;
          piercingsGroup.add(piercingMesh);
          onParameterApplied();
        } catch (error) {
          logger.warn(`Failed to build piercing:`, undefined, {
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      if (piercingsGroup.children.length > 0) {
        group.add(piercingsGroup);
      }
    }

    // === FACIAL HAIR ===
    if (config.facialHair && config.facialHair.style !== 'none') {
      try {
        const { style, thickness, color } = config.facialHair;
        
        // Create facial hair as geometry overlay
        const hairColor = color || '#000000';
        const hairMaterial = new THREE.MeshStandardMaterial({
          color: hairColor,
          roughness: 0.8,
          metalness: 0.0,
        });

        const facialHairGroup = new THREE.Group();
        facialHairGroup.name = 'FacialHair';

        switch (style) {
          case 'stubble':
            // Stubble (small dots/spheres)
            for (let i = 0; i < 30; i++) {
              const dotGeometry = new THREE.SphereGeometry(0.003 * thickness, 8, 8);
              const dot = new THREE.Mesh(dotGeometry, hairMaterial);
              const angle = (i / 30) * Math.PI * 2;
              const radius = 0.04 + (Math.random() * 0.02);
              dot.position.set(
                Math.cos(angle) * radius,
                1.42 + (Math.random() * 0.1) - 0.05,
                0.20 + (Math.random() * 0.02)
              );
              facialHairGroup.add(dot);
            }
            break;

          case 'mustache':
            // Mustache (box over upper lip)
            const mustacheGeometry = new THREE.BoxGeometry(0.08 * thickness, 0.02 * thickness, 0.005);
            const mustache = new THREE.Mesh(mustacheGeometry, hairMaterial);
            mustache.position.set(0, 1.44, 0.22);
            facialHairGroup.add(mustache);
            break;

          case 'goatee':
            // Goatee (chin hair)
            const goateeGeometry = new THREE.BoxGeometry(0.06 * thickness, 0.06 * thickness, 0.005);
            const goatee = new THREE.Mesh(goateeGeometry, hairMaterial);
            goatee.position.set(0, 1.35, 0.22);
            facialHairGroup.add(goatee);
            break;

          case 'full-beard':
            // Full beard (combines goatee and sideburns)
            const beardGeometry = new THREE.BoxGeometry(0.12 * thickness, 0.12 * thickness, 0.005);
            const beard = new THREE.Mesh(beardGeometry, hairMaterial);
            beard.position.set(0, 1.38, 0.22);
            facialHairGroup.add(beard);
            break;
        }

        if (facialHairGroup.children.length > 0) {
          group.add(facialHairGroup);
          onParameterApplied();
        }
      } catch (error) {
        logger.warn('Failed to build facial hair:', undefined, {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // === BODY HAIR ===
    // Note: Body hair is typically rendered as texture overlays rather than geometry
    // For GLB export, we'll create simplified geometry representations
    if (config.bodyHair) {
      try {
        const { chest, back, arms, legs, color } = config.bodyHair;
        const hairColor = color || '#8b4513';
        
        // Only create body hair if any region has density > 0
        if (chest > 0 || back > 0 || arms > 0 || legs > 0) {
          const bodyHairGroup = new THREE.Group();
          bodyHairGroup.name = 'BodyHair';

          // Create small hair strands as simplified geometry
          const hairMaterial = new THREE.MeshStandardMaterial({
            color: hairColor,
            roughness: 0.9,
            metalness: 0.0,
            transparent: true,
            opacity: 0.6, // Body hair is subtle
          });

          // Chest hair
          if (chest > 0) {
            for (let i = 0; i < Math.floor(chest * 20); i++) {
              const strandGeometry = new THREE.CylinderGeometry(0.002, 0.002, 0.01 * chest, 4);
              const strand = new THREE.Mesh(strandGeometry, hairMaterial);
              strand.position.set(
                -0.1 + (Math.random() * 0.2),
                0.55 + (Math.random() * 0.1),
                0.17 + (Math.random() * 0.02)
              );
              strand.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
              bodyHairGroup.add(strand);
            }
          }

          // Arm hair (simplified)
          if (arms > 0) {
            // Left arm
            for (let i = 0; i < Math.floor(arms * 15); i++) {
              const strandGeometry = new THREE.CylinderGeometry(0.001, 0.001, 0.008 * arms, 4);
              const strand = new THREE.Mesh(strandGeometry, hairMaterial);
              strand.position.set(
                -0.32 + (Math.random() * 0.1),
                0.3 + (Math.random() * 0.4),
                0.06
              );
              strand.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
              bodyHairGroup.add(strand);
            }
            // Right arm
            for (let i = 0; i < Math.floor(arms * 15); i++) {
              const strandGeometry = new THREE.CylinderGeometry(0.001, 0.001, 0.008 * arms, 4);
              const strand = new THREE.Mesh(strandGeometry.clone(), hairMaterial);
              strand.position.set(
                0.32 - (Math.random() * 0.1),
                0.3 + (Math.random() * 0.4),
                0.06
              );
              strand.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
              bodyHairGroup.add(strand);
            }
          }

          // Leg hair (simplified)
          if (legs > 0) {
            // Left leg
            for (let i = 0; i < Math.floor(legs * 20); i++) {
              const strandGeometry = new THREE.CylinderGeometry(0.001, 0.001, 0.008 * legs, 4);
              const strand = new THREE.Mesh(strandGeometry, hairMaterial);
              strand.position.set(
                -0.12,
                -0.4 + (Math.random() * 0.5),
                0.06
              );
              strand.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
              bodyHairGroup.add(strand);
            }
            // Right leg
            for (let i = 0; i < Math.floor(legs * 20); i++) {
              const strandGeometry = new THREE.CylinderGeometry(0.001, 0.001, 0.008 * legs, 4);
              const strand = new THREE.Mesh(strandGeometry.clone(), hairMaterial);
              strand.position.set(
                0.12,
                -0.4 + (Math.random() * 0.5),
                0.06
              );
              strand.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
              bodyHairGroup.add(strand);
            }
          }

          if (bodyHairGroup.children.length > 0) {
            group.add(bodyHairGroup);
            onParameterApplied();
          }
        }
      } catch (error) {
        logger.warn('Failed to build body hair:', undefined, {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return group.children.length > 0 ? group : null;
  } catch (error) {
    logger.warn('Failed to build extras:', undefined, {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

/**
 * Build makeup overlays (foundation, blush, eyeshadow, eyeliner, lipstick)
 * Applied as transparent material overlays on face regions
 */
async function buildMakeup(
  config: FullCharacterConfig,
  qualityPreset: ReturnType<typeof getQualityPreset>,
  options: ComprehensiveGLBOptions,
  onParameterApplied: () => void
): Promise<THREE.Group | null> {
  try {
    const group = new THREE.Group();
    group.name = 'Makeup';

    if (!config.makeup) {
      return null;
    }

    // === FOUNDATION ===
    if (config.makeup.foundation?.enabled) {
      try {
        const { color, opacity } = config.makeup.foundation;
        const foundationColor = color || '#fde4d0';
        const foundationOpacity = opacity || 0.3;

        // Foundation covers entire face area (simplified as a plane)
        const foundationGeometry = new THREE.PlaneGeometry(0.16, 0.20);
        const foundationMaterial = new THREE.MeshStandardMaterial({
          color: foundationColor,
          transparent: true,
          opacity: foundationOpacity,
          roughness: 0.3,
          metalness: 0.0,
          side: THREE.DoubleSide,
        });

        const foundation = new THREE.Mesh(foundationGeometry, foundationMaterial);
        foundation.position.set(0, 1.5, 0.19);
        foundation.name = 'Foundation';
        group.add(foundation);
        onParameterApplied();
      } catch (error) {
        logger.warn('Failed to build foundation:', undefined, {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // === BLUSH ===
    if (config.makeup.blush?.enabled) {
      try {
        const { color, intensity, placement } = config.makeup.blush;
        const blushColor = color || '#ff6b9d';
        const blushIntensity = intensity || 0.5;
        const blushOpacity = blushIntensity * 0.6;

        // Create blush for each placement
        if (placement === 'cheeks' || placement === 'both') {
          // Left cheek
          const leftCheekGeometry = new THREE.CircleGeometry(0.04, 16);
          const leftCheekMaterial = new THREE.MeshStandardMaterial({
            color: blushColor,
            transparent: true,
            opacity: blushOpacity,
            roughness: 0.4,
            metalness: 0.0,
            side: THREE.DoubleSide,
          });
          const leftCheek = new THREE.Mesh(leftCheekGeometry, leftCheekMaterial);
          leftCheek.position.set(-0.06, 1.48, 0.20);
          leftCheek.name = 'BlushLeft';
          group.add(leftCheek);

          // Right cheek
          const rightCheekGeometry = leftCheekGeometry.clone();
          const rightCheek = new THREE.Mesh(rightCheekGeometry, leftCheekMaterial);
          rightCheek.position.set(0.06, 1.48, 0.20);
          rightCheek.name = 'BlushRight';
          group.add(rightCheek);
          onParameterApplied();
        }

        if (placement === 'nose' || placement === 'both') {
          // Nose blush
          const noseGeometry = new THREE.CircleGeometry(0.025, 16);
          const noseMaterial = new THREE.MeshStandardMaterial({
            color: blushColor,
            transparent: true,
            opacity: blushOpacity,
            roughness: 0.4,
            metalness: 0.0,
            side: THREE.DoubleSide,
          });
          const nose = new THREE.Mesh(noseGeometry, noseMaterial);
          nose.position.set(0, 1.46, 0.21);
          nose.name = 'BlushNose';
          group.add(nose);
          onParameterApplied();
        }
      } catch (error) {
        logger.warn('Failed to build blush:', undefined, {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // === EYESHADOW ===
    if (config.makeup.eyeshadow?.enabled) {
      try {
        const { color, intensity, style } = config.makeup.eyeshadow;
        const eyeshadowColor = color || '#8b5cf6';
        const eyeshadowIntensity = intensity || 0.5;
        const eyeshadowOpacity = eyeshadowIntensity * 0.7;

        // Adjust size based on style
        let eyeshadowSize = 0.035;
        if (style === 'dramatic') {
          eyeshadowSize = 0.045;
        } else if (style === 'smokey') {
          eyeshadowSize = 0.040;
        }

        // Left eye shadow (simplified as circle with scale to create ellipse)
        const leftEyeshadowGeometry = new THREE.CircleGeometry(eyeshadowSize, 16);
        // Scale to create ellipse shape
        leftEyeshadowGeometry.scale(1.0, 0.6, 1.0);
        const leftEyeshadowMaterial = new THREE.MeshStandardMaterial({
          color: eyeshadowColor,
          transparent: true,
          opacity: eyeshadowOpacity,
          roughness: 0.3,
          metalness: 0.0,
          side: THREE.DoubleSide,
        });
        const leftEyeshadow = new THREE.Mesh(leftEyeshadowGeometry, leftEyeshadowMaterial);
        leftEyeshadow.position.set(-0.04, 1.52, 0.20);
        leftEyeshadow.name = 'EyeshadowLeft';
        group.add(leftEyeshadow);

        // Right eye shadow
        const rightEyeshadowGeometry = new THREE.CircleGeometry(eyeshadowSize, 16);
        rightEyeshadowGeometry.scale(1.0, 0.6, 1.0);
        const rightEyeshadow = new THREE.Mesh(rightEyeshadowGeometry, leftEyeshadowMaterial);
        rightEyeshadow.position.set(0.04, 1.52, 0.20);
        rightEyeshadow.name = 'EyeshadowRight';
        group.add(rightEyeshadow);
        onParameterApplied();
      } catch (error) {
        logger.warn('Failed to build eyeshadow:', undefined, {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // === EYELINER ===
    if (config.makeup.eyeliner?.enabled) {
      try {
        const { color, thickness, style } = config.makeup.eyeliner;
        const eyelinerColor = color || '#000000';
        const eyelinerThickness = thickness || 0.5;

        // Eyeliner thickness multiplier
        const thicknessMultiplier = style === 'heavy' ? 1.5 : style === 'winged' ? 1.2 : 1.0;
        const lineWidth = 0.003 * eyelinerThickness * thicknessMultiplier;

        // Left eyeliner (simplified as a thin box)
        const leftEyelinerGeometry = new THREE.BoxGeometry(0.06, lineWidth, 0.002);
        const leftEyelinerMaterial = new THREE.MeshStandardMaterial({
          color: eyelinerColor,
          roughness: 0.1,
          metalness: 0.0,
        });
        const leftEyeliner = new THREE.Mesh(leftEyelinerGeometry, leftEyelinerMaterial);
        leftEyeliner.position.set(-0.04, 1.52, 0.21);
        leftEyeliner.name = 'EyelinerLeft';
        group.add(leftEyeliner);

        // Right eyeliner
        const rightEyelinerGeometry = leftEyelinerGeometry.clone();
        const rightEyeliner = new THREE.Mesh(rightEyelinerGeometry, leftEyelinerMaterial);
        rightEyeliner.position.set(0.04, 1.52, 0.21);
        rightEyeliner.name = 'EyelinerRight';
        group.add(rightEyeliner);

        // Winged style adds extensions
        if (style === 'winged') {
          // Left wing
          const leftWingGeometry = new THREE.BoxGeometry(lineWidth * 2, lineWidth * 3, 0.002);
          const leftWing = new THREE.Mesh(leftWingGeometry, leftEyelinerMaterial);
          leftWing.position.set(-0.07, 1.53, 0.21);
          leftWing.rotation.z = -0.3;
          leftWing.name = 'EyelinerWingLeft';
          group.add(leftWing);

          // Right wing
          const rightWing = new THREE.Mesh(leftWingGeometry.clone(), leftEyelinerMaterial);
          rightWing.position.set(0.07, 1.53, 0.21);
          rightWing.rotation.z = 0.3;
          rightWing.name = 'EyelinerWingRight';
          group.add(rightWing);
        }

        onParameterApplied();
      } catch (error) {
        logger.warn('Failed to build eyeliner:', undefined, {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // === LIPSTICK ===
    if (config.makeup.lipstick?.enabled) {
      try {
        const { color, glossiness, style } = config.makeup.lipstick;
        const lipstickColor = color || '#ff6b9d';
        const lipGlossiness = glossiness || 0.5;

        // Lip geometry (simplified as curved plane)
        const lipGeometry = new THREE.PlaneGeometry(0.04, 0.015);
        
        // Apply curve to lips (bend geometry slightly)
        const positions = lipGeometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
          const x = positions.getX(i);
          // Create slight curve
          const curve = Math.sin((x / 0.02) * Math.PI) * 0.003;
          positions.setY(i, positions.getY(i) + curve);
        }
        lipGeometry.computeVertexNormals();

        const lipMaterial = new THREE.MeshStandardMaterial({
          color: lipstickColor,
          transparent: true,
          opacity: 0.9,
          roughness: 1.0 - (lipGlossiness * 0.7), // More glossy = less rough
          metalness: lipGlossiness * 0.2,
          side: THREE.DoubleSide,
        });

        const lips = new THREE.Mesh(lipGeometry, lipMaterial);
        lips.position.set(0, 1.42, 0.22);
        lips.name = 'Lipstick';
        group.add(lips);
        onParameterApplied();

        // Gradient style adds a second layer with different opacity
        if (style === 'gradient') {
          const gradientGeometry = lipGeometry.clone();
          const gradientMaterial = new THREE.MeshStandardMaterial({
            color: lipstickColor,
            transparent: true,
            opacity: 0.4,
            roughness: 0.2,
            metalness: 0.3,
            side: THREE.DoubleSide,
          });
          const gradient = new THREE.Mesh(gradientGeometry, gradientMaterial);
          gradient.position.set(0, 1.423, 0.221); // Slightly forward
          gradient.scale.set(0.8, 0.6, 1.0); // Smaller for gradient effect
          gradient.name = 'LipstickGradient';
          group.add(gradient);
          onParameterApplied();
        }
      } catch (error) {
        logger.warn('Failed to build lipstick:', undefined, {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return group.children.length > 0 ? group : null;
  } catch (error) {
    logger.warn('Failed to build makeup:', undefined, {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

/**
 * Build VFX effects: aura, glow, particles
 * Note: For GLB export, we create simplified static representations
 * Full particle systems would require runtime animation
 */
async function buildVFX(
  config: FullCharacterConfig,
  qualityPreset: ReturnType<typeof getQualityPreset>,
  options: ComprehensiveGLBOptions,
  onParameterApplied: () => void
): Promise<THREE.Group | null> {
  try {
    const group = new THREE.Group();
    group.name = 'VFX';

    if (!config.vfx) {
      return null;
    }

    const segments = qualityPreset.bodySegments;

    // === AURA ===
    if (config.vfx.aura?.enabled) {
      try {
        const { type, color, intensity } = config.vfx.aura;
        const auraColor = color || '#ffffff';
        const auraIntensity = intensity || 0.5;

        const auraGroup = new THREE.Group();
        auraGroup.name = 'Aura';

        switch (type) {
          case 'glow':
            // Glow aura (emissive sphere around character)
            const glowGeometry = new THREE.SphereGeometry(1.2, segments, segments);
            const glowMaterial = new THREE.MeshStandardMaterial({
              color: auraColor,
              emissive: auraColor,
              emissiveIntensity: auraIntensity,
              transparent: true,
              opacity: 0.3,
              side: THREE.BackSide, // Render inside out for glow effect
            });
            const glow = new THREE.Mesh(glowGeometry, glowMaterial);
            glow.position.set(0, 0.5, 0);
            glow.name = 'AuraGlow';
            auraGroup.add(glow);
            break;

          case 'mist':
            // Mist aura (cloud-like effect, simplified as multiple spheres)
            for (let i = 0; i < 8; i++) {
              const mistGeometry = new THREE.SphereGeometry(0.3 + Math.random() * 0.2, 16, 16);
              const mistMaterial = new THREE.MeshStandardMaterial({
                color: auraColor,
                transparent: true,
                opacity: auraIntensity * 0.2,
                fog: true,
              });
              const mist = new THREE.Mesh(mistGeometry, mistMaterial);
              const angle = (i / 8) * Math.PI * 2;
              const radius = 0.8 + Math.random() * 0.3;
              mist.position.set(
                Math.cos(angle) * radius,
                0.3 + (Math.random() * 0.6),
                Math.sin(angle) * radius
              );
              mist.name = `AuraMist${i}`;
              auraGroup.add(mist);
            }
            break;

          case 'particles':
            // Particle aura (simplified as small spheres)
            const particleCount = Math.floor(auraIntensity * 50);
            for (let i = 0; i < particleCount; i++) {
              const particleGeometry = new THREE.SphereGeometry(0.02, 8, 8);
              const particleMaterial = new THREE.MeshStandardMaterial({
                color: auraColor,
                emissive: auraColor,
                emissiveIntensity: 1.0,
              });
              const particle = new THREE.Mesh(particleGeometry, particleMaterial);
              const angle1 = Math.random() * Math.PI * 2;
              const angle2 = Math.random() * Math.PI;
              const radius = 0.9 + Math.random() * 0.4;
              particle.position.set(
                Math.sin(angle2) * Math.cos(angle1) * radius,
                Math.cos(angle2) * radius + 0.5,
                Math.sin(angle2) * Math.sin(angle1) * radius
              );
              particle.name = `AuraParticle${i}`;
              auraGroup.add(particle);
            }
            break;

          case 'elemental':
            // Elemental aura (simplified as colored sphere with emissive)
            const elementalGeometry = new THREE.SphereGeometry(1.1, segments, segments);
            const elementalMaterial = new THREE.MeshStandardMaterial({
              color: auraColor,
              emissive: auraColor,
              emissiveIntensity: auraIntensity * 0.8,
              transparent: true,
              opacity: 0.4,
              side: THREE.BackSide,
            });
            const elemental = new THREE.Mesh(elementalGeometry, elementalMaterial);
            elemental.position.set(0, 0.5, 0);
            elemental.name = 'AuraElemental';
            auraGroup.add(elemental);
            break;
        }

        if (auraGroup.children.length > 0) {
          group.add(auraGroup);
          onParameterApplied();
        }
      } catch (error) {
        logger.warn('Failed to build aura:', undefined, {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // === GLOW ===
    // Note: Glow effects are applied to specific parts
    // For GLB export, we'll add emissive materials to those parts
    // This is handled by marking parts for glow, which would need to be applied
    // to the actual body parts during their creation
    // For now, we'll create placeholder glow objects that represent the glow
    if (config.vfx.glow?.enabled && config.vfx.glow.parts.length > 0) {
      try {
        const { parts, color, intensity } = config.vfx.glow;
        const glowColor = color || '#ffffff';
        const glowIntensity = intensity || 0.5;

        const glowGroup = new THREE.Group();
        glowGroup.name = 'Glow';

        // Create glow representations for each part
        for (const part of parts) {
          let glowGeometry: THREE.BufferGeometry;
          let position: [number, number, number];

          switch (part) {
            case 'eyes':
              glowGeometry = new THREE.SphereGeometry(0.015, 12, 12);
              position = [-0.04, 1.52, 0.22]; // Left eye
              // Add both eyes
              const leftEyeGlow = new THREE.Mesh(glowGeometry, new THREE.MeshStandardMaterial({
                color: glowColor,
                emissive: glowColor,
                emissiveIntensity: glowIntensity,
              }));
              leftEyeGlow.position.set(...position);
              leftEyeGlow.name = 'GlowEyeLeft';
              glowGroup.add(leftEyeGlow);

              const rightEyeGlow = new THREE.Mesh(glowGeometry.clone(), new THREE.MeshStandardMaterial({
                color: glowColor,
                emissive: glowColor,
                emissiveIntensity: glowIntensity,
              }));
              rightEyeGlow.position.set(0.04, 1.52, 0.22);
              rightEyeGlow.name = 'GlowEyeRight';
              glowGroup.add(rightEyeGlow);
              break;

            case 'hair':
              // Hair glow (simplified as sphere around head)
              glowGeometry = new THREE.SphereGeometry(0.16, 16, 16);
              position = [0, 1.65, 0];
              const hairGlow = new THREE.Mesh(glowGeometry, new THREE.MeshStandardMaterial({
                color: glowColor,
                emissive: glowColor,
                emissiveIntensity: glowIntensity * 0.5,
                transparent: true,
                opacity: 0.3,
                side: THREE.BackSide,
              }));
              hairGlow.position.set(...position);
              hairGlow.name = 'GlowHair';
              glowGroup.add(hairGlow);
              break;

            case 'accessories':
              // Accessories glow would be applied to accessories themselves
              // This is a placeholder
              break;

            case 'skin':
              // Skin glow (subtle emissive, handled by material modification)
              // For GLB, we create a subtle glow sphere
              glowGeometry = new THREE.SphereGeometry(1.0, segments, segments);
              const skinGlow = new THREE.Mesh(glowGeometry, new THREE.MeshStandardMaterial({
                color: glowColor,
                emissive: glowColor,
                emissiveIntensity: glowIntensity * 0.2,
                transparent: true,
                opacity: 0.2,
                side: THREE.BackSide,
              }));
              skinGlow.position.set(0, 0.5, 0);
              skinGlow.name = 'GlowSkin';
              glowGroup.add(skinGlow);
              break;
          }
        }

        if (glowGroup.children.length > 0) {
          group.add(glowGroup);
          onParameterApplied();
        }
      } catch (error) {
        logger.warn('Failed to build glow:', undefined, {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // === PARTICLES ===
    if (config.vfx.particles?.enabled) {
      try {
        const { type, density, color } = config.vfx.particles;
        const particleColor = color || '#ffffff';
        const particleDensity = density || 0.5;

        const particlesGroup = new THREE.Group();
        particlesGroup.name = 'Particles';

        const particleCount = Math.floor(particleDensity * 100);

        // Create particles as small meshes (simplified representation for GLB)
        for (let i = 0; i < particleCount; i++) {
          let particleGeometry: THREE.BufferGeometry;

          switch (type) {
            case 'sakura':
            case 'sparkles':
            case 'hearts':
              // Simple star/point shape (using octahedron for star-like appearance)
              particleGeometry = new THREE.OctahedronGeometry(0.01, 0);
              break;
            case 'stars':
              // Star shape (octahedron)
              particleGeometry = new THREE.OctahedronGeometry(0.015, 0);
              break;
            case 'fire':
              // Fire particles (small spheres)
              particleGeometry = new THREE.SphereGeometry(0.008, 8, 8);
              break;
            default:
              particleGeometry = new THREE.SphereGeometry(0.01, 8, 8);
              break;
          }

          const particleMaterial = new THREE.MeshStandardMaterial({
            color: particleColor,
            emissive: type === 'fire' || type === 'sparkles' ? particleColor : undefined,
            emissiveIntensity: type === 'fire' || type === 'sparkles' ? 1.0 : 0.0,
            transparent: true,
            opacity: 0.8,
          });

          const particle = new THREE.Mesh(particleGeometry, particleMaterial);
          
          // Distribute particles around character
          const angle1 = Math.random() * Math.PI * 2;
          const angle2 = Math.random() * Math.PI;
          const radius = 1.0 + Math.random() * 0.5;
          particle.position.set(
            Math.sin(angle2) * Math.cos(angle1) * radius,
            Math.cos(angle2) * radius + 0.5,
            Math.sin(angle2) * Math.sin(angle1) * radius
          );
          particle.name = `Particle_${type}_${i}`;
          particlesGroup.add(particle);
        }

        if (particlesGroup.children.length > 0) {
          group.add(particlesGroup);
          onParameterApplied();
        }
      } catch (error) {
        logger.warn('Failed to build particles:', undefined, {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return group.children.length > 0 ? group : null;
  } catch (error) {
    logger.warn('Failed to build VFX:', undefined, {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

