'use client';

import { useState, useCallback } from 'react';
import { GameStateMachine, type GameState } from '../../_shared/GameStateMachine';
import { GameTitleScreen } from '../../_shared/GameTitleScreen';
import { GameResultsScreen } from '../../_shared/GameResultsScreen';
import { GameUI } from '../../_shared/GameUI';
import SamuraiSliceScene from './Scene';
import { getAsset } from '../../_shared/assets-resolver';
import type { AssetManifest } from '@/app/components/games/GameAssetPreloader';

export default function SamuraiSliceGame() {
  const [gameState, setGameState] = useState<GameState>('loading');
  const [gameResults, setGameResults] = useState<{
    score: number;
    hits: number;
    crit: number;
    miss: number;
  } | null>(null);
  const [gameStats, setGameStats] = useState({
    score: 0,
    combo: 0,
    timer: 60,
    progress: 0,
  });

  // Collect assets for preloading
  const gameAssets: AssetManifest = {
    images: [
      getAsset('samurai-petal-slice', 'bg') || '',
      getAsset('samurai-petal-slice', 'petalParticle') || '',
    ].filter(Boolean),
    audio: [
      getAsset('samurai-petal-slice', 'slashSfx') || '',
      getAsset('samurai-petal-slice', 'hitSfx') || '',
      getAsset('samurai-petal-slice', 'missSfx') || '',
    ].filter(Boolean),
  };

  const handleGameEnd = useCallback((results: { score: number; hits: number; crit: number; miss: number }) => {
    setGameResults(results);
    setGameState('results');
  }, []);

  const handleGameStatsUpdate = useCallback((stats: { score: number; combo: number; timer: number; progress: number }) => {
    setGameStats(stats);
  }, []);

  return (
    <GameStateMachine
      gameId="samurai-petal-slice"
      gameTitle="Samurai Petal Slice"
      assets={gameAssets}
      onStateChange={setGameState}
    >
      {(state, transitionTo) => {
        // Title screen
        if (state === 'title') {
          return (
            <GameTitleScreen
              title="Samurai Petal Slice"
              description="Draw the Tetsusaiga's arc…"
              instructions={[
                'Drag to slash falling petals',
                'Horizontal slashes score critical hits',
                'Chain hits for combo multipliers',
                'Survive 60 seconds',
              ]}
              onStart={() => transitionTo('playing')}
            />
          );
        }

        // Results screen
        if (state === 'results' && gameResults) {
          return (
            <GameResultsScreen
              title="Samurai Petal Slice"
              score={gameResults.score}
              isWin={gameResults.score > 0}
              stats={[
                { label: 'Hits', value: gameResults.hits },
                { label: 'Critical Hits', value: gameResults.crit },
                { label: 'Misses', value: gameResults.miss },
                { label: 'Accuracy', value: `${gameResults.hits > 0 ? Math.round((gameResults.hits / (gameResults.hits + gameResults.miss)) * 100) : 0}%` },
              ]}
              onRestart={() => {
                setGameResults(null);
                setGameStats({ score: 0, combo: 0, timer: 60, progress: 0 });
                transitionTo('title');
              }}
              onBack={() => {
                window.location.href = '/mini-games';
              }}
            />
          );
        }

        // Playing state
        if (state === 'playing') {
          return (
            <>
              <GameUI
                score={gameStats.score}
                combo={gameStats.combo}
                timer={gameStats.timer}
                progress={gameStats.progress}
                milestone="Slice the falling petals!"
              />
              <SamuraiSliceScene
                onGameEnd={handleGameEnd}
                onStatsUpdate={handleGameStatsUpdate}
              />
            </>
          );
        }

        // Loading/boot states are handled by GameStateMachine
        return null;
      }}
    </GameStateMachine>
  );
}

