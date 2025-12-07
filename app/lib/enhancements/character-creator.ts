/**
 * Character Creator Enhancement Utilities
 *
 * Utilities for premium character creator interface
 */

export interface CameraPreset {
  name: string;
  position: [number, number, number];
  target: [number, number, number];
  fov?: number;
}

export const CAMERA_PRESETS: CameraPreset[] = [
  {
    name: 'front',
    position: [0, 0, 5],
    target: [0, 0, 0],
    fov: 50,
  },
  {
    name: 'side',
    position: [5, 0, 0],
    target: [0, 0, 0],
    fov: 50,
  },
  {
    name: 'back',
    position: [0, 0, -5],
    target: [0, 0, 0],
    fov: 50,
  },
  {
    name: 'top',
    position: [0, 5, 0],
    target: [0, 0, 0],
    fov: 50,
  },
  {
    name: 'close-up',
    position: [0, 0, 2],
    target: [0, 0, 0],
    fov: 60,
  },
];

export interface LightingConfig {
  ambient: {
    color: string;
    intensity: number;
  };
  directional: {
    color: string;
    intensity: number;
    position: [number, number, number];
  };
  point: {
    color: string;
    intensity: number;
    position: [number, number, number];
    distance: number;
  }[];
}

export const PREMIUM_LIGHTING: LightingConfig = {
  ambient: {
    color: '#ffffff',
    intensity: 0.4,
  },
  directional: {
    color: '#ffffff',
    intensity: 0.8,
    position: [5, 5, 5],
  },
  point: [
    {
      color: '#ec4899',
      intensity: 0.5,
      position: [-3, 2, 3],
      distance: 10,
    },
    {
      color: '#8b5cf6',
      intensity: 0.5,
      position: [3, 2, -3],
      distance: 10,
    },
  ],
};

export interface PostProcessingConfig {
  bloom: {
    enabled: boolean;
    intensity: number;
    threshold: number;
  };
  ssao: {
    enabled: boolean;
    radius: number;
    intensity: number;
  };
  vignette: {
    enabled: boolean;
    offset: number;
    darkness: number;
  };
}

export const POST_PROCESSING: PostProcessingConfig = {
  bloom: {
    enabled: true,
    intensity: 0.5,
    threshold: 0.8,
  },
  ssao: {
    enabled: true,
    radius: 0.5,
    intensity: 1.0,
  },
  vignette: {
    enabled: true,
    offset: 0.5,
    darkness: 0.3,
  },
};

/**
 * Get camera preset by name
 */
export function getCameraPreset(name: string): CameraPreset | undefined {
  return CAMERA_PRESETS.find((preset) => preset.name === name);
}

/**
 * Quality settings for adaptive rendering
 */
export interface QualitySettings {
  resolution: number; // 0-1, multiplier for render resolution
  shadows: boolean;
  postProcessing: boolean;
  antialiasing: boolean;
  textureQuality: 'low' | 'medium' | 'high';

export const QUALITY_PRESETS: Record<'low' | 'medium' | 'high' | 'ultra', QualitySettings> = {
  low: {
    resolution: 0.5,
    shadows: false,
    postProcessing: false,
    antialiasing: false,
    textureQuality: 'low',
  },
  medium: {
    resolution: 0.75,
    shadows: true,
    postProcessing: false,
    antialiasing: true,
    textureQuality: 'medium',
  },
  high: {
    resolution: 1.0,
    shadows: true,
    postProcessing: true,
    antialiasing: true,
    textureQuality: 'high',
  },
  ultra: {
    resolution: 1.0,
    shadows: true,
    postProcessing: true,
    antialiasing: true,
    textureQuality: 'high',
  },
};
