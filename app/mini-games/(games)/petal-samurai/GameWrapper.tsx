'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { GameStateMachine, type GameState } from '../../_shared/GameStateMachine';
import { GameTitleScreen } from '../../_shared/GameTitleScreen';
import { GameResultsScreen } from '../../_shared/GameResultsScreen';
import {
  GamePlatformHud,
  GamePlatformPause,
  GameSessionAnnouncement,
} from '../../_shared/GamePlatform';
import { useGameSession, type GameSessionResult } from '../../_shared/GameSession';
import Game from './Game';
import { getAsset } from '../../_shared/assets-resolver';
import type { AssetManifest } from '@/app/components/games/GameAssetPreloader';

interface PetalSamuraiGameWrapperProps {
  mode: 'classic' | 'storm' | 'endless' | 'timed';
  difficulty?: 'easy' | 'normal' | 'medium' | 'hard';
}

type PetalSamuraiResult = GameSessionResult & {
  outcome: 'completed';
  score: number;
  combo: number;
  misses: number;
  didWin: boolean;
};

export default function PetalSamuraiGameWrapper({ mode, difficulty = 'normal' }: PetalSamuraiGameWrapperProps) {
  const router = useRouter();
  const session = useGameSession<PetalSamuraiResult>({
    onExit: () => router.push('/mini-games'),
  });
  const [gameResults, setGameResults] = useState<PetalSamuraiResult | null>(null);
  const [gameStats, setGameStats] = useState({
    score: 0,
    combo: 0,
    timer: 60,
    progress: 0,
    lives: 3,
  });

  const gameAssets: AssetManifest = {
    images: [
      getAsset('petal-samurai', 'bg') || '',
      getAsset('petal-samurai', 'spriteSheet') || '',
    ].filter(Boolean),
    audio: [
      getAsset('petal-samurai', 'sliceSfx') || '',
      getAsset('petal-samurai', 'comboSfx') || '',
    ].filter(Boolean),
  };

  const handleGameEnd = useCallback(
    (results: { score: number; combo: number; misses: number; didWin: boolean }) => {
      const completed: PetalSamuraiResult = { ...results, outcome: 'completed' };
      setGameResults(completed);
      session.complete(completed);
    },
    [session.complete],
  );

  const handleGameStatsUpdate = useCallback((stats: { score: number; combo: number; timer: number; progress: number; lives?: number }) => {
    setGameStats({
      score: stats.score,
      combo: stats.combo,
      timer: stats.timer,
      progress: stats.progress,
      lives: stats.lives ?? 3,
    });
  }, []);

  const syncSession = useCallback(
    (state: GameState) => {
      if (state === 'loading' || state === 'boot') session.prepare();
      if (state === 'title') session.ready();
      if (state === 'playing') session.start();
    },
    [session.prepare, session.ready, session.start],
  );

  return (
    <GameStateMachine
      gameId="petal-samurai"
      gameTitle="Petal Samurai"
      assets={(gameAssets.images?.length ?? 0) > 0 || (gameAssets.audio?.length ?? 0) > 0 ? gameAssets : undefined}
      onStateChange={syncSession}
    >
      {(state, transitionTo) => {
        if (state === 'title') {
          return (
            <GameTitleScreen
              title="Petal Samurai"
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
              onStart={() => transitionTo('playing')}
            />
          );
        }

        if (state === 'results' && gameResults) {
          return (
            <GameResultsScreen
              title="Petal Samurai"
              score={gameResults.score}
              isWin={gameResults.didWin}
              stats={[
                { label: 'Final Score', value: gameResults.score },
                { label: 'Max Combo', value: gameResults.combo },
                { label: 'Misses', value: gameResults.misses },
              ]}
              onRestart={() => {
                setGameResults(null);
                setGameStats({ score: 0, combo: 0, timer: 60, progress: 0, lives: 3 });
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
              <GamePlatformHud
                metrics={[
                  { label: 'Score', value: gameStats.score.toLocaleString() },
                  ...(gameStats.combo > 0
                    ? [{ label: 'Combo', value: `${gameStats.combo}x`, emphasis: 'selected' as const }]
                    : []),
                  { label: 'Time', value: gameStats.timer },
                  { label: 'Lives', value: gameStats.lives },
                ]}
                progress={gameStats.progress}
                progressLabel="Run progress"
                session={session}
              />
              <Game
                mode={mode}
                difficulty={difficulty}
                paused={session.phase === 'paused'}
                onGameEnd={(results) => {
                  handleGameEnd(results);
                  transitionTo('results');
                }}
                onStatsUpdate={handleGameStatsUpdate}
              />
              <GamePlatformPause session={session} title="Petal Samurai" />
              <GameSessionAnnouncement session={session} />
            </>
          );
        }

        return null;
      }}
    </GameStateMachine>
  );
}

