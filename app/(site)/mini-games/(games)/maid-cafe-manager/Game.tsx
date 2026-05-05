'use client';

import { useState, useCallback } from 'react';
import { GameStateMachine, type GameState } from '../../_shared/GameStateMachine';
import { GameTitleScreen } from '../../_shared/GameTitleScreen';
import { GameResultsScreen } from '../../_shared/GameResultsScreen';
import { GameUI } from '../../_shared/GameUI';
import MaidCafeGameScene from './MaidCafeGame';
import type { AssetManifest } from '@/app/components/games/GameAssetPreloader';

export default function MaidCafeManagerGame() {
  const [gameState, setGameState] = useState<GameState>('loading');
  const [gameResults, setGameResults] = useState<{
    score: number;
    money: number;
    level: number;
  } | null>(null);
  const [gameStats, setGameStats] = useState({
    score: 0,
    combo: 0,
    timer: undefined as number | undefined,
    progress: 0,
  });

  const gameAssets: AssetManifest = {
    // Add asset keys if available
  };

  const handleGameEnd = useCallback((results: { score: number; money: number; level: number }) => {
    setGameResults(results);
    setGameState('results');
  }, []);

  const handleGameStatsUpdate = useCallback((stats: { score: number; combo: number; timer?: number; progress: number }) => {
    setGameStats({
      score: stats.score,
      combo: stats.combo,
      timer: stats.timer ?? undefined,
      progress: stats.progress,
    });
  }, []);

  return (
    <GameStateMachine
      gameId="maid-cafe-manager"
      gameTitle="Maid Café Manager"
      assets={undefined}
      onStateChange={setGameState}
    >
      {(state, transitionTo) => {
        if (state === 'title') {
          return (
            <GameTitleScreen
              title="Maid Café Manager"
              description="Manage shifts and keep guests smiling."
              instructions={[
                'Serve customers at tables',
                'Take and fulfill orders',
                'Keep customers happy',
                'Earn money and level up',
              ]}
              onStart={() => transitionTo('playing')}
            />
          );
        }

        if (state === 'results' && gameResults) {
          return (
            <GameResultsScreen
              title="Maid Café Manager"
              score={gameResults.score}
              isWin={gameResults.score > 0}
              stats={[
                { label: 'Final Score', value: gameResults.score },
                { label: 'Money Earned', value: `$${gameResults.money}` },
                { label: 'Level Reached', value: gameResults.level },
              ]}
              onRestart={() => {
                setGameResults(null);
                setGameStats({ score: 0, combo: 0, timer: undefined, progress: 0 });
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
                milestone="Keep customers happy!"
              />
              <MaidCafeGameScene
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

