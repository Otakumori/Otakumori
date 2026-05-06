'use client';

import { useState, useCallback } from 'react';
import { GameStateMachine, type GameState } from '../../_shared/GameStateMachine';
import { GameTitleScreen } from '../../_shared/GameTitleScreen';
import { GameResultsScreen } from '../../_shared/GameResultsScreen';
import { GameUI } from '../../_shared/GameUI';
import ThighChaseGame from './ThighChaseGame';
import { getAsset } from '../../_shared/assets-resolver';
import type { AssetManifest } from '@/app/components/games/GameAssetPreloader';

export default function ThighColiseumGameWrapper() {
  const [gameState, setGameState] = useState<GameState>('loading');
  const [gameResults, setGameResults] = useState<{
    score: number;
    stage: number;
    didWin: boolean;
  } | null>(null);
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

  const handleGameEnd = useCallback((score: number, didWin: boolean, stage: number) => {
    setGameResults({ score, stage, didWin });
    setGameState('results');
  }, []);

  const handleGameStatsUpdate = useCallback((stats: { score: number; lives: number; stage: number; progress?: number }) => {
    setGameStats({
      score: stats.score,
      lives: stats.lives,
      stage: stats.stage,
      progress: stats.progress || 0,
    });
  }, []);

  return (
    <GameStateMachine
      gameId="thigh-coliseum"
      gameTitle="Thigh Coliseum"
      assets={(gameAssets.images?.length ?? 0) > 0 || (gameAssets.audio?.length ?? 0) > 0 ? gameAssets : undefined}
      onStateChange={setGameState}
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
                lives={gameStats.lives}
                progress={gameStats.progress}
                milestone={`Stage ${gameStats.stage}`}
              />
              <ThighChaseGame
                onGameEnd={(score, didWin) => handleGameEnd(score, didWin, gameStats.stage)}
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

