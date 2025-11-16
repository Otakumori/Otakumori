/**
 * Avatar vs Preset Choice Component
 * Shows choice between "Play with my avatar" and "Play with preset"
 * Used by all games with avatarUsage: "avatar-or-preset"
 */

'use client';

import { useState, useEffect } from 'react';
import { AvatarRenderer } from '@om/avatar-engine/renderer';
import { isAvatarsEnabled } from '@om/avatar-engine/config/flags';
import { getGameRepresentationMode, getGameAvatarUsage } from './miniGameConfigs';
import { loadGuestAvatar } from './useGameAvatarWithConfig';
import { useCreatorAvatar } from './useCreatorAvatar';
import type { AvatarProfile } from '@om/avatar-engine/types/avatar';
import type { AvatarConfiguration } from '@/app/lib/3d/avatar-parts';
import { OmButton, OmPanel, OmPanelContent } from '@/app/components/ui/om';

/**
 * Save guest avatar to localStorage
 */
export function saveGuestAvatar(avatar: AvatarProfile): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('otm-guest-avatar', JSON.stringify(avatar));
  } catch (error) {
    console.warn('Failed to save guest avatar to localStorage:', error);
  }
}

export type AvatarChoice = 'creator' | 'preset';

export interface AvatarPresetChoiceProps {
  gameId: string;
  onChoice: (choice: AvatarChoice, avatar?: AvatarProfile | AvatarConfiguration) => void;
  onCancel?: () => void;
}

/**
 * Component that shows avatar vs preset choice
 * Appears before game starts for games with avatarUsage: "avatar-or-preset"
 */
export function AvatarPresetChoice({ gameId, onChoice, onCancel }: AvatarPresetChoiceProps) {
  const [guestAvatar, setGuestAvatar] = useState<AvatarProfile | null>(null);
  
  const avatarsEnabled = isAvatarsEnabled();
  const avatarUsage = getGameAvatarUsage(gameId);
  const representationMode = getGameRepresentationMode(gameId);
  
  // Load CREATOR avatar
  const { creatorAvatar, avatarConfig, isLoading: creatorLoading } = useCreatorAvatar(avatarsEnabled);
  
  // Load guest avatar on mount
  useEffect(() => {
    if (avatarsEnabled) {
      const loaded = loadGuestAvatar();
      setGuestAvatar(loaded);
    }
  }, [avatarsEnabled]);

  // If avatars disabled or preset-only, skip choice
  if (!avatarsEnabled || avatarUsage === 'preset-only') {
    onChoice('preset');
    return null;
  }

  const hasGuestAvatar = guestAvatar !== null;
  const hasCreatorAvatar = avatarConfig !== null || creatorAvatar !== null;
  const hasAnyAvatar = hasGuestAvatar || hasCreatorAvatar;
  
  const handlePlayWithCreator = () => {
    if (avatarConfig) {
      onChoice('creator', avatarConfig);
    } else if (guestAvatar) {
      // Fallback to guest avatar if CREATOR avatar not available
      onChoice('creator', guestAvatar);
    }
  };
  
  const handlePlayWithPreset = () => {
    onChoice('preset');
  };
  
  const handleCreateTempAvatar = () => {
    // Create a simple temporary avatar
    const tempAvatar: AvatarProfile = {
      id: 'temp-' + Date.now(),
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
    
    saveGuestAvatar(tempAvatar);
    setGuestAvatar(tempAvatar);
    onChoice('creator', tempAvatar);
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <OmPanel variant="modal" size="md">
        <OmPanelContent padding="lg">
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4">Choose Your Character</h2>
            
            {/* Avatar Preview */}
            {hasCreatorAvatar && avatarConfig && (
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="text-sm text-pink-200 mb-2">My CREATOR Avatar</div>
                  {/* Note: AvatarRenderer from avatar-engine may need to be updated to support AvatarConfiguration */}
                  {/* For now, show a placeholder */}
                  <div className="w-32 h-32 bg-pink-500/20 rounded-lg flex items-center justify-center border border-pink-500/30">
                    <span className="text-pink-200 text-xs">CREATOR Avatar</span>
                  </div>
                </div>
              </div>
            )}
            {!hasCreatorAvatar && hasGuestAvatar && guestAvatar && (
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <AvatarRenderer
                    profile={guestAvatar}
                    mode={representationMode}
                    size="small"
                  />
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs text-pink-200 bg-black/60 px-2 py-1 rounded">
                    My Avatar
                  </div>
                </div>
              </div>
            )}
            
            {/* Choice Buttons */}
            <div className="space-y-3">
              {hasAnyAvatar ? (
                <>
                  <OmButton
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={handlePlayWithCreator}
                    disabled={creatorLoading}
                  >
                    {hasCreatorAvatar ? 'Play with my CREATOR avatar' : 'Play with my avatar'}
                  </OmButton>
                  <OmButton
                    variant="ghost"
                    size="lg"
                    className="w-full"
                    onClick={handlePlayWithPreset}
                  >
                    Play with preset character
                  </OmButton>
                </>
              ) : (
                <>
                  <OmButton
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={handlePlayWithPreset}
                  >
                    Play with preset character
                  </OmButton>
                  <OmButton
                    variant="ghost"
                    size="lg"
                    className="w-full"
                    onClick={handleCreateTempAvatar}
                  >
                    Create a temporary avatar for this session
                  </OmButton>
                </>
              )}
            </div>
            
            {onCancel && (
              <OmButton variant="ghost" size="sm" onClick={onCancel}>
                Cancel
              </OmButton>
            )}
          </div>
        </OmPanelContent>
      </OmPanel>
    </div>
  );
}

