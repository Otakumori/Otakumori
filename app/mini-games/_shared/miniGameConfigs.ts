/**
 * Central Mini-Game Configuration Mapping
 * Defines representation mode and avatar usage for all mini-games
 * Used by useGameAvatar and QA validators
 */

import type { RepresentationMode } from '@om/avatar-engine/types/avatar';

export type AvatarUsage = 'avatar-or-preset' | 'preset-only';

export interface MiniGameConfig {
  representationMode: RepresentationMode;
  avatarUsage: AvatarUsage;
  // Additional metadata for future use
  difficulty?: 'easy' | 'medium' | 'hard';
  category?: 'action' | 'puzzle' | 'rhythm' | 'sandbox' | 'microgames' | 'dungeon';
}

/**
 * Central mapping of all mini-games to their configuration
 */
export const miniGameConfigs: Record<string, MiniGameConfig> = {
  'petal-samurai': {
    representationMode: 'fullBody',
    avatarUsage: 'avatar-or-preset',
    difficulty: 'medium',
    category: 'action',
  },
  'otaku-beat-em-up': {
    representationMode: 'fullBody',
    avatarUsage: 'avatar-or-preset',
    difficulty: 'medium',
    category: 'action',
  },
  'thigh-coliseum': {
    representationMode: 'fullBody',
    avatarUsage: 'avatar-or-preset',
    difficulty: 'hard',
    category: 'action',
  },
  'petal-storm-rhythm': {
    representationMode: 'bust',
    avatarUsage: 'avatar-or-preset',
    difficulty: 'medium',
    category: 'rhythm',
  },
  'memory-match': {
    representationMode: 'portrait',
    avatarUsage: 'avatar-or-preset',
    difficulty: 'easy',
    category: 'puzzle',
  },
  'puzzle-reveal': {
    representationMode: 'portrait',
    avatarUsage: 'avatar-or-preset',
    difficulty: 'medium',
    category: 'puzzle',
  },
  'bubble-girl': {
    representationMode: 'chibi',
    avatarUsage: 'avatar-or-preset',
    difficulty: 'easy',
    category: 'sandbox',
  },
  'blossomware': {
    representationMode: 'chibi',
    avatarUsage: 'avatar-or-preset',
    difficulty: 'medium',
    category: 'microgames',
  },
  'dungeon-of-desire': {
    representationMode: 'bust',
    avatarUsage: 'avatar-or-preset',
    difficulty: 'hard',
    category: 'dungeon',
  },
} as const;

/**
 * Get config for a specific game
 */
export function getMiniGameConfig(gameId: string): MiniGameConfig | null {
  return miniGameConfigs[gameId] || null;
}

/**
 * Get representation mode for a game
 */
export function getGameRepresentationMode(gameId: string): RepresentationMode {
  return miniGameConfigs[gameId]?.representationMode || 'fullBody';
}

/**
 * Get avatar usage for a game
 */
export function getGameAvatarUsage(gameId: string): AvatarUsage {
  return miniGameConfigs[gameId]?.avatarUsage || 'preset-only';
}

/**
 * Check if a game uses avatar engine
 */
export function gameUsesAvatar(gameId: string): boolean {
  return getGameAvatarUsage(gameId) === 'avatar-or-preset';
}

/**
 * Get all game IDs
 */
export function getAllGameIds(): string[] {
  return Object.keys(miniGameConfigs);
}

