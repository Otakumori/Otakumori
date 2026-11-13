import type { EngineGame } from './types';

export type BlossomwarePlaylistVariant = 'classic' | 'short' | 'daily';

export const BLOSSOMWARE_CLASSIC_SEED = 'classic-v1';
export const BLOSSOMWARE_SHORT_ROUNDS = 5;

function hashSeed(seed: string) {
  let hash = 2166136261;

  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function createSeededRandom(seed: string) {
  let state = hashSeed(seed);

  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleWithSeed(playlist: readonly EngineGame[], seed: string) {
  const shuffled = [...playlist];
  const random = createSeededRandom(seed);

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

export function getBlossomwareDailySeed(date: Date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `daily-${year}-${month}-${day}`;
}

/**
 * Derives a reproducible run from the authored microgame registry.
 * The source registry is never mutated and every returned entry is an existing game.
 */
export function buildBlossomwarePlaylist(
  playlist: readonly EngineGame[],
  variant: BlossomwarePlaylistVariant,
  seed: string,
) {
  if (variant === 'classic') return [...playlist];

  const shuffled = shuffleWithSeed(playlist, seed);
  return variant === 'short'
    ? shuffled.slice(0, Math.min(BLOSSOMWARE_SHORT_ROUNDS, shuffled.length))
    : shuffled;
}
