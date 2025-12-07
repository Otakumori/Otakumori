/**
 * 2D Sprite Generation System
 * Converts 3D avatars to 2D sprite sheets for side-scrolling games
 */

import * as THREE from 'three';
import type { AvatarConfiguration } from '@/app/lib/3d/avatar-parts';
import type { AvatarProfile, ColorPalette } from '../types/avatar';
import { loadRegistry } from '../registry/loader';
import { assembleAvatar } from '../pipeline/assembleAvatar';
import { getRepresentationTransform } from '../renderer/representationModes';
import { applyOutline } from '../materials/outlinePass';

export type AnimationState = 'idle' | 'walk' | 'run' | 'jump' | 'attack' | 'hurt' | 'victory';
export type SpriteDirection = 'left' | 'right';

export interface SpriteFrame {
  imageData: ImageData | string; // base64 or ImageData
  frameIndex: number;
  animationState: AnimationState;
  direction: SpriteDirection;
}

export interface SpriteSheet {
  frames: SpriteFrame[];
  frameWidth: number;
  frameHeight: number;
  animationStates: AnimationState[];
  directions: SpriteDirection[];
  spriteSheetUrl?: string; // URL if uploaded to storage
}

export interface SpriteGenerationOptions {
  resolution?: 'low' | 'medium' | 'high';
  frameCount?: number;
  animationStates?: AnimationState[];
  directions?: SpriteDirection[];
  backgroundColor?: string;
}

/**
 * Generate sprite sheets from 3D avatar
 * Converts AvatarConfiguration to 2D sprite sheets for side-scrolling games
 */
export async function generateSpriteSheet(
  avatarConfig: AvatarConfiguration,
  options: SpriteGenerationOptions = {},
): Promise<SpriteSheet> {
  const {
    resolution = 'medium',
    frameCount = 8,
    animationStates = ['idle', 'walk', 'run', 'jump', 'attack', 'hurt', 'victory'],
    directions = ['left', 'right'],
    backgroundColor = 'transparent',
  } = options;

  // Resolution mapping
  const resolutionMap = {
    low: { width: 64, height: 128 },
    medium: { width: 128, height: 256 },
    high: { width: 256, height: 512 },
  };

  const { width, height } = resolutionMap[resolution];

  // Step 1: Convert AvatarConfiguration to AvatarProfile
  const avatarProfile = convertAvatarConfigToProfile(avatarConfig);

  // Step 2: Load asset registry
  const registry = await loadRegistry();

  // Step 3: Assemble avatar
  const assembled = await assembleAvatar(avatarProfile, registry, { loadAssets: true });

  // Step 4: Get sideScroller representation mode config
  const transformConfig = getRepresentationTransform('sideScroller');

  // Step 5: Create Three.js scene
  const scene = new THREE.Scene();
  const avatarGroup = assembled.group.clone();

  // Apply scale from representation mode
  avatarGroup.scale.set(...transformConfig.scale);

  // Apply outline if enabled
  let finalGroup = avatarGroup;
  try {
    finalGroup = applyOutline(avatarGroup, {
      outlineWidth: transformConfig.shadingTweaks.outlineWidth,
      outlineColor: transformConfig.shadingTweaks.outlineColor,
    });
  } catch (error) {
    // If outline fails, use original group
    console.warn('Failed to apply outline, using original group:', error);
    finalGroup = avatarGroup;
  }

  scene.add(finalGroup);

  // Step 6: Set up lighting (same as 3D rendering)
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
  keyLight.position.set(5, 8, 3);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xfff5e6, 0.5);
  fillLight.position.set(-3, 2, 2);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xffe0cc, 0.8);
  rimLight.position.set(-2, 3, -5);
  scene.add(rimLight);

  // Step 7: Set up orthographic camera for side view
  const aspect = width / height;
  const cameraSize = 2;
  const camera = new THREE.OrthographicCamera(
    -cameraSize * aspect,
    cameraSize * aspect,
    cameraSize,
    -cameraSize,
    0.1,
    1000,
  );

  // Position camera for side view (using sideScroller config)
  const [camX, camY, camZ] = transformConfig.cameraOffset;
  camera.position.set(camX, camY, camZ);
  camera.lookAt(0, 1.5, 0); // Look at avatar center

  // Step 8: Create WebGL renderer
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true, // Required for toDataURL
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(1); // Use 1:1 pixel ratio for sprites
  renderer.setClearColor(0x000000, 0); // Transparent background
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  // Note: outputEncoding/sRGBEncoding deprecated in THREE.js r152+, use colorSpace instead
  // Legacy THREE.js API compatibility
  if ('outputEncoding' in renderer && 'sRGBEncoding' in THREE) {
     
    (renderer as any).outputEncoding = (THREE as any).sRGBEncoding;
  } else if ('colorSpace' in renderer) {
     
    (renderer as any).colorSpace = 'srgb';
  }

  // Step 9: Set up animation mixer if animations are available
  // Explicitly typed to avoid TypeScript narrowing to 'never'
  let mixer: THREE.AnimationMixer | null = null as THREE.AnimationMixer | null;
  const clock = new THREE.Clock();

  // Try to find animations in the avatar group
  // In full implementation, animations would be loaded with the avatar
  // For now, we'll use static poses with slight variations
  // If animations are available in the future, initialize mixer here:
  // mixer = new THREE.AnimationMixer(finalGroup);

  // Animation timing (default durations in milliseconds)
  const animationDurations: Record<AnimationState, number> = {
    idle: 2000,
    walk: 1000,
    run: 800,
    jump: 1200,
    attack: 600,
    hurt: 500,
    victory: 1500,
  };

  // Step 10: Render frames for each animation state and direction
  const frames: SpriteFrame[] = [];

  for (const state of animationStates) {
    for (const direction of directions) {
      // Rotate avatar for direction (left = 0°, right = 180°)
      if (direction === 'right') {
        finalGroup.rotation.y = Math.PI;
      } else {
        finalGroup.rotation.y = 0;
      }

      const duration = animationDurations[state] || 1000;

      // Reset animation mixer for this state
      // Note: mixer is always null in current implementation, but kept for future use
      const currentMixer = mixer;
      if (currentMixer !== null) {
        currentMixer.stopAllAction();
        // In full implementation, would set the appropriate animation action here
      }

      for (let i = 0; i < frameCount; i++) {
        // Calculate animation time (0 to 1)
        const animationTime = i / frameCount;
        const animationTimeSeconds = (animationTime * duration) / 1000;

        // Update animation mixer if available
        if (currentMixer !== null) {
          currentMixer.update(animationTimeSeconds);
        } else {
          // Apply static pose variations based on animation state
          applyStaticPose(finalGroup, state, animationTime);
        }

        // Render frame
        renderer.render(scene, camera);

        // Capture frame to base64
        const dataURL = renderer.domElement.toDataURL('image/png');

        frames.push({
          imageData: dataURL,
          frameIndex: i,
          animationState: state,
          direction,
        });
      }
    }
  }

  // Step 10: Cleanup
  renderer.dispose();
  scene.clear();
  finalGroup.clear();
  avatarGroup.clear();

  return {
    frames,
    frameWidth: width,
    frameHeight: height,
    animationStates,
    directions,
  };
}

/**
 * Cache key for sprite sheets
 */
export function getSpriteCacheKey(
  avatarConfig: AvatarConfiguration,
  options: SpriteGenerationOptions,
): string {
  // Create a hash from avatar config and options
  const configStr = JSON.stringify(avatarConfig);
  const optionsStr = JSON.stringify(options);
  // In production, use a proper hash function
  return `sprite_${btoa(configStr + optionsStr).slice(0, 32)}`;
}

/**
 * Check if sprite sheet is cached
 */
export async function getCachedSpriteSheet(
  cacheKey: string,
): Promise<SpriteSheet | null> {
  if (typeof window === 'undefined') return null;

  try {
    const cached = localStorage.getItem(`sprite_${cacheKey}`);
    if (cached) {
      return JSON.parse(cached) as SpriteSheet;
    }
  } catch (error) {
    console.warn('Failed to load cached sprite sheet:', error);
  }

  return null;
}

/**
 * Cache sprite sheet
 */
export async function cacheSpriteSheet(
  cacheKey: string,
  spriteSheet: SpriteSheet,
): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(`sprite_${cacheKey}`, JSON.stringify(spriteSheet));
  } catch (error) {
    console.warn('Failed to cache sprite sheet:', error);
  }
}

/**
 * Generate sprite sheet with caching
 */
export async function generateSpriteSheetWithCache(
  avatarConfig: AvatarConfiguration,
  options: SpriteGenerationOptions = {},
): Promise<SpriteSheet> {
  const cacheKey = getSpriteCacheKey(avatarConfig, options);

  // Check cache first
  const cached = await getCachedSpriteSheet(cacheKey);
  if (cached) {
    return cached;
  }

  // Generate new sprite sheet
  const spriteSheet = await generateSpriteSheet(avatarConfig, options);

  // Cache it
  await cacheSpriteSheet(cacheKey, spriteSheet);

  return spriteSheet;
}

/**
 * Convert AvatarConfiguration to AvatarProfile
 * This is a simplified version - in production, use the full converter from app/mini-games/_shared
 */
function convertAvatarConfigToProfile(config: AvatarConfiguration): AvatarProfile {
  // Extract color palette
  const extractColor = (value: any): string => {
    if (typeof value === 'string') return value;
    if (value instanceof Object && 'getHexString' in value) {
      return `#${(value as any).getHexString()}`;
    }
    return '#FFFFFF';
  };

  const colorPalette: ColorPalette = {
    skin:
      extractColor(config.materialOverrides?.skin?.value) ||
      '#FFDBAC',
    hair:
      extractColor(config.materialOverrides?.hair?.value) ||
      '#3D2817',
    eyes: '#4A5568',
    outfit:
      extractColor(config.materialOverrides?.clothing_primary?.value) ||
      '#666666',
    accent:
      extractColor(config.materialOverrides?.accent?.value) ||
      '#FF69B4',
  };

  // Map parts
  const head = config.parts.head || 'head_default';
  const torso = config.parts.torso || config.parts.body || 'torso_default';
  const legs = config.parts.legs || 'legs_default';
  const accessory = config.parts.accessories || config.parts.jewelry || undefined;

  // Extract morph weights
  const morphWeights: Record<string, number> = {};
  Object.entries(config.morphTargets || {}).forEach(([key, value]) => {
    morphWeights[key] = value;
  });

  // Extract NSFW layers
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
 * Apply static pose variations for animation states
 * Used when animations are not available
 */
function applyStaticPose(
  group: THREE.Group,
  state: AnimationState,
  animationTime: number,
): void {
  // Apply subtle pose variations based on animation state
  switch (state) {
    case 'idle':
      // Subtle breathing animation
      group.position.y = Math.sin(animationTime * Math.PI * 2) * 0.02;
      break;
    case 'walk':
      // Walking cycle - slight vertical bounce
      group.position.y = Math.abs(Math.sin(animationTime * Math.PI * 2)) * 0.05;
      group.rotation.z = Math.sin(animationTime * Math.PI * 2) * 0.05;
      break;
    case 'run':
      // Running cycle - more pronounced bounce
      group.position.y = Math.abs(Math.sin(animationTime * Math.PI * 2)) * 0.1;
      group.rotation.z = Math.sin(animationTime * Math.PI * 2) * 0.1;
      break;
    case 'jump':
      // Jump arc
      const jumpHeight = Math.sin(animationTime * Math.PI) * 0.3;
      group.position.y = jumpHeight;
      break;
    case 'attack':
      // Attack lunge
      group.position.x = Math.sin(animationTime * Math.PI) * 0.1;
      break;
    case 'hurt':
      // Hurt recoil
      group.rotation.z = Math.sin(animationTime * Math.PI * 4) * 0.1;
      break;
    case 'victory':
      // Victory pose - slight upward movement
      group.position.y = Math.sin(animationTime * Math.PI * 2) * 0.05;
      break;
  }
}

