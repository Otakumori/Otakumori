/**
 * Petal Samurai - Full-Body Avatar-Driven Combat Game
 * Rebuilt as combat game per plan requirements
 */

'use client';

import dynamic from 'next/dynamic';
import { useState, useCallback } from 'react';
import Link from 'next/link';
import { GameEntryFlow, type DifficultyLevel } from '../_shared/GameEntryFlow';
import { MiniGameFrame } from '../_shared/MiniGameFrame';
import { getGameDisplayName } from '../_shared/gameVisuals';
import type { AvatarProfile } from '@om/avatar-engine/types/avatar';
import type { AvatarConfiguration } from '@/app/lib/3d/avatar-parts';

const SlicingGame = dynamic(() => import('./Game'), {
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
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>('normal');
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarProfile | AvatarConfiguration | null>(
    null,
  );

  const displayName = getGameDisplayName('petal-samurai');

  const handleGameStart = useCallback(
    (options: {
      difficulty: DifficultyLevel;
      avatarChoice: 'preset' | 'creator' | null;
      selectedAvatar?: AvatarProfile | AvatarConfiguration;
    }) => {
      setSelectedDifficulty(options.difficulty);
      if (options.selectedAvatar) {
        setSelectedAvatar(options.selectedAvatar);
      }
      setGameStarted(true);
    },
    [],
  );

  if (!gameStarted) {
    return (
      <MiniGameFrame gameId="petal-samurai">
        <GameEntryFlow
          gameId="petal-samurai"
          title={displayName}
          description="Slice falling petals with precision. Chain slices for combo multipliers!"
          instructions={[
            'Drag/swipe to slice falling petals',
            'Chain slices for combo multipliers',
            'Avoid missing 3 petals',
            'Survive 60 seconds',
            'Gold petals are worth more points',
            'Rare petals grant bonus combos',
            'Avoid bad objects (nuts/seeds) - they break combos!',
          ]}
          difficultyLevels={['easy', 'normal', 'hard']}
          defaultDifficulty="normal"
          onStart={handleGameStart}
          onCancel={() => {
            // Navigate back to arcade
            window.location.href = '/mini-games';
          }}
        />
      </MiniGameFrame>
    );
  }

  return (
    <MiniGameFrame gameId="petal-samurai">
      {/* Header */}
      <header className="absolute top-4 left-4 right-4 z-40 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-pink-200">{displayName}</h1>
          <p className="text-sm text-pink-200/70">Slice falling petals with precision</p>
        </div>
        <Link
          href="/mini-games"
          className="px-4 py-2 rounded-lg bg-black/50 backdrop-blur border border-pink-500/30 text-pink-200 hover:bg-pink-500/20 transition-colors"
        >
          Back to Arcade
        </Link>
      </header>

      {/* Game */}
      <SlicingGame mode="timed" difficulty={selectedDifficulty} />
    </MiniGameFrame>
  );
}
