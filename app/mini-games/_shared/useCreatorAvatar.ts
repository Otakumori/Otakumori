/**
 * Hook for loading CREATOR avatars in games
 * Provides option to use CREATOR-made avatars vs preset characters
 */

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import type { CreatorAvatarConfig } from '@/app/lib/creator/types';
import type { AvatarConfiguration } from '@/app/lib/3d/avatar-parts';

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

    if (result.ok && result.data) {
      return result.data as CreatorAvatarConfig;
    }

    return null;
  } catch (error) {
    console.error('Failed to load CREATOR avatar:', error);
    return null;
  }
}

/**
 * Convert CreatorAvatarConfig to AvatarConfiguration
 */
function convertCreatorToAvatarConfig(creatorConfig: CreatorAvatarConfig): AvatarConfiguration {
  return {
    id: creatorConfig.id,
    userId: creatorConfig.userId,
    baseModel: creatorConfig.baseModel,
    baseModelUrl: creatorConfig.baseModelUrl,
    parts: Object.entries(creatorConfig.parts).reduce((acc, [key, value]) => {
      if (value) {
        const partType = key.toLowerCase() as any;
        acc[partType] = value;
      }
      return acc;
    }, {} as Partial<Record<string, string>>),
    morphTargets: {
      // Body morphs
      height: creatorConfig.body.height,
      weight: creatorConfig.body.weight,
      muscleMass: creatorConfig.body.muscleMass,
      bodyFat: creatorConfig.body.bodyFat,
      shoulderWidth: creatorConfig.body.shoulderWidth,
      chestSize: creatorConfig.body.chestSize,
      waistSize: creatorConfig.body.waistSize,
      hipWidth: creatorConfig.body.hipWidth,
      armLength: creatorConfig.body.armLength,
      legLength: creatorConfig.body.legLength,
      thighSize: creatorConfig.body.thighSize,
      calfSize: creatorConfig.body.calfSize,
      headSize: creatorConfig.body.headSize,
      neckLength: creatorConfig.body.neckLength,
      // Face morphs
      faceShape: creatorConfig.face.faceShape,
      jawline: creatorConfig.face.jawline,
      cheekbones: creatorConfig.face.cheekbones,
      chinShape: creatorConfig.face.chinShape,
      eyeSize: creatorConfig.face.eyeSize,
      eyeSpacing: creatorConfig.face.eyeSpacing,
      eyeHeight: creatorConfig.face.eyeHeight,
      eyeAngle: creatorConfig.face.eyeAngle,
      eyelidShape: creatorConfig.face.eyelidShape,
      eyebrowThickness: creatorConfig.face.eyebrowThickness,
      eyebrowAngle: creatorConfig.face.eyebrowAngle,
      noseSize: creatorConfig.face.noseSize,
      noseWidth: creatorConfig.face.noseWidth,
      noseHeight: creatorConfig.face.noseHeight,
      bridgeWidth: creatorConfig.face.bridgeWidth,
      nostrilSize: creatorConfig.face.nostrilSize,
      noseTip: creatorConfig.face.noseTip,
      mouthSize: creatorConfig.face.mouthSize,
      mouthWidth: creatorConfig.face.mouthWidth,
      lipThickness: creatorConfig.face.lipThickness,
      lipShape: creatorConfig.face.lipShape,
      cupidBow: creatorConfig.face.cupidBow,
      mouthAngle: creatorConfig.face.mouthAngle,
    },
    materialOverrides: {
      skin: {
        slot: 'skin',
        type: 'color',
        value: creatorConfig.skin.tone,
        opacity: 1.0,
        roughness: 1.0 - creatorConfig.skin.glossiness,
      },
      hair: {
        slot: 'hair',
        type: 'color',
        value: creatorConfig.hair.color.primary,
        opacity: 1.0,
      },
    },
    contentRating: creatorConfig.nsfw?.enabled ? 'nsfw' : 'sfw',
    showNsfwContent: creatorConfig.nsfw?.enabled ?? false,
    ageVerified: creatorConfig.nsfw?.enabled ?? false,
    defaultAnimation: 'idle',
    idleAnimations: ['idle', 'idle_2', 'idle_3'],
    allowExport: true,
    exportFormat: 'glb',
    createdAt: new Date(creatorConfig.createdAt),
    updatedAt: new Date(creatorConfig.updatedAt),
  };
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
  } = useQuery({
    queryKey: ['creator-avatar', user?.id],
    queryFn: loadCreatorAvatar,
    enabled: enabled && isLoaded && !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  const avatarConfig = creatorAvatar ? convertCreatorToAvatarConfig(creatorAvatar) : null;

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

