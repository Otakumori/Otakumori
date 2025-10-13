/**
 * Seasonal Petal Physics
 * Calendar-based seasonal variations for petal physics
 */

import { PetalPhysicsEngine, type PhysicsPetal, type WindField } from './petal-physics';

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export interface SeasonalConfig {
  gravity: number;
  windStrength: number;
  turbulence: number;
  colorPalette: string[];
  particleDensity: number;
  dragCoefficient: number;
  bounce: number;
}

export const SEASONAL_CONFIGS: Record<Season, SeasonalConfig> = {
  spring: {
    gravity: 0.15, // Light, floating like cherry blossoms
    windStrength: 0.3,
    turbulence: 0.5,
    colorPalette: ['#FFB7C5', '#FFC0CB', '#FF69B4', '#FFE4E1'],
    particleDensity: 1.2,
    dragCoefficient: 0.98,
    bounce: 0.3,
  },
  summer: {
    gravity: 0.25, // Medium weight
    windStrength: 0.5,
    turbulence: 0.7,
    colorPalette: ['#FFD700', '#FFA500', '#FF8C00', '#FFDAB9'],
    particleDensity: 0.8,
    dragCoefficient: 0.96,
    bounce: 0.2,
  },
  autumn: {
    gravity: 0.35, // Heavier, like falling leaves
    windStrength: 0.7,
    turbulence: 0.9,
    colorPalette: ['#CD5C5C', '#D2691E', '#8B4513', '#A0522D'],
    particleDensity: 1.5,
    dragCoefficient: 0.94,
    bounce: 0.4,
  },
  winter: {
    gravity: 0.05, // Very light, like snowflakes
    windStrength: 0.2,
    turbulence: 0.3,
    colorPalette: ['#FFFFFF', '#E0FFFF', '#F0F8FF', '#B0E0E6'],
    particleDensity: 2.0,
    dragCoefficient: 0.99,
    bounce: 0.1,
  },
};

/**
 * Get current season based on calendar date
 */
export function getCurrentSeason(): Season {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring'; // Mar-May
  if (month >= 5 && month <= 7) return 'summer'; // Jun-Aug
  if (month >= 8 && month <= 10) return 'autumn'; // Sep-Nov
  return 'winter'; // Dec-Feb
}

/**
 * Get season name for display
 */
export function getSeasonName(season: Season): string {
  const names: Record<Season, string> = {
    spring: 'Spring Blossoms',
    summer: 'Summer Breeze',
    autumn: 'Autumn Leaves',
    winter: 'Winter Snowfall',
  };
  return names[season];
}

/**
 * Get seasonal wind pattern
 */
export function getSeasonalWindPattern(season: Season, time: number): WindField {
  const config = SEASONAL_CONFIGS[season];
  
  // Different wind patterns per season
  const patterns: Record<Season, WindField> = {
    spring: {
      strength: config.windStrength,
      direction: {
        x: Math.sin(time * 0.0005) * 0.5,
        y: Math.cos(time * 0.0003) * 0.3,
      },
      turbulence: config.turbulence,
      gustiness: 0.4,
      noiseOffset: time * 0.0002,
    },
    summer: {
      strength: config.windStrength,
      direction: {
        x: Math.sin(time * 0.001) * 0.7,
        y: Math.cos(time * 0.0008) * 0.4,
      },
      turbulence: config.turbulence,
      gustiness: 0.6,
      noiseOffset: time * 0.0003,
    },
    autumn: {
      strength: config.windStrength,
      direction: {
        x: Math.sin(time * 0.0015) * 0.9,
        y: Math.cos(time * 0.001) * 0.5,
      },
      turbulence: config.turbulence,
      gustiness: 0.8,
      noiseOffset: time * 0.0004,
    },
    winter: {
      strength: config.windStrength,
      direction: {
        x: Math.sin(time * 0.0003) * 0.3,
        y: Math.cos(time * 0.0002) * 0.2,
      },
      turbulence: config.turbulence,
      gustiness: 0.2,
      noiseOffset: time * 0.0001,
    },
  };
  
  return patterns[season];
}

/**
 * Create seasonal petal with appropriate properties
 */
export function createSeasonalPetal(
  id: string,
  x: number,
  y: number,
  season: Season = getCurrentSeason(),
): PhysicsPetal {
  const config = SEASONAL_CONFIGS[season];
  const color = config.colorPalette[Math.floor(Math.random() * config.colorPalette.length)];
  
  return {
    id,
    position: { x, y },
    velocity: { x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2 },
    acceleration: { x: 0, y: config.gravity },
    rotation: Math.random() * 360,
    angularVelocity: (Math.random() - 0.5) * 2,
    scale: Math.random() * 0.5 + 0.5,
    mass: 1 / config.particleDensity,
    drag: config.dragCoefficient,
    bounce: config.bounce,
    lifetime: 10000 + Math.random() * 5000,
    age: 0,
    color,
    trail: [],
    isColliding: false,
    energy: 1,
  };
}

/**
 * Seasonal Petal Physics Engine Wrapper
 */
export class SeasonalPetalPhysicsEngine extends PetalPhysicsEngine {
  private currentSeason: Season;
  private seasonalConfig: SeasonalConfig;

  constructor(season: Season = getCurrentSeason(), bounds: { width: number; height: number } = { width: 1920, height: 1080 }, maxPetals: number = 100) {
    super(bounds, maxPetals);
    this.currentSeason = season;
    this.seasonalConfig = SEASONAL_CONFIGS[season];
  }

  /**
   * Update current season
   */
  setSeason(season: Season) {
    this.currentSeason = season;
    this.seasonalConfig = SEASONAL_CONFIGS[season];
    
    // Update existing petals with new seasonal properties
    const petals = this.getPetals();
    petals.forEach((petal) => {
      petal.acceleration.y = this.seasonalConfig.gravity;
      petal.drag = this.seasonalConfig.dragCoefficient;
      petal.bounce = this.seasonalConfig.bounce;
      petal.color = this.seasonalConfig.colorPalette[
        Math.floor(Math.random() * this.seasonalConfig.colorPalette.length)
      ];
    });
  }

  /**
   * Get current season
   */
  getSeason(): Season {
    return this.currentSeason;
  }

  /**
   * Get seasonal configuration
   */
  getSeasonalConfig(): SeasonalConfig {
    return this.seasonalConfig;
  }

  /**
   * Spawn seasonal petal
   */
  spawnSeasonalPetal(x: number, y: number): void {
    this.spawnPetal(x, y);
  }

  /**
   * Update with seasonal wind patterns
   */
  updateSeasonalWind(time: number) {
    const windField = getSeasonalWindPattern(this.currentSeason, time);
    this.setWind(
      windField.strength, 
      windField.direction, 
      windField.turbulence
    );
  }
}

