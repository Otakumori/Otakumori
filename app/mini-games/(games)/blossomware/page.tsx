/**
 * Blossomware - Chaotic Micro-Games Playlist
 *
 * Core Fantasy: Chaotic micro-sessions—keep your petal streak alive.
 *
 * Game Flow: playlist → auto-play micro-games
 * Win Condition: Complete playlist
 * Lose Condition: Fail too many games
 *
 * Progression: Auto-playing playlist of mini-games
 * Scoring: Cumulative score across all games
 * Petals: Awarded based on overall playlist performance
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GAMES } from '@/components/arcade/registry';
import Engine from '@/components/arcade/Engine';
import type {
  BlossomwareOrchestratorState,
  BlossomwareRunResult,
} from '@/components/arcade/types';
import {
  getGameVisualProfile,
  applyVisualProfile,
  getGameDisplayName,
} from '../../_shared/gameVisuals';
import { MiniGameFrame } from '../../_shared/MiniGameFrame';
import {
  GamePlatformHud,
  GamePlatformPause,
  GameSessionAnnouncement,
} from '../../_shared/GamePlatform';
import { useGameSession, type GameSessionResult } from '../../_shared/GameSession';
import { GameResultsScreen } from '../../_shared/GameResultsScreen';

type BlossomwareResult = GameSessionResult & BlossomwareRunResult & {
  outcome: 'completed';
};

const INITIAL_ORCHESTRATOR_STATE: BlossomwareOrchestratorState = {
  activeGameId: null,
  activeGameLabel: null,
  failures: 0,
  phase: 'preparing',
  roundIndex: 0,
  roundsCompleted: 0,
  score: 0,
  successes: 0,
  totalRounds: GAMES.length,
};

export default function BlossomwarePage() {
  const router = useRouter();
  const session = useGameSession<BlossomwareResult>({
    initialPhase: 'idle',
    onExit: () => router.push('/mini-games'),
  });
  const [runKey, setRunKey] = useState(0);
  const [orchestrator, setOrchestrator] = useState(INITIAL_ORCHESTRATOR_STATE);

  useEffect(() => {
    session.start();
  }, [session.start]);

  const handleRunComplete = useCallback(
    (result: BlossomwareRunResult) => {
      session.complete({ outcome: 'completed', ...result });
    },
    [session.complete],
  );

  // Visual profile
  const visualProfile = getGameVisualProfile('blossomware');
  const { backgroundStyle } = applyVisualProfile(visualProfile);

  const handleRestart = useCallback(() => {
    setOrchestrator(INITIAL_ORCHESTRATOR_STATE);
    setRunKey((value) => value + 1);
    session.restart();
    window.requestAnimationFrame(session.start);
  }, [session.restart, session.start]);

  const displayName = getGameDisplayName('blossomware');

  if (session.phase === 'completed' && session.result) {
    return (
      <MiniGameFrame gameId="blossomware">
        <GameResultsScreen
          title={displayName}
          score={session.result.score}
          isWin
          stats={[
            { label: 'Microgames cleared', value: session.result.successes },
            { label: 'Microgames missed', value: session.result.failures },
            { label: 'Rounds completed', value: session.result.roundsCompleted },
          ]}
          onRestart={handleRestart}
          onBack={session.exit}
        />
        <GameSessionAnnouncement session={session} />
      </MiniGameFrame>
    );
  }

  return (
    <MiniGameFrame gameId="blossomware">
      <div className="relative min-h-screen" style={backgroundStyle}>
        <div className="mx-auto max-w-5xl px-4 py-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-semibold mb-2 text-pink-400">{displayName}</h1>
              <p className="text-sm opacity-80 text-slate-300">
                Chaotic micro-sessions—keep your petal streak alive.
              </p>
            </div>
            <Link
              href="/mini-games"
              className="px-4 py-2 rounded-lg bg-black/50 backdrop-blur border border-pink-500/30 text-pink-200 hover:bg-pink-500/20 transition-colors"
            >
              Back to Arcade
            </Link>
          </div>

          <div className="rounded-2xl bg-white/5 backdrop-blur p-4 ring-1 ring-white/10">
            <GamePlatformHud
              metrics={[
                { label: 'Score', value: orchestrator.score.toLocaleString() },
                {
                  label: 'Round',
                  value: `${Math.min(orchestrator.roundIndex + 1, orchestrator.totalRounds)}/${orchestrator.totalRounds}`,
                },
                { label: 'Streak', value: orchestrator.successes },
              ]}
              progress={
                orchestrator.totalRounds > 0
                  ? orchestrator.roundsCompleted / orchestrator.totalRounds
                  : 0
              }
              progressLabel="Blossomware run progress"
              session={session}
            />
            <Engine
              key={runKey}
              playlist={GAMES}
              mode="long"
              autoplay
              paused={session.phase === 'paused'}
              onRunComplete={handleRunComplete}
              onStateChange={setOrchestrator}
            />
            <GamePlatformPause session={session} title={displayName} />
            <GameSessionAnnouncement session={session} />
          </div>
        </div>
      </div>
    </MiniGameFrame>
  );
}
