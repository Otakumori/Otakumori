/**
 * Central Mini-Game Configuration Mapping
 * Defines representation mode and avatar usage for all mini-games
 * Used by useGameAvatar and QA validators
 *
 * Representation Mode Mapping:
 *
 * - fullBody: Complete avatar display
 *   - Games: petal-samurai, otaku-beat-em-up, thigh-coliseum
 *   - Use when avatar is central to gameplay
 *   - petal-samurai: Conditional display (hide if low quality, focus on VFX)
 *
 * - bust: Waist-up view, emphasizes face/hair/torso
 *   - Games: petal-storm-rhythm, dungeon-of-desire
 *   - Good for rhythm games and character-focused experiences
 *
 * - portrait: Head/shoulder frame, simplified UI integration
 *   - Games: memory-match, puzzle-reveal
 *   - Used when avatar is decorative, not gameplay-critical
 *
 * - chibi: Proportional remap with larger head, stylized
 *   - Games: bubble-girl, blossomware
 *   - Good for casual/sandbox games
 */

import type { RepresentationMode, AvatarProfile } from '@om/avatar-engine/types/avatar';

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
  blossomware: {
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

/**
 * Check if avatar should be displayed conditionally
 * Some games (like petal-samurai) may hide avatar if quality is low
 * to focus on game VFX instead
 */
export function shouldDisplayAvatarConditionally(
  gameId: string,
  avatarProfile: AvatarProfile | null,
): boolean {
  // Only petal-samurai uses conditional display
  if (gameId !== 'petal-samurai') {
    return true; // Always show for other games
  }

  if (!avatarProfile) {
    return false; // No avatar to display
  }

  // Check avatar quality indicators
  // Low quality indicators:
  // - Missing color palette
  // - Default/preset IDs suggest low customization
  // - Missing morph weights (procedural avatars should have these)

  const hasValidPalette = Boolean(
    avatarProfile.colorPalette &&
      avatarProfile.colorPalette.skin &&
      avatarProfile.colorPalette.hair &&
      avatarProfile.colorPalette.eyes,
  );

  // For petal-samurai: only show if avatar has valid palette
  // In practice, we can be more lenient - show if palette exists
  return hasValidPalette;
}

/**
 * Check if avatar quality is sufficient for display
 * Returns true if avatar should be shown, false if it should be hidden
 */
export function isAvatarQualitySufficient(
  gameId: string,
  avatarProfile: AvatarProfile | null,
): boolean {
  if (!avatarProfile) {
    return false;
  }

  // For games with conditional display, check quality
  if (gameId === 'petal-samurai') {
    return shouldDisplayAvatarConditionally(gameId, avatarProfile);
  }

  // For other games, always show if avatar exists
  return true;
}
