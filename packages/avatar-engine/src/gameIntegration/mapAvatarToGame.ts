/**
 * Map Avatar to Game Representation
 * Determines representation mode per game
 * Note: This is a fallback mapping. The central config in app/mini-games/_shared/miniGameConfigs.ts
 * should be used instead. This is kept for backward compatibility.
 */

import type { AvatarProfile, AvatarRepresentationConfig, RepresentationMode } from '../types/avatar';
import { getRepresentationTransform } from '../renderer/representationModes';

/**
 * Default game-to-representation mapping (fallback)
 * Prefer using app/mini-games/_shared/miniGameConfigs.ts
 */
const GAME_REPRESENTATION_MAP: Record<string, RepresentationMode> = {
  'petal-samurai': 'fullBody',
  'otaku-beat-em-up': 'fullBody',
  'thigh-coliseum': 'fullBody',
  'petal-storm-rhythm': 'bust',
  'memory-match': 'portrait',
  'puzzle-reveal': 'portrait',
  'bubble-girl': 'chibi',
  'blossomware': 'chibi',
  'dungeon-of-desire': 'bust',
};

/**
 * Map avatar to game representation
 * Returns AvatarRepresentationConfig with mode, scale, camera offset, shading tweaks
 * @param mode - Representation mode (should come from central config)
 */
export function mapAvatarToGameRepresentation(
  gameId: string,
  _avatar: AvatarProfile,
  mode?: RepresentationMode,
): AvatarRepresentationConfig {
  // Use provided mode or fallback to mapping
  const representationMode = mode || GAME_REPRESENTATION_MAP[gameId] || 'fullBody';

  // Get transform config for this mode
  const transform = getRepresentationTransform(representationMode);

  return {
    mode: representationMode,
    scale: transform.scale,
    cameraOffset: transform.cameraOffset,
    shadingTweaks: transform.shadingTweaks,
  };
}

/**
 * Get representation mode for a game (fallback)
 * Prefer using app/mini-games/_shared/miniGameConfigs.ts
 */
export function getGameRepresentationMode(gameId: string): RepresentationMode {
  return GAME_REPRESENTATION_MAP[gameId] || 'fullBody';
}

