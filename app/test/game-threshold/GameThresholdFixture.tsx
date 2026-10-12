'use client';

import { useState } from 'react';

import { GameResultsScreen } from '@/app/mini-games/_shared/GameResultsScreen';
import { GameTitleScreen } from '@/app/mini-games/_shared/GameTitleScreen';

export function GameThresholdFixture() {
  const [state, setState] = useState<'ready' | 'results'>('ready');

  if (state === 'results') {
    return (
      <GameResultsScreen
        isWin
        onBack={() => setState('ready')}
        onRestart={() => setState('ready')}
        score={2400}
        stats={[{ label: 'Recovered memories', value: 6 }]}
        title="Memory Keeper"
      />
    );
  }

  return (
    <GameTitleScreen
      description="Restore the archive before its fragments fade."
      instructions={[
        'Use the arrow keys or swipe to move between fragments.',
        'Match each memory before the sequence closes.',
      ]}
      onStart={() => setState('results')}
      title="Memory Keeper"
    />
  );
}
