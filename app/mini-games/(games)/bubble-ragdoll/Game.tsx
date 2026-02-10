'use client';

import { useState, useCallback } from 'react';
import { GameStateMachine, type GameState } from '../../_shared/GameStateMachine';
import { GameTitleScreen } from '../../_shared/GameTitleScreen';
import { GameResultsScreen } from '../../_shared/GameResultsScreen';
import { GameUI } from '../../_shared/GameUI';
import BubbleRagdollScene from './Scene';
import { getAsset } from '../../_shared/assets-resolver';
import type { AssetManifest } from '@/app/components/games/GameAssetPreloader';

export default function BubbleRagdollGame() {
  const [gameState, setGameState] = useState<GameState>('loading');
  const [gameResults, setGameResults] = useState<{ score: number } | null>(null);
  const [gameStats, setGameStats] = useState({
    score: 0,
    combo: 0,
    timer: 60,
    progress: 0,
  });

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

  const handleGameEnd = useCallback((results: { score: number }) => {
    setGameResults(results);
    setGameState('results');
  }, []);

  const handleGameStatsUpdate = useCallback((stats: { score: number; combo: number; timer: number; progress: number }) => {
    setGameStats(stats);
  }, []);

  return (
    <GameStateMachine
      gameId="bubble-ragdoll"
      gameTitle="Bubble Ragdoll"
      assets={(gameAssets.images?.length ?? 0) > 0 || (gameAssets.audio?.length ?? 0) > 0 ? gameAssets : undefined}
      onStateChange={setGameState}
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
                { label: 'Final Score', value: gameResults.score },
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
              <BubbleRagdollScene
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

