/**
 * Wrapper hook for useGameAvatar that uses central miniGameConfigs
 * This ensures all games use the central config mapping
 * Supports guest avatar loading from localStorage
 */

import { logger } from '@/app/lib/logger';
import { useState, useEffect } from 'react';
import {
  useGameAvatar as useAvatarEngineAvatar,
  type UseGameAvatarOptions,
  type UseGameAvatarResult,
} from '@om/avatar-engine/gameIntegration';
import { getGameRepresentationMode, getGameAvatarUsage } from './miniGameConfigs';
import { mapAvatarToGameRepresentation } from '@om/avatar-engine/gameIntegration/mapAvatarToGame';
import type { AvatarProfile } from '@om/avatar-engine/types/avatar';
import { isAvatarsEnabled } from '@om/avatar-engine/config/flags';
import { avatarConfigToProfile, normalizeAvatarConfiguration } from './characterConverter';
import type { AvatarConfiguration } from '@/app/lib/3d/avatar-parts';
import { useGameAvatar as useActiveGameAvatar } from '@/app/lib/avatar/useGameAvatar';
import { toGameAvatarProfile } from './game-avatar-bridge';

const GUEST_AVATAR_KEY = 'otm-guest-avatar';

/**
 * Load guest avatar from localStorage
 */
export function loadGuestAvatar(): AvatarProfile | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(GUEST_AVATAR_KEY);
    if (stored) {
      return JSON.parse(stored) as AvatarProfile;
    }
  } catch (error) {
    logger.warn('Failed to load guest avatar from localStorage:', undefined, { error: error instanceof Error ? error : new Error(String(error)) });
  }

  return null;
}

export interface UseGameAvatarWithConfigOptions extends UseGameAvatarOptions {
  /**
   * Force use preset (when user chooses "Play with preset")
   */
  forcePreset?: boolean;
  /**
   * Avatar profile to use (when user chooses "Play with avatar")
   */
  avatarProfile?: AvatarProfile | null;
  /**
   * Avatar configuration to use (converted to profile internally)
   */
  avatarConfiguration?: AvatarConfiguration | null;
}

/**
 * Wrapper hook that uses central config for representation mode
 * Supports guest avatar loading from localStorage
 */
export function useGameAvatar(
  gameId: string,
  options: UseGameAvatarWithConfigOptions = {},
): UseGameAvatarResult {
  const [guestAvatar, setGuestAvatar] = useState<AvatarProfile | null>(null);
  const [loadedGuestAvatar, setLoadedGuestAvatar] = useState(false);

  const { forcePreset = false, avatarProfile, avatarConfiguration, ...restOptions } = options;

  // Get representation mode from central config
  const representationMode = getGameRepresentationMode(gameId);
  const avatarsEnabled = isAvatarsEnabled();

  // Load guest avatar from localStorage if avatars enabled and not forcing preset
  useEffect(() => {
    if (
      avatarsEnabled &&
      !forcePreset &&
      !avatarProfile &&
      !avatarConfiguration &&
      typeof window !== 'undefined'
    ) {
      const loaded = loadGuestAvatar();
      setGuestAvatar(loaded);
      setLoadedGuestAvatar(true);
    } else {
      setLoadedGuestAvatar(true);
    }
  }, [avatarsEnabled, forcePreset, avatarProfile, avatarConfiguration]);

  // Use the avatar-engine hook
  const result = useAvatarEngineAvatar(gameId, restOptions);
  const activeAvatar = useActiveGameAvatar();
  const activeAvatarProfile = toGameAvatarProfile(activeAvatar);
  const shouldResolveActiveAvatar =
    avatarsEnabled && !forcePreset && !avatarProfile && !avatarConfiguration && !guestAvatar;

  // Determine which avatar to use
  let finalAvatar: AvatarProfile | null = null;

  if (forcePreset) {
    // User chose preset, use preset
    finalAvatar = result.avatarConfig; // Will be preset from engine
  } else if (avatarConfiguration) {
    // Convert AvatarConfiguration to AvatarProfile
    const normalized = normalizeAvatarConfiguration(avatarConfiguration, 'guest');
    finalAvatar = avatarConfigToProfile(normalized);
  } else if (avatarProfile) {
    // User provided avatar profile
    finalAvatar = avatarProfile;
  } else if (avatarsEnabled && guestAvatar) {
    // Use guest avatar from localStorage
    finalAvatar = guestAvatar;
  } else if (avatarsEnabled && activeAvatarProfile) {
    // Use the authenticated user's canonical, read-only game avatar.
    finalAvatar = activeAvatarProfile;
  } else {
    // Fallback to engine result (preset)
    finalAvatar = result.avatarConfig;
  }

  // Override representation config to use central config mode
  const representationConfig = finalAvatar
    ? mapAvatarToGameRepresentation(gameId, finalAvatar, representationMode)
    : mapAvatarToGameRepresentation(
        gameId,
        {
          id: 'preset_default',
          head: 'head_default',
          torso: 'torso_default',
          legs: 'legs_default',
          colorPalette: {
            skin: '#ffdbac',
            hair: '#3d2817',
            eyes: '#4a5568',
            outfit: '#666666',
            accent: '#ff69b4',
          },
        },
        representationMode,
      );

  return {
    avatarConfig: finalAvatar,
    representationConfig,
    isLoading:
      result.isLoading ||
      !loadedGuestAvatar ||
      (shouldResolveActiveAvatar && !activeAvatar.ready),
    error: result.error || (shouldResolveActiveAvatar ? activeAvatar.error : null),
  };
}

/**
 * Get avatar usage for a game
 */
export function getAvatarUsage(gameId: string) {
  return getGameAvatarUsage(gameId);
}
