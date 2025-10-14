/**
 * Petal System Constants
 * Physics values, spawn rates, and configuration
 */

// Physics constants
export const PHYSICS = {
  GRAVITY: 0.15,
  WIND_STRENGTH: 0.5,
  AIR_RESISTANCE: 0.99,
  ROTATION_SPEED_MIN: 1,
  ROTATION_SPEED_MAX: 3,
} as const;

// Spawn configuration
export const SPAWN = {
  MAX_PETALS: 30,
  MIN_PETALS: 20,
  SPAWN_INTERVAL: 800, // ms between spawns (more frequent)
  RARE_CHANCE: 0.2, // 20% chance for gold petal
} as const;

// Petal values
export const PETAL_VALUES = {
  COMMON: 1,
  RARE: 5,
} as const;

// Colors
export const COLORS = {
  RARE: '#FFD700', // Gold
  RARE_GLOW: 'rgba(255, 215, 0, 0.6)',
} as const;

// Animation timings (ms)
export const ANIMATION = {
  COLLECTION_TOTAL: 600,
  BOUNCE_DURATION: 200,
  SPIN_DURATION: 400,
  FADE_DURATION: 200,
  ACHIEVEMENT_SLIDE_IN: 250,
  ACHIEVEMENT_HOLD: 2500,
  ACHIEVEMENT_SLIDE_OUT: 250,
  COUNTER_FADE_IN: 500,
  COUNTER_PULSE: 300,
  COUNTER_EXPAND: 200,
} as const;

// UI positioning
export const UI = {
  COUNTER_BOTTOM_RIGHT_MARGIN: 20,
  ACHIEVEMENT_TOP_RIGHT_MARGIN: 20,
  SPARKLE_COUNT: 8,
} as const;

// Collection settings
export const COLLECTION = {
  DEBOUNCE_MS: 1000,
  BATCH_SIZE: 10,
} as const;
