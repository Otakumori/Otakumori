'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { GameStateMachine, type GameState } from '../../_shared/GameStateMachine';
import { GameTitleScreen } from '../../_shared/GameTitleScreen';
import { GameResultsScreen } from '../../_shared/GameResultsScreen';
import { GameUI } from '../../_shared/GameUI';
import {
  GamePlatformControls,
  GamePlatformPause,
  GameSessionAnnouncement,
} from '../../_shared/GamePlatform';
import { useGameSession, type GameSessionResult } from '../../_shared/GameSession';
import MaidCafeGameScene from './MaidCafeGame';

type MaidCafeResult = GameSessionResult & {
    score: number;
    money: number;
    level: number;
};

export default function MaidCafeManagerGame() {
  const router = useRouter();
  const saveBeforeExitRef = useRef<() => void>(() => {});
  const session = useGameSession<MaidCafeResult>({
    onExit: () => {
      saveBeforeExitRef.current();
      router.push('/mini-games');
    },
  });
  const [gameResults, setGameResults] = useState<MaidCafeResult | null>(null);
  const [gameStats, setGameStats] = useState({
    score: 0,
    combo: 0,
    timer: undefined as number | undefined,
    progress: 0,
  });

  const handleGameEnd = useCallback((results: { score: number; money: number; level: number }) => {
    const result: MaidCafeResult = { ...results, outcome: 'completed' };
    setGameResults(result);
    session.complete(result);
  }, [session.complete]);

  const handleGameStatsUpdate = useCallback((stats: { score: number; combo: number; timer?: number; progress: number }) => {
    setGameStats({
      score: stats.score,
      combo: stats.combo,
      timer: stats.timer ?? undefined,
      progress: stats.progress,
    });
  }, []);

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
      gameId="maid-cafe-manager"
      gameTitle="Maid Café Manager"
      assets={undefined}
      onStateChange={syncSession}
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
              <GameUI
                score={gameStats.score}
                combo={gameStats.combo}
                timer={gameStats.timer}
                progress={gameStats.progress}
                milestone="Keep customers happy!"
              />
              <MaidCafeGameScene
                paused={session.phase === 'paused'}
                onPauseChange={(isPaused) => (isPaused ? session.pause() : session.resume())}
                onExitSaveReady={(save) => {
                  saveBeforeExitRef.current = save;
                }}
                onGameEnd={(results) => {
                  handleGameEnd(results);
                  transitionTo('results');
                }}
                onStatsUpdate={handleGameStatsUpdate}
              />
              <GamePlatformControls belowNavigation session={session} />
              <GamePlatformPause session={session} title="Maid Café Manager" />
              <GameSessionAnnouncement session={session} />
            </>
          );
        }

        return null;
      }}
    </GameStateMachine>
  );
}

