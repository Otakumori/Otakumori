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
  const [_gameState, setGameState] = useState<GameState>('loading');
  const [gameResults, setGameResults] = useState<{
    score: number;
    matches: number;
    moves: number;
    timeElapsed: number;
    didWin: boolean;
    perfectClear?: boolean;
    lowMoveClear?: boolean;
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

  const handleGameEnd = useCallback((results: {
    score: number;
    matches: number;
    moves: number;
    timeElapsed: number;
    didWin: boolean;
    rewardIntent?: { facts?: { perfectClear?: boolean; lowMoveClear?: boolean } } | null;
  }) => {
    setGameResults({
      ...results,
      perfectClear: results.rewardIntent?.facts?.perfectClear,
      lowMoveClear: results.rewardIntent?.facts?.lowMoveClear,
    });
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
      gameId="memory-match"
      gameTitle="Memory Card / Defrag"
      assets={(gameAssets.images?.length ?? 0) > 0 || (gameAssets.audio?.length ?? 0) > 0 ? gameAssets : undefined}
      onStateChange={setGameState}
    >
      {(state, transitionTo) => {
        if (state === 'title') {
          return (
            <GameTitleScreen
              title="Memory Card / Defrag"
              description="Restore paired relic fragments before the archive cools."
              instructions={[
                'Reveal two memory cards to find a matching relic pair',
                'Arrow keys move across the board, Enter or Space reveals',
                'Mismatches briefly lock input before concealing again',
                'Fewer moves, faster clears, and clean streaks improve score',
              ]}
              onStart={() => transitionTo('playing')}
            />
          );
        }

        if (state === 'results' && gameResults) {
          return (
            <GameResultsScreen
              title="Memory Card / Defrag"
              score={gameResults.score}
              isWin={gameResults.didWin}
              stats={[
                { label: 'Final Score', value: gameResults.score },
                { label: 'Matches', value: gameResults.matches },
                { label: 'Moves', value: gameResults.moves },
                { label: 'Time', value: `${Math.floor(gameResults.timeElapsed / 60)}:${(gameResults.timeElapsed % 60).toString().padStart(2, '0')}` },
                { label: 'Perfect', value: gameResults.perfectClear ? 'Yes' : 'No' },
                { label: 'Low Move', value: gameResults.lowMoveClear ? 'Yes' : 'No' },
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
                onGameEnd={(results) => {
                  handleGameEnd(results);
                  transitionTo('results');
                }}
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
