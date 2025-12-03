'use client';

import { logger } from '@/app/lib/logger';
import { useAuth, useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';

export interface AvatarBundle {
  id: string;
  name: string;
  style: 'sprite' | 'ragdoll' | 'toon' | 'shader';
  texture: string;
  adultContent: boolean;
  enabled: boolean;
}

export interface AvatarSettings {
  integrationEnabled: boolean;
  preferredStyle: 'sprite' | 'ragdoll' | 'toon' | 'shader';
  showAdultContent: boolean;
}

const defaultAvatarBundle: AvatarBundle = {
  id: 'default',
  name: 'Default Avatar',
  style: 'sprite',
  texture: '/avatars/default/sprite.png',
  adultContent: false,
  enabled: true,
};

export function useAvatarBundle() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const [avatarBundle, setAvatarBundle] = useState<AvatarBundle>(defaultAvatarBundle);
  const [settings, setSettings] = useState<AvatarSettings>({
    integrationEnabled: false,
    preferredStyle: 'sprite',
    showAdultContent: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;

    const loadAvatarSettings = async () => {
      try {
        if (isSignedIn && user) {
          // Check if user has avatar integration enabled
          const integrationEnabled =
            (user.publicMetadata?.avatarIntegrationEnabled as boolean) || false;
          const preferredStyle =
            (user.publicMetadata?.preferredAvatarStyle as AvatarSettings['preferredStyle']) ||
            'sprite';
          const showAdultContent = (user.publicMetadata?.ageVerified as boolean) || false;

          setSettings({
            integrationEnabled,
            preferredStyle,
            showAdultContent,
          });

          // Load user's active avatar bundle
          if (integrationEnabled) {
            const activeAvatarId = user.publicMetadata?.activeAvatarId as string;
            if (activeAvatarId) {
              await loadAvatarBundle(activeAvatarId);
            } else {
              setAvatarBundle(defaultAvatarBundle);
            }
          } else {
            setAvatarBundle(defaultAvatarBundle);
          }
        } else {
          setSettings({
            integrationEnabled: false,
            preferredStyle: 'sprite',
            showAdultContent: false,
          });
          setAvatarBundle(defaultAvatarBundle);
        }
      } catch (error) {
        logger.error('Failed to load avatar settings:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
        setAvatarBundle(defaultAvatarBundle);
      } finally {
        setLoading(false);
      }
    };

    loadAvatarSettings();
  }, [isSignedIn, user, isLoaded]);

  const loadAvatarBundle = async (avatarId: string): Promise<AvatarBundle | null> => {
    try {
      const response = await fetch(`/api/v1/avatars/${avatarId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.ok) {
          const bundle = data.data;
          setAvatarBundle(bundle);
          return bundle;
        }
      }
    } catch (error) {
      logger.error('Failed to load avatar bundle:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    }
    return null;
  };

  const updateAvatarSettings = async (newSettings: Partial<AvatarSettings>) => {
    try {
      if (!isSignedIn || !user) return false;

      const response = await fetch('/api/v1/avatars/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSettings),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.ok) {
          setSettings((prev) => ({ ...prev, ...newSettings }));
          return true;
        }
      }
    } catch (error) {
      logger.error('Failed to update avatar settings:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    }
    return false;
  };

  const enableAvatarIntegration = async () => {
    return await updateAvatarSettings({ integrationEnabled: true });
  };

  const disableAvatarIntegration = async () => {
    return await updateAvatarSettings({ integrationEnabled: false });
  };

  const setActiveAvatar = async (avatarId: string) => {
    try {
      if (!isSignedIn || !user) return false;

      const response = await fetch('/api/v1/avatars/set-active', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ avatarId }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.ok) {
          await loadAvatarBundle(avatarId);
          return true;
        }
      }
    } catch (error) {
      logger.error('Failed to set active avatar:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    }
    return false;
  };

  const getAvatarForGame = (gameStyle?: 'sprite' | 'ragdoll' | 'toon' | 'shader'): AvatarBundle => {
    if (!settings.integrationEnabled) {
      return defaultAvatarBundle;
    }

    const style = gameStyle || settings.preferredStyle;

    // Filter out adult content if not allowed
    if (avatarBundle.adultContent && !settings.showAdultContent) {
      return defaultAvatarBundle;
    }

    // Return avatar with appropriate style
    return {
      ...avatarBundle,
      style,
    };
  };

  return {
    avatarBundle,
    settings,
    loading,
    enableAvatarIntegration,
    disableAvatarIntegration,
    setActiveAvatar,
    getAvatarForGame,
    updateAvatarSettings,
  };
}
