/**
 * Petal VFX Configuration
 * 
 * Centralized configuration for all petal visual effects across the site.
 * Ensures consistent sizing, movement, and performance across all petal systems.
 */

export interface PetalVFXConfig {
  // Size constraints (in pixels)
  minSize: number;
  maxSize: number;
  
  // Movement parameters
  baseSpeed: number;
  speedVariation: number;
  windStrength: number;
  
  // Visual parameters
  minOpacity: number;
  maxOpacity: number;
  
  // Performance parameters
  maxParticles: number;
  spawnInterval: number; // milliseconds
  
  // Rotation
  rotationSpeed: number;
}

/**
 * Canonical petal size range
 * Prevents random huge blobs and ensures visual consistency
 */
export const PETAL_SIZE_RANGE = {
  min: 4,   // Minimum petal size in pixels
  max: 16,  // Maximum petal size in pixels
} as const;

/**
 * Petal VFX configurations for different contexts
 */
export const PETAL_VFX_CONFIGS: Record<'home' | 'site' | 'game', PetalVFXConfig> = {
  home: {
    minSize: PETAL_SIZE_RANGE.min,
    maxSize: PETAL_SIZE_RANGE.max,
    baseSpeed: 0.4,
    speedVariation: 0.2,
    windStrength: 0.3,
    minOpacity: 0.3,
    maxOpacity: 0.7,
    maxParticles: 30,
    spawnInterval: 2000,
    rotationSpeed: 0.05,
  },
  site: {
    minSize: PETAL_SIZE_RANGE.min,
    maxSize: PETAL_SIZE_RANGE.max * 0.8, // Slightly smaller for site-wide
    baseSpeed: 0.3,
    speedVariation: 0.15,
    windStrength: 0.2,
    minOpacity: 0.2,
    maxOpacity: 0.6,
    maxParticles: 20,
    spawnInterval: 2500,
    rotationSpeed: 0.03,
  },
  game: {
    minSize: PETAL_SIZE_RANGE.min * 0.8,
    maxSize: PETAL_SIZE_RANGE.max * 0.9,
    baseSpeed: 0.5,
    speedVariation: 0.25,
    windStrength: 0.4,
    minOpacity: 0.4,
    maxOpacity: 0.8,
    maxParticles: 15,
    spawnInterval: 1500,
    rotationSpeed: 0.08,
  },
};

/**
 * Get petal size with variation
 * Ensures size stays within canonical range
 */
export function getPetalSize(config: PetalVFXConfig, variation: number = Math.random()): number {
  const size = config.minSize + (config.maxSize - config.minSize) * variation;
  return Math.max(config.minSize, Math.min(config.maxSize, size));
}

/**
 * Get petal speed with variation
 */
export function getPetalSpeed(config: PetalVFXConfig, variation: number = Math.random()): number {
  return config.baseSpeed + (config.speedVariation * (variation - 0.5));
}

/**
 * Get petal opacity with variation
 */
export function getPetalOpacity(config: PetalVFXConfig, variation: number = Math.random()): number {
  return config.minOpacity + (config.maxOpacity - config.minOpacity) * variation;
}

