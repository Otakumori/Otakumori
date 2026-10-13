'use client';

import { useEffect, useState } from 'react';

import { GameResultsScreen } from '@/app/mini-games/_shared/GameResultsScreen';
import {
  GamePlatformHud,
  GamePlatformPause,
  GameSessionAnnouncement,
} from '@/app/mini-games/_shared/GamePlatform';
import { useGameSession } from '@/app/mini-games/_shared/GameSession';

export function GamePlatformFixture() {
  const [hydrated, setHydrated] = useState(false);
  const [exited, setExited] = useState(false);
  const session = useGameSession({ initialPhase: 'idle', onExit: () => setExited(true) });

  useEffect(() => setHydrated(true), []);

  if (session.phase === 'completed' && session.result) {
    return (
      <GameResultsScreen
        isWin
        onBack={session.exit}
        onRestart={session.restart}
        score={session.result.score ?? 0}
        stats={session.result.stats ? [...session.result.stats] : []}
        title="Platform trial"
      />
    );
  }

  return (
    <main
      data-game-platform-fixture-hydrated={hydrated ? 'true' : 'false'}
      style={{ minHeight: '100svh', padding: '6rem 1rem 2rem' }}
    >
      <h1>Shared game platform</h1>
      <p aria-live="polite">{exited ? 'Session exited.' : `Session ${session.phase}.`}</p>
      {session.phase === 'idle' ? (
        <button type="button" onClick={session.start}>Begin session</button>
      ) : null}
      {session.phase === 'running' || session.phase === 'paused' ? (
        <>
          <GamePlatformHud
            metrics={[
              { label: 'Score', value: 1200 },
              { label: 'Time', value: '0:42' },
            ]}
            progress={0.6}
            progressLabel="Trial progress"
            session={session}
          />
          <button
            type="button"
            onClick={() =>
              session.complete({
                outcome: 'completed',
                score: 1200,
                stats: [{ label: 'Fragments', value: 6 }],
              })
            }
          >
            Complete run
          </button>
          <GamePlatformPause session={session} title="Platform trial" />
          <GameSessionAnnouncement session={session} />
        </>
      ) : null}
    </main>
  );
}
