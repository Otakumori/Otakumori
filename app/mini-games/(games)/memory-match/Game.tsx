'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { GameStateMachine, type GameState } from '../../_shared/GameStateMachine';
import {
  GamePlatformControls,
  GamePlatformPause,
  GameSessionAnnouncement,
} from '../../_shared/GamePlatform';
import { useGameSession, type GameSessionResult } from '../../_shared/GameSession';
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

type MemoryMatchResult = GameSessionResult & {
  outcome: 'completed';
  score: number;
  matches: number;
  moves: number;
  timeElapsed: number;
  didWin: boolean;
  perfectClear?: boolean;
  lowMoveClear?: boolean;
};

export default function MemoryMatchGameWrapper() {
  const router = useRouter();
  const session = useGameSession<MemoryMatchResult>({
    onExit: () => router.push('/mini-games'),
  });
  const [gameResults, setGameResults] = useState<MemoryMatchResult | null>(null);
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
      const completed: MemoryMatchResult = {
        ...results,
        outcome: 'completed',
        perfectClear: results.rewardIntent?.facts?.perfectClear,
        lowMoveClear: results.rewardIntent?.facts?.lowMoveClear,
      };
      setGameResults(completed);
      session.complete(completed);
    },
    [session.complete],
  );

  const syncSession = useCallback(
    (state: GameState) => {
      if (state === 'loading' || state === 'boot') session.prepare();
      if (state === 'title') session.ready();
      if (state === 'playing') session.start();
    },
    [session.prepare, session.ready, session.start],
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
      onStateChange={syncSession}
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
                session.restart();
                transitionTo('title');
              }}
              onBack={session.exit}
            />
          );
        }

        if (state === 'playing') {
          return (
            <>
              <MemoryMatchGame
                paused={session.phase === 'paused'}
                onPauseChange={(paused) => (paused ? session.pause() : session.resume())}
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
              <GamePlatformControls session={session} showPause={false} />
              <GamePlatformPause session={session} title="Memory Keeper" />
              <GameSessionAnnouncement session={session} />
            </>
          );
        }

        return null;
      }}
    </GameStateMachine>
  );
}
