'use client';

import { useState, useCallback } from 'react';
import type { AvatarConfiguration } from '@/app/lib/3d/avatar-parts';
import { avatarPartManager } from '@/app/lib/3d/avatar-parts';

export function useCharacterConfiguration(
  initialConfiguration?: AvatarConfiguration,
  onConfigurationChange?: (config: AvatarConfiguration) => void,
) {
  const [configuration, setConfiguration] = useState<AvatarConfiguration>(() => {
    if (initialConfiguration) return initialConfiguration;
    return avatarPartManager.createConfiguration('default-user', 'female');
  });

  const updateConfiguration = useCallback(
    (updates: Partial<AvatarConfiguration>) => {
      const newConfig = { ...configuration, ...updates, updatedAt: new Date() };
      setConfiguration(newConfig);
      onConfigurationChange?.(newConfig);
      return newConfig;
    },
    [configuration, onConfigurationChange],
  );

  return {
    configuration,
    setConfiguration,
    updateConfiguration,
  };
}

