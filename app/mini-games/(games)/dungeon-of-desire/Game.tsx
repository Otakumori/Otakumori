'use client';

import { useState, useCallback } from 'react';
import { GameStateMachine, type GameState } from '../../_shared/GameStateMachine';
import { GameTitleScreen } from '../../_shared/GameTitleScreen';
import { GameResultsScreen } from '../../_shared/GameResultsScreen';
import { GameUI } from '../../_shared/GameUI';
import DungeonGame from './DungeonGame';
import { getAsset } from '../../_shared/assets-resolver';
import type { AssetManifest } from '@/app/components/games/GameAssetPreloader';

export default function DungeonOfDesireGameWrapper() {
  const [gameState, setGameState] = useState<GameState>('loading');
  const [gameResults, setGameResults] = useState<{
    score: number;
    floor: number;
    didWin: boolean;
  } | null>(null);
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

  const handleGameEnd = useCallback((score: number, didWin: boolean, floor: number) => {
    setGameResults({ score, floor, didWin });
    setGameState('results');
  }, []);

  const handleGameStatsUpdate = useCallback((stats: { score: number; health: number; maxHealth: number; floor: number; progress?: number }) => {
    setGameStats({
      score: stats.score,
      health: stats.health,
      maxHealth: stats.maxHealth,
      floor: stats.floor,
      progress: stats.progress || 0,
    });
  }, []);

  return (
    <GameStateMachine
      gameId="dungeon-of-desire"
      gameTitle="Dungeon of Desire"
      assets={(gameAssets.images?.length ?? 0) > 0 || (gameAssets.audio?.length ?? 0) > 0 ? gameAssets : undefined}
      onStateChange={setGameState}
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
              stats={[
                { label: 'Final Score', value: gameResults.score },
                { label: 'Floor Reached', value: gameResults.floor },
                { label: 'Result', value: gameResults.didWin ? 'Victory!' : 'Defeated' },
              ]}
              onRestart={() => {
                setGameResults(null);
                setGameStats({ score: 0, health: 100, maxHealth: 100, floor: 1, progress: 0 });
                transitionTo('title');
              }}
              onBack={() => {
                window.location.href = '/mini-games';
              }}
            />
          );
        }

        if (state === 'playing') {
          return (
            <>
              <GameUI
                score={gameStats.score}
                lives={gameStats.health}
                progress={gameStats.progress}
                milestone={`Floor ${gameStats.floor}`}
              />
              <DungeonGame
                onGameEnd={(score, didWin) => handleGameEnd(score, didWin, gameStats.floor)}
                onStatsUpdate={handleGameStatsUpdate}
              />
            </>
          );
        }

        return null;
      }}
    </GameStateMachine>
  );
}

