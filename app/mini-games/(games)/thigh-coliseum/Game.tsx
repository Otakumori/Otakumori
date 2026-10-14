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
import ThighChaseGame from './ThighChaseGame';
import { getAsset } from '../../_shared/assets-resolver';
import type { AssetManifest } from '@/app/components/games/GameAssetPreloader';

type ThighColiseumResult = GameSessionResult & {
  outcome: 'completed';
  score: number;
  stage: number;
  didWin: boolean;
};

export default function ThighColiseumGameWrapper() {
  const router = useRouter();
  const session = useGameSession<ThighColiseumResult>({
    onExit: () => router.push('/mini-games'),
  });
  const [gameResults, setGameResults] = useState<ThighColiseumResult | null>(null);
  const [gameStats, setGameStats] = useState({
    score: 0,
    lives: 3,
    stage: 1,
    progress: 0,
  });

  const gameAssets: AssetManifest = {
    images: [
      getAsset('thigh-coliseum', 'bg') || '',
      getAsset('thigh-coliseum', 'playerSprite') || '',
      getAsset('thigh-coliseum', 'pursuerSprite') || '',
    ].filter(Boolean),
    audio: [
      getAsset('thigh-coliseum', 'bgm') || '',
      getAsset('thigh-coliseum', 'hitSfx') || '',
      getAsset('thigh-coliseum', 'powerupSfx') || '',
    ].filter(Boolean),
  };

  const handleGameEnd = useCallback(
    (score: number, didWin: boolean, stage: number) => {
      const result: ThighColiseumResult = { outcome: 'completed', score, stage, didWin };
      setGameResults(result);
      session.complete(result);
    },
    [session.complete],
  );

  const handleGameStatsUpdate = useCallback(
    (stats: { score: number; lives: number; stage: number; progress?: number }) => {
      setGameStats({
        score: stats.score,
        lives: stats.lives,
        stage: stats.stage,
        progress: stats.progress || 0,
      });
    },
    [],
  );

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
      gameId="thigh-coliseum"
      gameTitle="Thigh Coliseum"
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
              title="Thigh Coliseum"
              description="Enter the arena. Win rounds and advance the bracket."
              instructions={[
                'Win rounds to advance in the bracket',
                'Defeat opponents to progress',
                'Use strategy and timing',
                'Survive with your lives',
                'Reach the final round to win!',
              ]}
              onStart={() => transitionTo('playing')}
            />
          );
        }

        if (state === 'results' && gameResults) {
          return (
            <GameResultsScreen
              title="Thigh Coliseum"
              score={gameResults.score}
              isWin={gameResults.didWin}
              stats={[
                { label: 'Final Score', value: gameResults.score },
                { label: 'Stage Reached', value: gameResults.stage },
                { label: 'Result', value: gameResults.didWin ? 'Victory!' : 'Defeated' },
              ]}
              onRestart={() => {
                setGameResults(null);
                setGameStats({ score: 0, lives: 3, stage: 1, progress: 0 });
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
                  { label: 'Lives', value: gameStats.lives },
                  { label: 'Stage', value: gameStats.stage },
                ]}
                progress={gameStats.progress}
                progressLabel="Arena progress"
                session={session}
              />
              <ThighChaseGame
                paused={session.phase === 'paused'}
                onGameEnd={(score, didWin) => {
                  handleGameEnd(score, didWin, gameStats.stage);
                  transitionTo('results');
                }}
                onStatsUpdate={handleGameStatsUpdate}
              />
              <GamePlatformPause session={session} title="Thigh Colosseum" />
              <GameSessionAnnouncement session={session} />
            </>
          );
        }

        return null;
      }}
    </GameStateMachine>
  );
}
