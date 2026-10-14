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
import BeatEmUpGame from './BeatEmUpGame';
import { getAsset } from '../../_shared/assets-resolver';
import type { AssetManifest } from '@/app/components/games/GameAssetPreloader';
import { useGameProgress } from '@/app/lib/games/progress';

type GameMode = 'story' | 'arcade' | 'survival';

interface OtakuBeatEmUpGameWrapperProps {
  mode: GameMode;
}

type BeatEmUpResult = GameSessionResult & {
  outcome: 'completed' | 'failed';
  score: number;
  wavesCleared: number;
  didWin: boolean;
};

export default function OtakuBeatEmUpGameWrapper({ mode }: OtakuBeatEmUpGameWrapperProps) {
  const router = useRouter();
  const session = useGameSession<BeatEmUpResult>({
    onExit: () => router.push('/mini-games'),
  });
  const { beginResultSession, recordResult } = useGameProgress();
  const startedAtRef = useRef(0);
  const hasSubmittedRef = useRef(false);
  const [gameResults, setGameResults] = useState<{
    score: number;
    wavesCleared: number;
    didWin: boolean;
  } | null>(null);
  const [gameStats, setGameStats] = useState({
    score: 0,
    health: 100,
    maxHealth: 100,
    combo: 0,
    wavesCleared: 0,
    progress: 0,
  });

  const gameAssets: AssetManifest = {
    images: [
      getAsset('otaku-beat-em-up', 'bg') || '',
      getAsset('otaku-beat-em-up', 'playerSprite') || '',
      getAsset('otaku-beat-em-up', 'enemySprite') || '',
    ].filter(Boolean),
    audio: [
      getAsset('otaku-beat-em-up', 'bgm') || '',
      getAsset('otaku-beat-em-up', 'hitSfx') || '',
      getAsset('otaku-beat-em-up', 'comboSfx') || '',
    ].filter(Boolean),
  };

  const handleGameEnd = useCallback(
    (score: number, didWin: boolean, wavesCleared: number) => {
      const result: BeatEmUpResult = {
        outcome: didWin ? 'completed' : 'failed',
        score,
        wavesCleared,
        didWin,
      };
      setGameResults(result);
      session.complete(result);

      if (!hasSubmittedRef.current) {
        hasSubmittedRef.current = true;
        void recordResult({
          gameId: 'otaku-beat-em-up',
          score,
          difficulty: mode,
          durationMs: startedAtRef.current ? Date.now() - startedAtRef.current : 0,
          didWin,
          metadata: { mode, wavesCleared },
        });
      }
    },
    [mode, recordResult, session.complete],
  );

  const handleGameStatsUpdate = useCallback((stats: { score: number; health: number; maxHealth: number; combo: number; wavesCleared: number; progress?: number }) => {
    setGameStats({
      score: stats.score,
      health: stats.health,
      maxHealth: stats.maxHealth,
      combo: stats.combo,
      wavesCleared: stats.wavesCleared,
      progress: stats.progress || 0,
    });
  }, []);

  const modeTitle = mode === 'story' ? 'Story Mode' : mode === 'arcade' ? 'Arcade Mode' : 'Survival Mode';
  const modeDescription = mode === 'story' 
    ? 'Fight through waves of enemies and boss battles'
    : mode === 'arcade'
    ? 'Classic beat-em-up action with rhythm scoring'
    : 'Face endless waves of enemies';

  const syncSession = useCallback(
    (state: GameState) => {
      if (state === 'loading' || state === 'boot') session.prepare();
      if (state === 'title') session.ready();
      if (state === 'playing') {
        beginResultSession('otaku-beat-em-up');
        startedAtRef.current = Date.now();
        hasSubmittedRef.current = false;
        session.start();
      }
    },
    [beginResultSession, session.prepare, session.ready, session.start],
  );

  return (
    <GameStateMachine
      gameId="otaku-beat-em-up"
      gameTitle={`Otaku Beat-Em-Up - ${modeTitle}`}
      assets={(gameAssets.images?.length ?? 0) > 0 || (gameAssets.audio?.length ?? 0) > 0 ? gameAssets : undefined}
      onStateChange={syncSession}
    >
      {(state, transitionTo) => {
        if (state === 'title') {
          return (
            <GameTitleScreen
              title={`Otaku Beat-Em-Up - ${modeTitle}`}
              description={modeDescription}
              instructions={[
                'WASD/Arrows to move',
                'Spacebar to attack (time with beat!)',
                'Shift to block',
                'Perfect timing = 2x damage multiplier',
                'Chain combos for higher scores',
              ]}
              onStart={() => transitionTo('playing')}
            />
          );
        }

        if (state === 'results' && gameResults) {
          return (
            <GameResultsScreen
              title={`Otaku Beat-Em-Up - ${modeTitle}`}
              score={gameResults.score}
              isWin={gameResults.didWin}
              stats={[
                { label: 'Final Score', value: gameResults.score },
                { label: 'Waves Cleared', value: gameResults.wavesCleared },
                { label: 'Result', value: gameResults.didWin ? 'Victory!' : 'Defeated' },
              ]}
              onRestart={() => {
                setGameResults(null);
                setGameStats({ score: 0, health: 100, maxHealth: 100, combo: 0, wavesCleared: 0, progress: 0 });
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
                lives={gameStats.health}
                progress={gameStats.progress}
                milestone={`Wave ${gameStats.wavesCleared}`}
              />
              <GamePlatformControls session={session} />
              <BeatEmUpGame
                mode={mode}
                paused={session.phase === 'paused'}
                onGameEnd={(score, didWin) => {
                  handleGameEnd(score, didWin, gameStats.wavesCleared);
                  transitionTo('results');
                }}
                onStatsUpdate={handleGameStatsUpdate}
              />
              <GamePlatformPause session={session} title="Otaku Beat-em-up" />
              <GameSessionAnnouncement session={session} />
            </>
          );
        }

        return null;
      }}
    </GameStateMachine>
  );
}

