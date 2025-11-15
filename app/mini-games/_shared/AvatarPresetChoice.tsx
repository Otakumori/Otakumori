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
import type { AvatarProfile } from '@om/avatar-engine/types/avatar';
import { OmButton, OmPanel, OmPanelContent } from '@/components/ui/om';

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

export type AvatarChoice = 'avatar' | 'preset';

export interface AvatarPresetChoiceProps {
  gameId: string;
  onChoice: (choice: AvatarChoice, avatar?: AvatarProfile) => void;
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
  
  const hasAvatar = guestAvatar !== null;
  
  const handlePlayWithAvatar = () => {
    if (guestAvatar) {
      onChoice('avatar', guestAvatar);
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
    onChoice('avatar', tempAvatar);
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <OmPanel variant="modal" size="md">
        <OmPanelContent padding="lg">
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4">Choose Your Character</h2>
            
            {/* Avatar Preview */}
            {hasAvatar && guestAvatar && (
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
              {hasAvatar && guestAvatar ? (
                <>
                  <OmButton
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={handlePlayWithAvatar}
                  >
                    Play with my avatar
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

