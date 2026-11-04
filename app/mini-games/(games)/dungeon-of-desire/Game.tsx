'use client';

import { useState, useCallback, useRef } from 'react';
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
import DungeonGame from './DungeonGame';
import { getAsset } from '../../_shared/assets-resolver';
import type { AssetManifest } from '@/app/components/games/GameAssetPreloader';
import { useGameProgress } from '@/app/lib/games/progress';
import type { PersonalBestResult } from '@/app/lib/games/progress';

type DungeonResult = GameSessionResult & {
  outcome: 'completed';
  score: number;
  floor: number;
  didWin: boolean;
};

export default function DungeonOfDesireGameWrapper() {
  const router = useRouter();
  const session = useGameSession<DungeonResult>({
    onExit: () => router.push('/mini-games'),
  });
  const [gameResults, setGameResults] = useState<DungeonResult | null>(null);
  const completionSubmittedRef = useRef(false);
  const startedAtRef = useRef(0);
  const { beginResultSession, recordResult } = useGameProgress();
  const [personalBest, setPersonalBest] = useState<PersonalBestResult | null>(null);
  const [gameStats, setGameStats] = useState({
    score: 0,
    health: 100,
    maxHealth: 100,
    floor: 1,
    progress: 0,
  });

  const gameAssets: AssetManifest = {
    images: [
      getAsset('dungeon-of-desire', 'bg') || '',
      getAsset('dungeon-of-desire', 'playerSprite') || '',
      getAsset('dungeon-of-desire', 'enemySprite') || '',
    ].filter(Boolean),
    audio: [
      getAsset('dungeon-of-desire', 'bgm') || '',
      getAsset('dungeon-of-desire', 'hitSfx') || '',
      getAsset('dungeon-of-desire', 'spellSfx') || '',
    ].filter(Boolean),
  };

  const handleGameEnd = useCallback(
    (score: number, didWin: boolean, floor: number) => {
      if (completionSubmittedRef.current) return;
      completionSubmittedRef.current = true;
      const result: DungeonResult = { outcome: 'completed', score, floor, didWin };
      setGameResults(result);
      session.complete(result);
      void recordResult({
        gameId: 'dungeon-of-desire',
        resultKey: 'ten-floor-expedition',
        score,
        difficulty: 'medium',
        durationMs: startedAtRef.current > 0 ? Date.now() - startedAtRef.current : 0,
        didWin,
        metadata: { floor, wavesCleared: floor },
      }).then((saved) => setPersonalBest(saved.personalBest ?? null));
    },
    [recordResult, session.complete],
  );

  const handleGameStatsUpdate = useCallback(
    (stats: {
      score: number;
      health: number;
      maxHealth: number;
      floor: number;
      progress?: number;
    }) => {
      setGameStats({
        score: stats.score,
        health: stats.health,
        maxHealth: stats.maxHealth,
        floor: stats.floor,
        progress: stats.progress || 0,
      });
    },
    [],
  );

  const syncSession = useCallback(
    (state: GameState) => {
      if (state === 'loading' || state === 'boot') session.prepare();
      if (state === 'title') session.ready();
      if (state === 'playing') {
        completionSubmittedRef.current = false;
        startedAtRef.current = Date.now();
        beginResultSession('dungeon-of-desire');
        session.start();
      }
    },
    [beginResultSession, session.prepare, session.ready, session.start],
  );

  return (
    <GameStateMachine
      gameId="dungeon-of-desire"
      gameTitle="Dungeon of Desire"
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
              title="Dungeon of Desire"
              description="Descend into the dungeon. Survive rooms and claim rewards."
              instructions={[
                'Navigate through dungeon rooms',
                'Defeat enemies to progress',
                'Collect items and power-ups',
                'Survive to reach deeper floors',
                'Each floor increases difficulty',
              ]}
              onStart={() => transitionTo('playing')}
            />
          );
        }

        if (state === 'results' && gameResults) {
          return (
            <GameResultsScreen
              title="Dungeon of Desire"
              score={gameResults.score}
              isWin={gameResults.didWin}
              personalBest={personalBest}
              stats={[
                { label: 'Final Score', value: gameResults.score },
                { label: 'Floor Reached', value: gameResults.floor },
                { label: 'Result', value: gameResults.didWin ? 'Victory!' : 'Defeated' },
              ]}
              onRestart={() => {
                setGameResults(null);
                completionSubmittedRef.current = false;
                setGameStats({ score: 0, health: 100, maxHealth: 100, floor: 1, progress: 0 });
                setPersonalBest(null);
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
                  { label: 'Health', value: `${gameStats.health}/${gameStats.maxHealth}` },
                  { label: 'Floor', value: gameStats.floor },
                ]}
                progress={gameStats.progress}
                progressLabel="Dungeon progress"
                session={session}
              />
              <DungeonGame
                paused={session.phase === 'paused'}
                onGameEnd={(score, didWin, floor) => {
                  handleGameEnd(score, didWin, floor);
                  transitionTo('results');
                }}
                onStatsUpdate={handleGameStatsUpdate}
              />
              <GamePlatformPause session={session} title="Dungeon of Desire" />
              <GameSessionAnnouncement session={session} />
            </>
          );
        }

        return null;
      }}
    </GameStateMachine>
  );
}
