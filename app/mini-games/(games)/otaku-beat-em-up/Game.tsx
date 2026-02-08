'use client';

import { useState, useCallback } from 'react';
import { GameStateMachine, type GameState } from '../../_shared/GameStateMachine';
import { GameTitleScreen } from '../../_shared/GameTitleScreen';
import { GameResultsScreen } from '../../_shared/GameResultsScreen';
import { GameUI } from '../../_shared/GameUI';
import BeatEmUpGame from './BeatEmUpGame';
import { getAsset } from '../../_shared/assets-resolver';
import type { AssetManifest } from '@/app/components/games/GameAssetPreloader';

type GameMode = 'story' | 'arcade' | 'survival';

interface OtakuBeatEmUpGameWrapperProps {
  mode: GameMode;
}

export default function OtakuBeatEmUpGameWrapper({ mode }: OtakuBeatEmUpGameWrapperProps) {
  const [gameState, setGameState] = useState<GameState>('loading');
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

  const handleGameEnd = useCallback((score: number, didWin: boolean, wavesCleared: number) => {
    setGameResults({ score, wavesCleared, didWin });
    setGameState('results');
  }, []);

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

  return (
    <GameStateMachine
      gameId="otaku-beat-em-up"
      gameTitle={`Otaku Beat-Em-Up - ${modeTitle}`}
      assets={gameAssets.images.length > 0 || gameAssets.audio.length > 0 ? gameAssets : undefined}
      onStateChange={setGameState}
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
                lives={gameStats.health}
                progress={gameStats.progress}
                milestone={`Wave ${gameStats.wavesCleared}`}
              />
              <BeatEmUpGame
                mode={mode}
                onGameEnd={(score, didWin) => handleGameEnd(score, didWin, gameStats.wavesCleared)}
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

