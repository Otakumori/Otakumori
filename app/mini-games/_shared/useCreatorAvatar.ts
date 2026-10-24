/**
 * Hook for loading CREATOR avatars in games
 * Provides option to use CREATOR-made avatars vs preset characters
 */

import { logger } from '@/app/lib/logger';
import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import type { CreatorAvatarConfig } from '@/app/lib/creator/types';
import type { AvatarConfiguration } from '@/app/lib/3d/avatar-parts';
import {
  creatorConfigToAvatarConfiguration,
  normalizeAvatarReadResponse,
} from '@/app/lib/avatar/canonical';

export interface UseCreatorAvatarResult {
  creatorAvatar: CreatorAvatarConfig | null;
  avatarConfig: AvatarConfiguration | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Load CREATOR avatar configuration
 */
async function loadCreatorAvatar(): Promise<CreatorAvatarConfig | null> {
  try {
    const response = await fetch('/api/v1/creator/load');
    const result = await response.json();

    if (result.ok) return normalizeAvatarReadResponse(result).config;

    return null;
  } catch (error) {
    logger.error('Failed to load CREATOR avatar:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    return null;
  }
}

/**
 * Hook to load CREATOR avatar for use in games
 */
export function useCreatorAvatar(enabled: boolean = true): UseCreatorAvatarResult {
  const { user, isLoaded } = useUser();
  const [error, setError] = useState<Error | null>(null);

  const {
    data: creatorAvatar,
    isLoading,
    refetch,
    error: queryError,
  } = useQuery({
    queryKey: ['creator-avatar', user?.id],
    queryFn: loadCreatorAvatar,
    enabled: enabled && isLoaded && !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  // Update error state when query error changes
  if (queryError && error !== queryError) {
    setError(queryError instanceof Error ? queryError : new Error(String(queryError)));
  }

  const avatarConfig = creatorAvatar ? creatorConfigToAvatarConfiguration(creatorAvatar) : null;

  return {
    creatorAvatar: creatorAvatar ?? null,
    avatarConfig,
    isLoading,
    error,
    refetch: () => {
      refetch();
    },
  };
}
