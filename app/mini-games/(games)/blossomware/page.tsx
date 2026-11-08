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

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GAMES } from '@/components/arcade/registry';
import Engine from '@/components/arcade/Engine';
import type { BlossomwareOrchestratorState, BlossomwareRunResult } from '@/components/arcade/types';
import {
  BLOSSOMWARE_CLASSIC_SEED,
  buildBlossomwarePlaylist,
  getBlossomwareDailySeed,
  type BlossomwarePlaylistVariant,
} from '@/components/arcade/blossomwarePlaylist';
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
import { recordPersonalBest, type PersonalBestResult } from '@/app/lib/games/progress';

type BlossomwareResult = GameSessionResult &
  BlossomwareRunResult & {
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

const PLAYLIST_VARIANTS: ReadonlyArray<{
  description: string;
  id: BlossomwarePlaylistVariant;
  label: string;
}> = [
  {
    id: 'classic',
    label: 'Classic Circuit',
    description: 'All authored microgames in their original order.',
  },
  {
    id: 'short',
    label: 'Quick Bloom',
    description: 'Five microgames drawn from a reproducible run seed.',
  },
  {
    id: 'daily',
    label: 'Daily Bloom',
    description: 'One shared full-catalog shuffle for the local calendar day.',
  },
];

function createShortRunSeed() {
  const id = globalThis.crypto?.randomUUID?.().slice(0, 8) ?? Date.now().toString(36).slice(-8);
  return `quick-${id}`;
}

export default function BlossomwarePage() {
  const router = useRouter();
  const session = useGameSession<BlossomwareResult>({
    initialPhase: 'idle',
    onExit: () => router.push('/mini-games'),
  });
  const [runKey, setRunKey] = useState(0);
  const [orchestrator, setOrchestrator] = useState(INITIAL_ORCHESTRATOR_STATE);
  const [hasStarted, setHasStarted] = useState(false);
  const [playlistVariant, setPlaylistVariant] = useState<BlossomwarePlaylistVariant>('classic');
  const [runSeed, setRunSeed] = useState(BLOSSOMWARE_CLASSIC_SEED);
  const [personalBest, setPersonalBest] = useState<PersonalBestResult>();
  const playlist = useMemo(
    () => buildBlossomwarePlaylist(GAMES, playlistVariant, runSeed),
    [playlistVariant, runSeed],
  );
  const selectedVariant =
    PLAYLIST_VARIANTS.find((variant) => variant.id === playlistVariant) ?? PLAYLIST_VARIANTS[0];

  const handleRunComplete = useCallback(
    (result: BlossomwareRunResult) => {
      session.complete({ outcome: 'completed', ...result });
      void recordPersonalBest({
        gameId: 'blossomware',
        resultKey: playlistVariant,
        score: result.score,
        metadata: {
          mode: playlistVariant,
          roundsCompleted: result.roundsCompleted,
          successes: result.successes,
          failures: result.failures,
        },
      }).then(setPersonalBest);
    },
    [playlistVariant, session.complete],
  );

  // Visual profile
  const visualProfile = getGameVisualProfile('blossomware');
  const { backgroundStyle } = applyVisualProfile(visualProfile);

  const handleRestart = useCallback(() => {
    if (playlistVariant === 'short') setRunSeed(createShortRunSeed());
    setPersonalBest(undefined);
    setOrchestrator(INITIAL_ORCHESTRATOR_STATE);
    setRunKey((value) => value + 1);
    session.restart();
    window.requestAnimationFrame(session.start);
  }, [playlistVariant, session.restart, session.start]);

  const selectPlaylist = useCallback((variant: BlossomwarePlaylistVariant) => {
    setPlaylistVariant(variant);
    setRunSeed(
      variant === 'classic'
        ? BLOSSOMWARE_CLASSIC_SEED
        : variant === 'daily'
          ? getBlossomwareDailySeed()
          : createShortRunSeed(),
    );
  }, []);

  const startRun = useCallback(() => {
    setOrchestrator({ ...INITIAL_ORCHESTRATOR_STATE, totalRounds: playlist.length });
    setHasStarted(true);
    session.start();
  }, [playlist.length, session.start]);

  const displayName = getGameDisplayName('blossomware');

  if (session.phase === 'completed' && session.result) {
    return (
      <MiniGameFrame gameId="blossomware">
        <GameResultsScreen
          title={displayName}
          score={session.result.score}
          isWin
          personalBest={personalBest}
          stats={[
            { label: 'Playlist', value: selectedVariant.label },
            { label: 'Run seed', value: runSeed },
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

  if (!hasStarted) {
    return (
      <MiniGameFrame gameId="blossomware">
        <main className="min-h-screen px-4 py-10" style={backgroundStyle}>
          <section
            aria-labelledby="blossomware-playlist-title"
            className="mx-auto max-w-3xl rounded-2xl border border-pink-300/20 bg-black/65 p-5 shadow-2xl backdrop-blur md:p-8"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-pink-200/70">
              Playlist protocol
            </p>
            <h1
              className="mt-2 text-3xl font-semibold text-pink-100"
              id="blossomware-playlist-title"
            >
              {displayName}
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Choose the shape of this run. Every playlist uses the existing authored microgames and
              preserves their scoring and Petal cadence.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {PLAYLIST_VARIANTS.map((variant) => {
                const isSelected = variant.id === playlistVariant;
                return (
                  <button
                    aria-pressed={isSelected}
                    className={`min-h-28 rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-300 ${
                      isSelected
                        ? 'border-pink-300/70 bg-pink-400/15 text-pink-50'
                        : 'border-white/15 bg-black/35 text-slate-200 hover:border-pink-300/40 hover:bg-pink-400/10'
                    }`}
                    key={variant.id}
                    onClick={() => selectPlaylist(variant.id)}
                    type="button"
                  >
                    <span className="block font-semibold">{variant.label}</span>
                    <span className="mt-2 block text-xs leading-5 text-slate-300">
                      {variant.description}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex flex-col gap-4 rounded-xl border border-white/10 bg-black/30 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div aria-live="polite">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Run seed</p>
                <code className="mt-1 block break-all text-sm text-pink-200">{runSeed}</code>
                <p className="mt-1 text-xs text-slate-400">{playlist.length} microgames</p>
              </div>
              <button
                className="min-h-11 rounded-lg bg-pink-500 px-5 py-3 font-semibold text-white transition-colors hover:bg-pink-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-200"
                onClick={startRun}
                type="button"
              >
                Start {selectedVariant.label}
              </button>
            </div>
          </section>
        </main>
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
              <p className="mt-1 text-xs text-pink-100/70">
                {selectedVariant.label} · seed <code>{runSeed}</code>
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
              playlist={playlist}
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
