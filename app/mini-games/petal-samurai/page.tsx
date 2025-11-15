/**
 * Petal Samurai - Full-Body Avatar-Driven Combat Game
 * Rebuilt as combat game per plan requirements
 */

'use client';

import dynamic from 'next/dynamic';
import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useGameAvatar } from '../_shared/useGameAvatarWithConfig';
import { AvatarRenderer } from '@om/avatar-engine/renderer';
import { AvatarPresetChoice, type AvatarChoice } from '../_shared/AvatarPresetChoice';
import { getGameAvatarUsage } from '../_shared/miniGameConfigs';
import { isAvatarsEnabled } from '@om/avatar-engine/config/flags';
import type { AvatarProfile } from '@om/avatar-engine/types/avatar';

const CombatGame = dynamic(() => import('./CombatGame'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-pink-200">Loading Petal Samurai...</p>
      </div>
    </div>
  ),
});

export default function PetalSamuraiPage() {
  // Avatar choice state
  const [avatarChoice, setAvatarChoice] = useState<AvatarChoice | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarProfile | null>(null);
  const [showAvatarChoice, setShowAvatarChoice] = useState(true); // Show on mount if needed
  
  // Avatar integration - use wrapper hook with choice
  const avatarUsage = getGameAvatarUsage('petal-samurai');
  const { avatarConfig, representationConfig, isLoading: avatarLoading } = useGameAvatar('petal-samurai', {
    forcePreset: avatarChoice === 'preset',
    avatarProfile: avatarChoice === 'avatar' ? selectedAvatar : null,
  });
  
  // Handle avatar choice
  const handleAvatarChoice = useCallback((choice: AvatarChoice, avatar?: AvatarProfile) => {
    setAvatarChoice(choice);
    if (choice === 'avatar' && avatar) {
      setSelectedAvatar(avatar);
    }
    setShowAvatarChoice(false);
  }, []);
  
  // Check if we should show choice on mount
  const shouldShowChoice = showAvatarChoice && avatarUsage === 'avatar-or-preset' && avatarChoice === null && isAvatarsEnabled();

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-black">
      {/* Header */}
      <header className="absolute top-4 left-4 right-4 z-40 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-pink-200">Petal Samurai</h1>
          <p className="text-sm text-pink-200/70">Full-body avatar-driven combat</p>
        </div>
        <Link
          href="/mini-games"
          className="px-4 py-2 rounded-lg bg-black/50 backdrop-blur border border-pink-500/30 text-pink-200 hover:bg-pink-500/20 transition-colors"
        >
          Back to Arcade
        </Link>
      </header>

      {/* Avatar vs Preset Choice */}
      {shouldShowChoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <AvatarPresetChoice
            gameId="petal-samurai"
            onChoice={handleAvatarChoice}
            onCancel={() => setShowAvatarChoice(false)}
          />
        </div>
      )}

      {/* Avatar Display (FullBody Mode) */}
      {!shouldShowChoice && isAvatarsEnabled() && avatarConfig && !avatarLoading && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30">
          <AvatarRenderer
            profile={avatarConfig}
            mode={representationConfig.mode}
            size="small"
          />
        </div>
      )}

      {/* Game */}
      {!shouldShowChoice && <CombatGame />}
    </main>
  );
}
