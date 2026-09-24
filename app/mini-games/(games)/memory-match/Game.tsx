'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { GameStateMachine, type GameState } from '../../_shared/GameStateMachine';
import MemoryMatchGame from './MemoryMatchGame';
import { MemoryDefragResultsScreen, MemoryDefragTitleScreen } from './MemoryDefragScreens';
import type { AssetManifest } from '@/app/components/games/GameAssetPreloader';

const MEMORY_DEFRAG_AUDIO = [
  '/assets/sounds/runic-reveal.mp3',
  '/assets/sfx/success.ogg',
  '/assets/sfx/miss.ogg',
  '/assets/sfx/pop.ogg',
];

const MEMORY_KEEPER_CRITICAL_IMAGES = [
  '/assets/mini-games/memory-defrag/keeper/reliquary-background.webp',
  '/assets/mini-games/memory-defrag/keeper/keeper-layer.webp',
];

const RESULT_HANDOFF_MS = 1100;

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
  const resultTimeoutRef = useRef<number | null>(null);

  const gameAssets: AssetManifest = {
    images: MEMORY_KEEPER_CRITICAL_IMAGES,
    audio: MEMORY_DEFRAG_AUDIO,
  };

  useEffect(() => {
    return () => {
      if (resultTimeoutRef.current !== null) {
        window.clearTimeout(resultTimeoutRef.current);
      }
    };
  }, []);

  const handleGameEnd = useCallback(
    (results: {
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
    },
    [],
  );

  return (
    <GameStateMachine
      gameId="memory-match"
      gameTitle="Memory Card / Defrag"
      assets={
        (gameAssets.images?.length ?? 0) > 0 || (gameAssets.audio?.length ?? 0) > 0
          ? gameAssets
          : undefined
      }
      onStateChange={setGameState}
    >
      {(state, transitionTo) => {
        if (state === 'title') {
          return <MemoryDefragTitleScreen onStart={() => transitionTo('playing')} />;
        }

        if (state === 'results' && gameResults) {
          return (
            <MemoryDefragResultsScreen
              score={gameResults.score}
              matches={gameResults.matches}
              moves={gameResults.moves}
              timeElapsed={gameResults.timeElapsed}
              didWin={gameResults.didWin}
              perfectClear={gameResults.perfectClear}
              lowMoveClear={gameResults.lowMoveClear}
              onRestart={() => {
                setGameResults(null);
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
            <MemoryMatchGame
              onGameEnd={(results) => {
                handleGameEnd(results);
                if (resultTimeoutRef.current !== null) {
                  window.clearTimeout(resultTimeoutRef.current);
                }
                resultTimeoutRef.current = window.setTimeout(() => {
                  transitionTo('results');
                }, RESULT_HANDOFF_MS);
              }}
            />
          );
        }

        return null;
      }}
    </GameStateMachine>
  );
}
