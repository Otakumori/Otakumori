/**
 * Game Visual Enhancement Utilities
 *
 * Utilities for enhanced game backgrounds, effects, and visuals
 */

export interface ParallaxLayer {
  speed: number; // 0-1, parallax speed multiplier
  depth: number; // Z-depth for layering
  opacity: number; // 0-1
}

export interface BackgroundProfile {
  name: string;
  layers: ParallaxLayer[];
  color: string;
  effects: string[];
}

export const GAME_BACKGROUND_PROFILES: Record<string, BackgroundProfile> = {
  default: {
    name: 'Default',
    layers: [
      { speed: 0.1, depth: 0, opacity: 1.0 },
      { speed: 0.3, depth: 1, opacity: 0.8 },
      { speed: 0.5, depth: 2, opacity: 0.6 },
    ],
    color: '#080611',
    effects: [],
  },
  sakura: {
    name: 'Sakura',
    layers: [
      { speed: 0.05, depth: 0, opacity: 1.0 },
      { speed: 0.2, depth: 1, opacity: 0.7 },
      { speed: 0.4, depth: 2, opacity: 0.5 },
    ],
    color: '#1a0f1a',
    effects: ['petals', 'bloom'],
  },
  neon: {
    name: 'Neon',
    layers: [
      { speed: 0.15, depth: 0, opacity: 1.0 },
      { speed: 0.35, depth: 1, opacity: 0.9 },
      { speed: 0.55, depth: 2, opacity: 0.7 },
    ],
    color: '#0a0a1a',
    effects: ['glow', 'scanlines'],
  },
  space: {
    name: 'Space',
    layers: [
      { speed: 0.2, depth: 0, opacity: 1.0 },
      { speed: 0.4, depth: 1, opacity: 0.8 },
      { speed: 0.6, depth: 2, opacity: 0.6 },
    ],
    color: '#000000',
    effects: ['stars', 'nebula'],
  },
};

/**
 * Get background profile by name
 */
export function getBackgroundProfile(name: string): BackgroundProfile {
  return GAME_BACKGROUND_PROFILES[name] || GAME_BACKGROUND_PROFILES.default;
}

/**
 * Atmospheric effects configuration
 */
export interface AtmosphericEffect {
  type: 'fog' | 'particles' | 'lighting' | 'color-grading';
  intensity: number;
  color?: string;
  speed?: number;
}

export const ATMOSPHERIC_EFFECTS: Record<string, AtmosphericEffect[]> = {
  sakura: [
    { type: 'particles', intensity: 0.5, color: '#ffb3d9', speed: 0.3 },
    { type: 'fog', intensity: 0.2, color: '#ffb3d9' },
  ],
  neon: [
    { type: 'lighting', intensity: 0.8, color: '#ec4899' },
    { type: 'color-grading', intensity: 0.5 },
  ],
  space: [
    { type: 'particles', intensity: 0.3, color: '#ffffff', speed: 0.5 },
    { type: 'fog', intensity: 0.1, color: '#8b5cf6' },
  ],
};

/**
 * Dynamic lighting configuration
 */
export interface DynamicLight {
  x: number;
  y: number;
  radius: number;
  intensity: number;
  color: string;
  pulse?: boolean;
  pulseSpeed?: number;
}

export function createDynamicLight(
  x: number,
  y: number,
  radius: number,
  intensity: number,
  color: string,
  pulse = false,
): DynamicLight {
  return {
    x,
    y,
    radius,
    intensity,
    color,
    pulse,
    pulseSpeed: pulse ? 0.02 : undefined,
  };
}

/**
 * Update dynamic light with pulse effect
 */
export function updateDynamicLight(light: DynamicLight, time: number): DynamicLight {
  if (!light.pulse) return light;

  const pulseIntensity = 1 + Math.sin(time * (light.pulseSpeed || 0.02)) * 0.3;
  return {
    ...light,
    intensity: light.intensity * pulseIntensity,
  };
}
