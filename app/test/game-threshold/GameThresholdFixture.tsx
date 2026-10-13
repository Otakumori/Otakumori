'use client';

import { useEffect, useState } from 'react';

import { GameResultsScreen } from '@/app/mini-games/_shared/GameResultsScreen';
import { GameTitleScreen } from '@/app/mini-games/_shared/GameTitleScreen';

export function GameThresholdFixture() {
  const [hydrated, setHydrated] = useState(false);
  const [state, setState] = useState<'ready' | 'results'>('ready');

  useEffect(() => setHydrated(true), []);

  return (
    <div data-game-threshold-fixture-hydrated={hydrated ? 'true' : 'false'}>
      {state === 'results' ? (
      <GameResultsScreen
        isWin
        onBack={() => setState('ready')}
        onRestart={() => setState('ready')}
        score={2400}
        stats={[{ label: 'Recovered memories', value: 6 }]}
        title="Memory Keeper"
      />
      ) : (
        <GameTitleScreen
          artworkSrc="/assets/mini-games/memory-defrag/keeper/keeper-layer.webp"
          description="Restore the archive before its fragments fade."
          instructions={[
            'Use the arrow keys or swipe to move between fragments.',
            'Match each memory before the sequence closes.',
          ]}
          inputLabel="Keyboard / touch"
          launchLabel="Enter the archive"
          onStart={() => setState('results')}
          title="Memory Keeper"
        />
      )}
    </div>
  );
}
