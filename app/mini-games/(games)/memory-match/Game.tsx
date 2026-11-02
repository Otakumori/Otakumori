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
import { useGameProgress } from '@/app/lib/games/progress';
import type { PersonalBestResult } from '@/app/lib/games/progress';
import type { MemoryDefragChallenge } from './MemoryMatchGame';
import type { MemoryDefragDifficulty } from './memoryDefragEngine';

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
  difficulty: MemoryDefragDifficulty;
  challenge: MemoryDefragChallenge;
  personalBest?: PersonalBestResult;
};

export default function MemoryMatchGameWrapper() {
  const router = useRouter();
  const session = useGameSession<MemoryMatchResult>({
    onExit: () => router.push('/mini-games'),
  });
  const [gameResults, setGameResults] = useState<MemoryMatchResult | null>(null);
  const resultTimeoutRef = useRef<number | null>(null);
  const completionSubmittedRef = useRef(false);
  const startedAtRef = useRef(0);
  const { beginResultSession, recordResult } = useGameProgress();

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
      difficulty: MemoryDefragDifficulty;
      challenge: MemoryDefragChallenge;
      rewardIntent?: { facts?: { perfectClear?: boolean; lowMoveClear?: boolean } } | null;
      achievementIntent?: { facts?: string[] } | null;
    }) => {
      if (completionSubmittedRef.current) return;
      completionSubmittedRef.current = true;
      const completed: MemoryMatchResult = {
        ...results,
        outcome: 'completed',
        perfectClear: results.rewardIntent?.facts?.perfectClear,
        lowMoveClear: results.rewardIntent?.facts?.lowMoveClear,
      };
      setGameResults(completed);
      session.complete(completed);
      void recordResult({
        gameId: 'memory-match',
        resultKey: `${results.difficulty}:${results.challenge}`,
        score: results.score,
        difficulty: results.difficulty,
        durationMs: startedAtRef.current > 0 ? Date.now() - startedAtRef.current : 0,
        didWin: results.didWin,
        metadata: {
          matches: results.matches,
          moves: results.moves,
          timeElapsed: results.timeElapsed,
          perfectClear: results.rewardIntent?.facts?.perfectClear,
          lowMoveClear: results.rewardIntent?.facts?.lowMoveClear,
          achievementFacts: results.achievementIntent?.facts ?? [],
          difficulty: results.difficulty,
          mode: results.challenge,
        },
      }).then((progress) => {
        setGameResults((current) =>
          current ? { ...current, personalBest: progress.personalBest } : current,
        );
      });
    },
    [recordResult, session.complete],
  );

  const syncSession = useCallback(
    (state: GameState) => {
      if (state === 'loading' || state === 'boot') session.prepare();
      if (state === 'title') session.ready();
      if (state === 'playing') {
        completionSubmittedRef.current = false;
        startedAtRef.current = Date.now();
        beginResultSession('memory-match');
        session.start();
      }
    },
    [beginResultSession, session.prepare, session.ready, session.start],
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
              difficulty={gameResults.difficulty}
              challenge={gameResults.challenge}
              personalBest={gameResults.personalBest}
              onRestart={() => {
                setGameResults(null);
                completionSubmittedRef.current = false;
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
