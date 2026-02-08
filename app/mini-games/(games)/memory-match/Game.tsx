'use client';

import { useState, useCallback } from 'react';
import { GameStateMachine, type GameState } from '../../_shared/GameStateMachine';
import { GameTitleScreen } from '../../_shared/GameTitleScreen';
import { GameResultsScreen } from '../../_shared/GameResultsScreen';
import { GameUI } from '../../_shared/GameUI';
import MemoryMatchGame from './MemoryMatchGame';
import { getAsset } from '../../_shared/assets-resolver';
import type { AssetManifest } from '@/app/components/games/GameAssetPreloader';

export default function MemoryMatchGameWrapper() {
  const [gameState, setGameState] = useState<GameState>('loading');
  const [gameResults, setGameResults] = useState<{
    score: number;
    matches: number;
    moves: number;
    timeElapsed: number;
    didWin: boolean;
  } | null>(null);
  const [gameStats, setGameStats] = useState({
    score: 0,
    combo: 0,
    timer: undefined as number | undefined,
    progress: 0,
  });

  const gameAssets: AssetManifest = {
    images: [
      getAsset('memory-match', 'cardBack') || '',
    ].filter(Boolean),
    audio: [
      getAsset('memory-match', 'flipSfx') || '',
      getAsset('memory-match', 'matchSfx') || '',
      getAsset('memory-match', 'mismatchSfx') || '',
      getAsset('memory-match', 'successSfx') || '',
    ].filter(Boolean),
  };

  const handleGameEnd = useCallback((results: { score: number; matches: number; moves: number; timeElapsed: number; didWin: boolean }) => {
    setGameResults(results);
    setGameState('results');
  }, []);

  const handleGameStatsUpdate = useCallback((stats: { score: number; combo: number; timer?: number; progress: number }) => {
    setGameStats(stats);
  }, []);

  return (
    <GameStateMachine
      gameId="memory-match"
      gameTitle="Memory Match"
      assets={gameAssets.images.length > 0 || gameAssets.audio.length > 0 ? gameAssets : undefined}
      onStateChange={setGameState}
    >
      {(state, transitionTo) => {
        if (state === 'title') {
          return (
            <GameTitleScreen
              title="Memory Match"
              description="Recall the faces bound by fate."
              instructions={[
                'Flip cards to find matching pairs',
                'Remember card positions',
                'Match all pairs to win',
                'Fewer moves = higher score',
              ]}
              onStart={() => transitionTo('playing')}
            />
          );
        }

        if (state === 'results' && gameResults) {
          return (
            <GameResultsScreen
              title="Memory Match"
              score={gameResults.score}
              isWin={gameResults.didWin}
              stats={[
                { label: 'Final Score', value: gameResults.score },
                { label: 'Matches', value: gameResults.matches },
                { label: 'Moves', value: gameResults.moves },
                { label: 'Time', value: `${Math.floor(gameResults.timeElapsed / 60)}:${(gameResults.timeElapsed % 60).toString().padStart(2, '0')}` },
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
                milestone="Match those pairs!"
              />
              <MemoryMatchGame
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
