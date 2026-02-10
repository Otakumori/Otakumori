'use client';

import { useState, useCallback } from 'react';
import { GameStateMachine, type GameState } from '../../_shared/GameStateMachine';
import { GameTitleScreen } from '../../_shared/GameTitleScreen';
import { GameResultsScreen } from '../../_shared/GameResultsScreen';
import { GameUI } from '../../_shared/GameUI';
import Game from './Game';
import { getAsset } from '../../_shared/assets-resolver';
import type { AssetManifest } from '@/app/components/games/GameAssetPreloader';

interface PetalSamuraiGameWrapperProps {
  mode: 'classic' | 'storm' | 'endless' | 'timed';
  difficulty?: 'easy' | 'normal' | 'medium' | 'hard';
}

export default function PetalSamuraiGameWrapper({ mode, difficulty = 'normal' }: PetalSamuraiGameWrapperProps) {
  const [gameState, setGameState] = useState<GameState>('loading');
  const [gameResults, setGameResults] = useState<{
    score: number;
    combo: number;
    misses: number;
    didWin: boolean;
  } | null>(null);
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

  const handleGameEnd = useCallback((results: { score: number; combo: number; misses: number; didWin: boolean }) => {
    setGameResults(results);
    setGameState('results');
  }, []);

  const handleGameStatsUpdate = useCallback((stats: { score: number; combo: number; timer: number; progress: number; lives?: number }) => {
    setGameStats({
      score: stats.score,
      combo: stats.combo,
      timer: stats.timer,
      progress: stats.progress,
      lives: stats.lives ?? 3,
    });
  }, []);

  return (
    <GameStateMachine
      gameId="petal-samurai"
      gameTitle="Petal Samurai"
      assets={(gameAssets.images?.length ?? 0) > 0 || (gameAssets.audio?.length ?? 0) > 0 ? gameAssets : undefined}
      onStateChange={setGameState}
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
                combo={gameStats.combo}
                timer={gameStats.timer}
                lives={gameStats.lives}
                progress={gameStats.progress}
                milestone="Slice those petals!"
              />
              <Game
                mode={mode}
                difficulty={difficulty}
                onGameEnd={handleGameEnd}
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

