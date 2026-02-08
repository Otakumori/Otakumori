'use client';

import { useState, useCallback } from 'react';
import { GameStateMachine, type GameState } from '../../_shared/GameStateMachine';
import { GameTitleScreen } from '../../_shared/GameTitleScreen';
import { GameResultsScreen } from '../../_shared/GameResultsScreen';
import { GameUI } from '../../_shared/GameUI';
import QuickMathScene from './Scene';
import { getAsset } from '../../_shared/assets-resolver';
import type { AssetManifest } from '@/app/components/games/GameAssetPreloader';

export default function QuickMathGame() {
  const [gameState, setGameState] = useState<GameState>('loading');
  const [gameResults, setGameResults] = useState<{
    score: number;
    correct: number;
    wrong: number;
    maxStreak: number;
  } | null>(null);
  const [gameStats, setGameStats] = useState({
    score: 0,
    combo: 0,
    timer: 60,
    progress: 0,
  });

  const gameAssets: AssetManifest = {
    audio: [
      getAsset('quick-math', 'tickSfx') || '',
      getAsset('quick-math', 'successSfx') || '',
      getAsset('quick-math', 'failSfx') || '',
    ].filter(Boolean),
  };

  const handleGameEnd = useCallback((results: { score: number; correct: number; wrong: number; maxStreak: number }) => {
    setGameResults(results);
    setGameState('results');
  }, []);

  const handleGameStatsUpdate = useCallback((stats: { score: number; combo: number; timer: number; progress: number }) => {
    setGameStats(stats);
  }, []);

  return (
    <GameStateMachine
      gameId="quick-math"
      gameTitle="Quick Math"
      assets={gameAssets.audio.length > 0 ? gameAssets : undefined}
      onStateChange={setGameState}
    >
      {(state, transitionTo) => {
        if (state === 'title') {
          return (
            <GameTitleScreen
              title="Quick Math"
              description="Answer fast. Pressure builds with each correct streak."
              instructions={[
                'Answer math questions quickly',
                'Build streaks for higher scores',
                'Time pressure increases with difficulty',
                'Survive 60 seconds',
              ]}
              onStart={() => transitionTo('playing')}
            />
          );
        }

        if (state === 'results' && gameResults) {
          return (
            <GameResultsScreen
              title="Quick Math"
              score={gameResults.score}
              isWin={gameResults.score > 0}
              stats={[
                { label: 'Correct', value: gameResults.correct },
                { label: 'Wrong', value: gameResults.wrong },
                { label: 'Max Streak', value: gameResults.maxStreak },
                { label: 'Accuracy', value: `${gameResults.correct > 0 ? Math.round((gameResults.correct / (gameResults.correct + gameResults.wrong)) * 100) : 0}%` },
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
                milestone="Solve quickly!"
              />
              <QuickMathScene
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

