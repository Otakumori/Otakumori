'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import GameShell from '../_shared/GameShell';
import DungeonGame from './DungeonGame';
import { useGameAvatar } from '../_shared/useGameAvatarWithConfig';
import { AvatarRenderer } from '@om/avatar-engine/renderer';
import { GameHUD } from '../_shared/GameHUD';
import { AvatarPresetChoice, type AvatarChoice } from '../_shared/AvatarPresetChoice';
import { getGameAvatarUsage } from '../_shared/miniGameConfigs';
import { isAvatarsEnabled } from '@om/avatar-engine/config/flags';
import type { AvatarProfile } from '@om/avatar-engine/types/avatar';

export default function DungeonOfDesirePage() {
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(100);
  const [_floor, setFloor] = useState(1);
  
  // Avatar choice state
  const [avatarChoice, setAvatarChoice] = useState<AvatarChoice | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarProfile | null>(null);
  const [showAvatarChoice, setShowAvatarChoice] = useState(true); // Show on mount if needed
  
  // Avatar integration - use wrapper hook with choice
  const avatarUsage = getGameAvatarUsage('dungeon-of-desire');
  const { avatarConfig, representationConfig, isLoading: avatarLoading } = useGameAvatar('dungeon-of-desire', {
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
  
  // Check if we should show choice
  const shouldShowChoice = showAvatarChoice && avatarUsage === 'avatar-or-preset' && avatarChoice === null && isAvatarsEnabled();

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-black">
      {/* Header */}
      <div className="absolute top-4 left-4 right-4 z-40 flex items-center justify-between">
        <Link
          href="/mini-games"
          className="px-4 py-2 rounded-lg bg-black/50 backdrop-blur border border-pink-500/30 text-pink-200 hover:bg-pink-500/20 transition-colors"
        >
          Back to Arcade
        </Link>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-pink-200">Dungeon of Desire</h1>
          <p className="text-sm text-pink-200/70">Descend into the dungeon. Survive rooms and claim rewards.</p>
        </div>
        <div className="w-24" /> {/* Spacer */}
      </div>

      {/* Avatar vs Preset Choice */}
      {shouldShowChoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <AvatarPresetChoice
            gameId="dungeon-of-desire"
            onChoice={handleAvatarChoice}
            onCancel={() => setShowAvatarChoice(false)}
          />
        </div>
      )}

      {/* Avatar Display (Bust Mode) */}
      {!shouldShowChoice && isAvatarsEnabled() && avatarConfig && !avatarLoading && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30">
          <AvatarRenderer
            profile={avatarConfig}
            mode={representationConfig.mode}
            size="small"
          />
        </div>
      )}

      {/* Game HUD */}
      <GameHUD
        score={score}
        health={health}
        maxHealth={100}
      />

      <GameShell title="Dungeon of Desire" gameKey="dungeon-of-desire">
        <DungeonGame onScoreChange={setScore} onHealthChange={setHealth} onFloorChange={setFloor} />
      </GameShell>
    </div>
  );
}
