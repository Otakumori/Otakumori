'use client';

import { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GameStateMachine, type GameState } from '../../_shared/GameStateMachine';
import { GameResultsScreen } from '../../_shared/GameResultsScreen';
import {
  GamePlatformHud,
  GamePlatformPause,
  GameSessionAnnouncement,
} from '../../_shared/GamePlatform';
import { useGameSession, type GameSessionResult } from '../../_shared/GameSession';
import Game from './Game';
import { getAsset } from '../../_shared/assets-resolver';
import type { AssetManifest } from '@/app/components/games/GameAssetPreloader';
import { MoriButton, MoriStatus } from '@/app/components/mori/MoriFoundation';
import { MoriGameThreshold } from '@/app/components/mori/MoriGameSystem';
import { MoriArtifact } from '@/app/components/mori/MoriProduction';
import { useGameProgress, type PersonalBestResult } from '@/app/lib/games/progress';

interface PetalSamuraiGameWrapperProps {
  mode?: PetalSamuraiMode;
  difficulty?: PetalSamuraiDifficulty;
}

type PetalSamuraiMode = 'endless' | 'timed';
type PetalSamuraiDifficulty = 'easy' | 'normal' | 'hard';

const MODES: Array<{ value: PetalSamuraiMode; label: string; description: string }> = [
  { value: 'timed', label: 'Timed', description: 'Survive the sixty-second ritual.' },
  { value: 'endless', label: 'Endless', description: 'Continue until three petals escape.' },
];

const DIFFICULTIES: Array<{ value: PetalSamuraiDifficulty; label: string }> = [
  { value: 'easy', label: 'Initiate' },
  { value: 'normal', label: 'Samurai' },
  { value: 'hard', label: 'Ronin' },
];

type PetalSamuraiResult = GameSessionResult & {
  outcome: 'completed';
  score: number;
  combo: number;
  misses: number;
  didWin: boolean;
  durationMs: number;
  multiplier: number;
  stormMode: boolean;
  personalBest?: PersonalBestResult;
};

export default function PetalSamuraiGameWrapper({
  mode = 'timed',
  difficulty = 'normal',
}: PetalSamuraiGameWrapperProps) {
  const router = useRouter();
  const session = useGameSession<PetalSamuraiResult>({
    onExit: () => router.push('/mini-games'),
  });
  const [gameResults, setGameResults] = useState<PetalSamuraiResult | null>(null);
  const [selectedMode, setSelectedMode] = useState<PetalSamuraiMode>(mode);
  const [selectedDifficulty, setSelectedDifficulty] = useState<PetalSamuraiDifficulty>(difficulty);
  const startedAtRef = useRef(0);
  const submittedRef = useRef(false);
  const { beginResultSession, recordResult } = useGameProgress();
  const [gameStats, setGameStats] = useState({
    score: 0,
    combo: 0,
    timer: 60,
    progress: 0,
    lives: 3,
  });

  const gameAssets: AssetManifest = {
    images: [
      getAsset('petal-samurai', 'bg') || '',
      getAsset('petal-samurai', 'spriteSheet') || '',
    ].filter(Boolean),
    audio: [
      getAsset('petal-samurai', 'sliceSfx') || '',
      getAsset('petal-samurai', 'comboSfx') || '',
    ].filter(Boolean),
  };

  const handleGameEnd = useCallback(
    (results: Omit<PetalSamuraiResult, 'outcome' | 'personalBest'>) => {
      if (submittedRef.current) return;
      submittedRef.current = true;
      const completed: PetalSamuraiResult = { ...results, outcome: 'completed' };
      setGameResults(completed);
      session.complete(completed);
      void recordResult({
        gameId: 'petal-samurai',
        resultKey: `${selectedMode}:${selectedDifficulty}`,
        score: results.score,
        difficulty: selectedDifficulty,
        durationMs:
          results.durationMs || (startedAtRef.current ? Date.now() - startedAtRef.current : 0),
        didWin: results.didWin,
        metadata: {
          combo: results.combo,
          misses: results.misses,
          mode: selectedMode,
          difficulty: selectedDifficulty,
          multiplier: results.multiplier,
          stormMode: results.stormMode,
        },
      }).then((progress) => {
        setGameResults((current) =>
          current ? { ...current, personalBest: progress.personalBest } : current,
        );
      });
    },
    [recordResult, selectedDifficulty, selectedMode, session.complete],
  );

  const handleGameStatsUpdate = useCallback(
    (stats: { score: number; combo: number; timer: number; progress: number; lives?: number }) => {
      setGameStats({
        score: stats.score,
        combo: stats.combo,
        timer: stats.timer,
        progress: stats.progress,
        lives: stats.lives ?? 3,
      });
    },
    [],
  );

  const syncSession = useCallback(
    (state: GameState) => {
      if (state === 'loading' || state === 'boot') session.prepare();
      if (state === 'title') session.ready();
      if (state === 'playing') {
        beginResultSession('petal-samurai');
        startedAtRef.current = Date.now();
        submittedRef.current = false;
        session.start();
      }
    },
    [beginResultSession, session.prepare, session.ready, session.start],
  );

  return (
    <GameStateMachine
      gameId="petal-samurai"
      gameTitle="Petal Samurai"
      assets={
        (gameAssets.images?.length ?? 0) > 0 || (gameAssets.audio?.length ?? 0) > 0
          ? gameAssets
          : undefined
      }
      onStateChange={syncSession}
    >
      {(state, transitionTo) => {
        if (state === 'title') {
          return (
            <PetalSamuraiTitleScreen
              difficulty={selectedDifficulty}
              mode={selectedMode}
              onDifficultyChange={setSelectedDifficulty}
              onModeChange={setSelectedMode}
              onStart={() => transitionTo('playing')}
            />
          );
        }

        if (state === 'results' && gameResults) {
          return (
            <GameResultsScreen
              title="Petal Samurai"
              score={gameResults.score}
              isWin={gameResults.didWin}
              personalBest={gameResults.personalBest}
              stats={[
                { label: 'Final Score', value: gameResults.score },
                { label: 'Max Combo', value: gameResults.combo },
                { label: 'Misses', value: gameResults.misses },
                {
                  label: 'Ritual',
                  value: selectedMode === 'timed' ? 'Timed' : 'Endless',
                },
                {
                  label: 'Discipline',
                  value:
                    DIFFICULTIES.find((item) => item.value === selectedDifficulty)?.label ??
                    selectedDifficulty,
                },
              ]}
              onRestart={() => {
                setGameResults(null);
                submittedRef.current = false;
                setGameStats({ score: 0, combo: 0, timer: 60, progress: 0, lives: 3 });
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
              <GamePlatformHud
                metrics={[
                  { label: 'Score', value: gameStats.score.toLocaleString() },
                  ...(gameStats.combo > 0
                    ? [
                        {
                          label: 'Combo',
                          value: `${gameStats.combo}x`,
                          emphasis: 'selected' as const,
                        },
                      ]
                    : []),
                  { label: 'Time', value: selectedMode === 'endless' ? '∞' : gameStats.timer },
                  { label: 'Lives', value: gameStats.lives },
                ]}
                progress={gameStats.progress}
                progressLabel="Run progress"
                session={session}
              />
              <Game
                mode={selectedMode}
                difficulty={selectedDifficulty}
                paused={session.phase === 'paused'}
                onGameEnd={(results) => {
                  handleGameEnd(results);
                  transitionTo('results');
                }}
                onStatsUpdate={handleGameStatsUpdate}
              />
              <GamePlatformPause session={session} title="Petal Samurai" />
              <GameSessionAnnouncement session={session} />
            </>
          );
        }

        return null;
      }}
    </GameStateMachine>
  );
}

function PetalSamuraiTitleScreen({
  difficulty,
  mode,
  onDifficultyChange,
  onModeChange,
  onStart,
}: {
  difficulty: PetalSamuraiDifficulty;
  mode: PetalSamuraiMode;
  onDifficultyChange: (difficulty: PetalSamuraiDifficulty) => void;
  onModeChange: (mode: PetalSamuraiMode) => void;
  onStart: () => void;
}) {
  const activeMode = MODES.find((item) => item.value === mode) ?? MODES[0];

  return (
    <MoriGameThreshold className="game-threshold-screen" label="Petal Samurai launch threshold">
      <MoriArtifact className="game-threshold-panel game-threshold-panel--launch" family="game">
        <figure className="game-threshold-focal" data-has-artwork="false">
          <span aria-hidden="true" className="game-threshold-focal__orbit" />
          <span aria-hidden="true" className="game-threshold-focal__monogram">
            PS
          </span>
        </figure>

        <div className="game-threshold-launch-copy">
          <div className="game-threshold-readiness" aria-label="Game readiness">
            <MoriStatus tone="success">Ready</MoriStatus>
            <span>Pointer / touch</span>
          </div>
          <div className="game-threshold-panel__copy">
            <h1>Petal Samurai</h1>
            <p>Slice falling petals with precision. Chain clean cuts for stronger multipliers.</p>
          </div>

          <fieldset className="game-threshold-instructions">
            <legend>Choose ritual</legend>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Ritual mode">
              {MODES.map((item) => (
                <MoriButton
                  key={item.value}
                  aria-pressed={mode === item.value}
                  onClick={() => onModeChange(item.value)}
                  variant={mode === item.value ? 'primary' : 'secondary'}
                >
                  {item.label}
                </MoriButton>
              ))}
            </div>
            <p>{activeMode.description}</p>
          </fieldset>

          <fieldset className="game-threshold-instructions">
            <legend>Choose discipline</legend>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Difficulty">
              {DIFFICULTIES.map((item) => (
                <MoriButton
                  key={item.value}
                  aria-pressed={difficulty === item.value}
                  onClick={() => onDifficultyChange(item.value)}
                  variant={difficulty === item.value ? 'primary' : 'secondary'}
                >
                  {item.label}
                </MoriButton>
              ))}
            </div>
          </fieldset>

          <section
            aria-labelledby="petal-samurai-instructions"
            className="game-threshold-instructions"
          >
            <h2 id="petal-samurai-instructions">How to play</h2>
            <ol>
              <li>
                <span aria-hidden="true">01</span>
                <span>Drag or swipe across petals; avoid the dark hazards.</span>
              </li>
              <li>
                <span aria-hidden="true">02</span>
                <span>Chain clean slices. Three escaped petals end the ritual.</span>
              </li>
            </ol>
          </section>

          <div className="game-threshold-actions game-threshold-actions--launch">
            <MoriButton onClick={onStart}>Begin ritual</MoriButton>
            <Link
              className="mori-foundation-button"
              data-mori-variant="secondary"
              href="/mini-games"
            >
              Return to Mini-Games
            </Link>
          </div>
        </div>
      </MoriArtifact>
    </MoriGameThreshold>
  );
}
