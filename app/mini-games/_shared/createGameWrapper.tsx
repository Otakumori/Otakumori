/**
 * Helper function to create a standardized game wrapper
 * This can be used as a template for all games
 */

import { useState, useCallback } from 'react';
import { GameStateMachine, type GameState } from './GameStateMachine';
import { GameTitleScreen } from './GameTitleScreen';
import { GameResultsScreen } from './GameResultsScreen';
import { GameUI } from './GameUI';
import type { AssetManifest } from '@/app/components/games/GameAssetPreloader';
import { getAsset } from './assets-resolver';

export interface GameWrapperConfig {
  gameId: string;
  gameTitle: string;
  description: string;
  instructions: string[];
  assetKeys?: {
    images?: string[];
    audio?: string[];
  };
}

export function createGameWrapper<T extends Record<string, any>>(
  config: GameWrapperConfig,
  GameComponent: React.ComponentType<T & {
    onGameEnd?: (results: any) => void;
    onStatsUpdate?: (stats: { score: number; combo: number; timer?: number; lives?: number; progress?: number }) => void;
  }>,
  defaultProps?: Partial<T>
) {
  return function GameWrapper(props: T) {
    const [gameState, setGameState] = useState<GameState>('loading');
    const [gameResults, setGameResults] = useState<any>(null);
    const [gameStats, setGameStats] = useState({
      score: 0,
      combo: 0,
      timer: undefined as number | undefined,
      lives: undefined as number | undefined,
      progress: 0,
    });

    // Collect assets for preloading
    const gameAssets: AssetManifest = {
      images: config.assetKeys?.images?.map(key => getAsset(config.gameId, key)).filter(Boolean) || [],
      audio: config.assetKeys?.audio?.map(key => getAsset(config.gameId, key)).filter(Boolean) || [],
    };

    const handleGameEnd = useCallback((results: any) => {
      setGameResults(results);
      setGameState('results');
    }, []);

    const handleGameStatsUpdate = useCallback((stats: { score: number; combo: number; timer?: number; lives?: number; progress?: number }) => {
      setGameStats(stats);
    }, []);

    return (
      <GameStateMachine
        gameId={config.gameId}
        gameTitle={config.gameTitle}
        assets={gameAssets.images.length > 0 || gameAssets.audio.length > 0 ? gameAssets : undefined}
        onStateChange={setGameState}
      >
        {(state, transitionTo) => {
          if (state === 'title') {
            return (
              <GameTitleScreen
                title={config.gameTitle}
                description={config.description}
                instructions={config.instructions}
                onStart={() => transitionTo('playing')}
              />
            );
          }

          if (state === 'results' && gameResults) {
            const isWin = gameResults.score > 0 || gameResults.didWin !== false;
            const stats = [
              { label: 'Score', value: gameResults.score || 0 },
              ...(gameResults.hits !== undefined ? [{ label: 'Hits', value: gameResults.hits }] : []),
              ...(gameResults.matches !== undefined ? [{ label: 'Matches', value: gameResults.matches }] : []),
              ...(gameResults.moves !== undefined ? [{ label: 'Moves', value: gameResults.moves }] : []),
            ];

            return (
              <GameResultsScreen
                title={config.gameTitle}
                score={gameResults.score || 0}
                isWin={isWin}
                stats={stats}
                onRestart={() => {
                  setGameResults(null);
                  setGameStats({ score: 0, combo: 0, timer: undefined, lives: undefined, progress: 0 });
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
                />
                <GameComponent
                  {...defaultProps}
                  {...props}
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
  };
}

