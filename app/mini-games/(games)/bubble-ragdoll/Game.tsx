'use client';

import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import type { AssetManifest } from '@/app/components/games/GameAssetPreloader';
import { useGameProgress } from '@/app/lib/games/progress';

import { getAsset } from '../../_shared/assets-resolver';
import {
  GamePlatformControls,
  GamePlatformPause,
  GameSessionAnnouncement,
} from '../../_shared/GamePlatform';
import { useGameSession, type GameSessionResult } from '../../_shared/GameSession';
import { GameResultsScreen } from '../../_shared/GameResultsScreen';
import { GameStateMachine, type GameState } from '../../_shared/GameStateMachine';
import { GameTitleScreen } from '../../_shared/GameTitleScreen';
import { GameUI } from '../../_shared/GameUI';
import BubbleRagdollScene from './Scene';

type BubbleRagdollResult = GameSessionResult & {
  outcome: 'completed';
  score: number;
  durationMs: number;
  combo: number;
  misses: number;
  pops: number;
};

export default function BubbleRagdollGame() {
  const router = useRouter();
  const session = useGameSession<BubbleRagdollResult>({
    onExit: () => router.push('/mini-games'),
  });
  const { beginResultSession, recordResult } = useGameProgress();
  const resultSubmittedRef = useRef(false);
  const [gameResults, setGameResults] = useState<BubbleRagdollResult | null>(null);
  const [gameStats, setGameStats] = useState({ score: 0, combo: 0, timer: 60, progress: 0 });

  const gameAssets: AssetManifest = {
    images: [
      getAsset('bubble-ragdoll', 'bg') || '',
      getAsset('bubble-ragdoll', 'bubbleSprite') || '',
    ].filter(Boolean),
    audio: [
      getAsset('bubble-ragdoll', 'popSfx') || '',
      getAsset('bubble-ragdoll', 'bounceSfx') || '',
      getAsset('bubble-ragdoll', 'failSfx') || '',
    ].filter(Boolean),
  };

  const handleGameEnd = useCallback(
    (facts: Omit<BubbleRagdollResult, 'outcome'>) => {
      const result: BubbleRagdollResult = { ...facts, outcome: 'completed' };
      setGameResults(result);
      session.complete(result);

      if (!resultSubmittedRef.current) {
        resultSubmittedRef.current = true;
        void recordResult({
          gameId: 'bubble-ragdoll',
          score: result.score,
          difficulty: 'default',
          durationMs: result.durationMs,
          didWin: result.score > 0,
          metadata: { combo: result.combo, misses: result.misses, pops: result.pops },
        });
      }
    },
    [recordResult, session.complete],
  );

  const handleGameStatsUpdate = useCallback(
    (stats: { score: number; combo: number; timer: number; progress: number }) => {
      setGameStats(stats);
    },
    [],
  );

  const syncSession = useCallback(
    (state: GameState) => {
      if (state === 'loading' || state === 'boot') session.prepare();
      if (state === 'title') session.ready();
      if (state === 'playing') {
        beginResultSession('bubble-ragdoll');
        resultSubmittedRef.current = false;
        session.start();
      }
    },
    [beginResultSession, session.prepare, session.ready, session.start],
  );

  return (
    <GameStateMachine
      gameId="bubble-ragdoll"
      gameTitle="Bubble Ragdoll"
      assets={
        (gameAssets.images?.length ?? 0) > 0 || (gameAssets.audio?.length ?? 0) > 0
          ? gameAssets
          : undefined
      }
      onStateChange={syncSession}
    >
      {(state, transitionTo) => {
        if (state === 'title') {
          return (
            <GameTitleScreen
              title="Bubble Ragdoll"
              description="Toss the ragdoll into bubbles. Survive the chaos."
              instructions={[
                'Click to spawn bubbles',
                'Drag the ragdoll to throw it',
                'Pop bubbles for points',
                'Survive as long as possible',
              ]}
              onStart={() => transitionTo('playing')}
            />
          );
        }

        if (state === 'results' && gameResults) {
          return (
            <GameResultsScreen
              title="Bubble Ragdoll"
              score={gameResults.score}
              isWin={gameResults.score > 0}
              stats={[
                { label: 'Best combo', value: gameResults.combo },
                { label: 'Bubbles popped', value: gameResults.pops },
              ]}
              onRestart={() => {
                setGameResults(null);
                setGameStats({ score: 0, combo: 0, timer: 60, progress: 0 });
                session.restart();
                transitionTo('title');
              }}
              onBack={session.exit}
            />
          );
        }

        if (state === 'playing') {
          return (
            <>
              <GameUI
                score={gameStats.score}
                combo={gameStats.combo}
                timer={gameStats.timer}
                progress={gameStats.progress}
                milestone="Pop those bubbles!"
              />
              <GamePlatformControls session={session} />
              <BubbleRagdollScene
                paused={session.phase === 'paused'}
                onGameEnd={(result) => {
                  handleGameEnd(result);
                  transitionTo('results');
                }}
                onStatsUpdate={handleGameStatsUpdate}
              />
              <GamePlatformPause session={session} title="Bubble Ragdoll" />
              <GameSessionAnnouncement session={session} />
            </>
          );
        }

        return null;
      }}
    </GameStateMachine>
  );
}
