'use client';

import { useQuery } from '@tanstack/react-query';
import { useUser } from '@clerk/nextjs';
import { AvatarConfig, DEFAULT_AVATAR_CONFIG, filterNSFWParts } from './schema';

/**
 * Avatar data returned by useGameAvatar hook
 */
export interface GameAvatarData {
  config: AvatarConfig;
  model3dUrl: string | null;
  spritesheetUrl: string | null;
  version: number;
}

/**
 * Result of useGameAvatar hook
 */
export interface UseGameAvatarResult {
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
          config: DEFAULT_AVATAR_CONFIG,
          model3dUrl: null,
          spritesheetUrl: null,
          version: 1,
        };
      }

      try {
        const response = await fetch('/api/v1/avatar/load', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          // If load fails, return default avatar
          console.warn('Failed to load avatar, using default:', response.statusText);
          return {
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
            config: DEFAULT_AVATAR_CONFIG,
            model3dUrl: null,
            spritesheetUrl: null,
            version: 1,
          };
        }

        // Return the loaded avatar data
        return {
          config: result.data.config,
          model3dUrl: result.data.model3dUrl,
          spritesheetUrl: result.data.spritesheetUrl,
          version: result.data.version || 1,
        };
      } catch (err) {
        // On any error, return default avatar
        console.error('Error loading avatar:', err);
        return {
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
  const model3dUrl = data?.model3dUrl || null;
  const spritesheetUrl = data?.spritesheetUrl || null;
  const version = data?.version || 1;

  // Ensure NSFW parts are filtered if NSFW is disabled
  const filteredConfig = config.nsfwEnabled ? config : filterNSFWParts(config);

  return {
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

