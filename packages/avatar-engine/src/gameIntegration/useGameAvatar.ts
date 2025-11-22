/**
 * Game Avatar Hook
 * Resolves avatar profile and maps to game representation
 */

import { useState, useEffect } from 'react';
import type { AvatarProfile, AvatarRepresentationConfig } from '../types/avatar';
import { mapAvatarToGameRepresentation } from './mapAvatarToGame';
import { isAvatarsEnabled } from '../config/flags';
import { loadRegistry } from '../registry/loader';

export interface UseGameAvatarOptions {
  fallbackToPreset?: boolean;
  presetId?: string;
}

export interface UseGameAvatarResult {
  avatarConfig: AvatarProfile | null;
  representationConfig: AvatarRepresentationConfig;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook for game avatar integration
 * Resolves avatar profile (from user or preset)
 * Maps to game representation via mapAvatarToGameRepresentation()
 * Returns avatar config ready for <AvatarRenderer />
 */
export function useGameAvatar(
  gameId: string,
  options: UseGameAvatarOptions = {},
): UseGameAvatarResult {
  const [avatarConfig, setAvatarConfig] = useState<AvatarProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { fallbackToPreset = true, presetId } = options;

  useEffect(() => {
    let mounted = true;

    async function resolveAvatar() {
      try {
        setIsLoading(true);
        setError(null);

        // Check if avatars are enabled
        if (!isAvatarsEnabled()) {
          // Return preset avatar
          const presetProfile: AvatarProfile = {
            id: presetId || 'preset_default',
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
          };

          if (mounted) {
            setAvatarConfig(presetProfile);
            setIsLoading(false);
          }
          return;
        }

        // Try to load user avatar from storage/API
        // For now, use preset as fallback
        const userProfile: AvatarProfile | null = null; // Would load from localStorage/API

        const profile = userProfile || (fallbackToPreset ? createPresetProfile(presetId) : null);

        if (!profile) {
          throw new Error('No avatar profile available');
        }

        // Load registry to ensure it's available
        await loadRegistry();

        if (mounted) {
          setAvatarConfig(profile);
          setIsLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to resolve avatar'));
          setIsLoading(false);

          // Fallback to preset on error
          if (fallbackToPreset) {
            setAvatarConfig(createPresetProfile(presetId));
            setError(null);
          }
        }
      }
    }

    resolveAvatar();

    return () => {
      mounted = false;
    };
  }, [gameId, fallbackToPreset, presetId]);

  // Map to game representation
  const representationConfig = avatarConfig
    ? mapAvatarToGameRepresentation(gameId, avatarConfig)
    : mapAvatarToGameRepresentation(gameId, createPresetProfile());

  return {
    avatarConfig,
    representationConfig,
    isLoading,
    error,
  };
}

/**
 * Create preset avatar profile
 */
function createPresetProfile(presetId?: string): AvatarProfile {
  return {
    id: presetId || 'preset_default',
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
  };
}
