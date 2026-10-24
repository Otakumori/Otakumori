'use client';

import { useQuery } from '@tanstack/react-query';
import { useUser } from '@clerk/nextjs';
import { DEFAULT_AVATAR_CONFIG, filterNSFWParts } from './schema';
import type { AvatarConfig } from './schema';
import {
  CANONICAL_AVATAR_READ_API,
  normalizeAvatarReadResponse,
} from './canonical';
import type { CreatorAvatarConfig } from '@/app/lib/creator/types';

function toGameAvatarConfig(config: CreatorAvatarConfig): AvatarConfig {
  return {
    body: {
      type: config.baseAssetId ?? config.baseModel,
      height: config.body.height,
      weight: config.body.weight,
      proportions: {
        headSize: config.body.headSize,
        shoulderWidth: config.body.shoulderWidth,
        chestSize: config.body.chestSize,
        waistSize: config.body.waistSize,
        hipWidth: config.body.hipWidth,
      },
    },
    hair: {
      style: config.hair.style,
      length: config.hair.length,
      color: {
        primary: config.hair.color.primary,
        secondary: config.hair.color.secondary,
      },
    },
    outfit: {
      type: config.parts.OuterWear ?? config.parts.InnerWear ?? 'casual',
      color: { primary: config.materials.parameters.colorA },
    },
    accessories: Object.values(config.parts).filter((value): value is string => !!value),
    colors: {
      skin: config.skin.tone,
      hair: config.hair.color.primary,
      eyes: config.face.eyeColor,
      outfit: config.materials.parameters.colorA,
      accent: config.materials.parameters.colorB,
    },
    nsfwEnabled: false,
    version: Number.parseInt(config.version, 10) || 1,
  };
}

/**
 * Avatar data returned by useGameAvatar hook
 */
export interface GameAvatarData {
  avatarId: string | null;
  displayName: string | null;
  config: AvatarConfig;
  model3dUrl: string | null;
  spritesheetUrl: string | null;
  version: number;
}

/**
 * Result of useGameAvatar hook
 */
export interface UseGameAvatarResult {
  avatarId: string | null;
  displayName: string | null;
  config: AvatarConfig;
  model3dUrl: string | null;
  spritesheetUrl: string | null;
  version: number;
  ready: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * useGameAvatar - Canonical avatar hook for games
 * 
 * Loads the user's avatar configuration and returns:
 * - config: The avatar configuration (body, hair, outfit, accessories, colors, nsfwEnabled, version)
 * - model3dUrl: Optimized GLB path for 3D rendering (null if not available)
 * - spritesheetUrl: Generated/cached spritesheet URL for 2D rendering (null if not available)
 * - ready: Whether the avatar is loaded and ready to use
 * - error: Any error that occurred during loading
 * 
 * Automatically falls back to default avatar if:
 * - User is not authenticated
 * - Avatar config doesn't exist
 * - Loading fails
 * 
 * NSFW enforcement: If nsfwEnabled is false, NSFW parts are automatically filtered.
 * 
 * @example
 * ```tsx
 * const { config, model3dUrl, spritesheetUrl, ready, error } = useGameAvatar();
 * 
 * if (!ready) {
 *   return <LoadingSpinner />;
 * }
 * 
 * if (error) {
 *   return <ErrorFallback />;
 * }
 * 
 * // Use config, model3dUrl, or spritesheetUrl in your game
 * ```
 */
export function useGameAvatar(): UseGameAvatarResult {
  const { user, isLoaded } = useUser();

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<GameAvatarData>({
    queryKey: ['game-avatar', user?.id],
    queryFn: async (): Promise<GameAvatarData> => {
      // If user is not authenticated, return default avatar
      if (!user?.id || !isLoaded) {
        return {
          avatarId: null,
          displayName: null,
          config: DEFAULT_AVATAR_CONFIG,
          model3dUrl: null,
          spritesheetUrl: null,
          version: 1,
        };
      }

      try {
        const response = await fetch(CANONICAL_AVATAR_READ_API, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          // If load fails, return default avatar
          console.warn('Failed to load avatar, using default:', response.statusText);
          return {
            avatarId: null,
            displayName: user.fullName || user.username || null,
            config: DEFAULT_AVATAR_CONFIG,
            model3dUrl: null,
            spritesheetUrl: null,
            version: 1,
          };
        }

        const result = await response.json();

        if (!result.ok) {
          // If API returns error, return default avatar
          console.warn('Avatar load returned error, using default:', result.error);
          return {
            avatarId: null,
            displayName: user.fullName || user.username || null,
            config: DEFAULT_AVATAR_CONFIG,
            model3dUrl: null,
            spritesheetUrl: null,
            version: 1,
          };
        }

        const avatar = normalizeAvatarReadResponse(result);
        if (!avatar.config) {
          return {
            avatarId: null,
            displayName: user.fullName || user.username || null,
            config: DEFAULT_AVATAR_CONFIG,
            model3dUrl: null,
            spritesheetUrl: null,
            version: 1,
          };
        }

        return {
          avatarId: avatar.avatarId,
          displayName: user.fullName ?? user.username ?? null,
          config: toGameAvatarConfig(avatar.config),
          model3dUrl: avatar.model3dUrl,
          spritesheetUrl: avatar.spritesheetUrl,
          version: Number.parseInt(avatar.config.version, 10) || 1,
        };
      } catch (err) {
        // On any error, return default avatar
        console.error('Error loading avatar:', err);
        return {
          avatarId: null,
          displayName: user.fullName || user.username || null,
          config: DEFAULT_AVATAR_CONFIG,
          model3dUrl: null,
          spritesheetUrl: null,
          version: 1,
        };
      }
    },
    enabled: isLoaded, // Only fetch when Clerk is loaded
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    retry: 1, // Retry once on failure
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });

  // Always return a valid config (default if loading/error)
  const config = data?.config || DEFAULT_AVATAR_CONFIG;
  const avatarId = data?.avatarId || null;
  const displayName = data?.displayName || null;
  const model3dUrl = data?.model3dUrl || null;
  const spritesheetUrl = data?.spritesheetUrl || null;
  const version = data?.version || 1;

  // Ensure NSFW parts are filtered if NSFW is disabled
  const filteredConfig = config.nsfwEnabled ? config : filterNSFWParts(config);

  return {
    avatarId,
    displayName,
    config: filteredConfig,
    model3dUrl,
    spritesheetUrl,
    version,
    ready: !isLoading && isLoaded,
    error: error instanceof Error ? error : null,
    refetch: () => {
      refetch();
    },
  };
}

