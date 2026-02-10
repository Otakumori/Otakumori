'use client';

import { useState, useCallback } from 'react';
import { GameStateMachine, type GameState } from '../../_shared/GameStateMachine';
import { GameTitleScreen } from '../../_shared/GameTitleScreen';
import { GameResultsScreen } from '../../_shared/GameResultsScreen';
import { GameUI } from '../../_shared/GameUI';
import PetalStormRhythmGame from './PetalStormRhythmGame';
import { getAsset } from '../../_shared/assets-resolver';
import type { AssetManifest } from '@/app/components/games/GameAssetPreloader';

interface Track {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  duration: number;
  difficulty: 'easy' | 'normal' | 'hard' | 'expert';
  notes: any[];
  preview?: string;
}

interface PetalStormRhythmGameWrapperProps {
  track: Track;
}

export default function PetalStormRhythmGameWrapper({ track }: PetalStormRhythmGameWrapperProps) {
  const [gameState, setGameState] = useState<GameState>('loading');
  const [gameResults, setGameResults] = useState<{
    score: number;
    accuracy: number;
    maxCombo: number;
    didWin: boolean;
  } | null>(null);
  const [gameStats, setGameStats] = useState({
    score: 0,
    health: 100,
    maxHealth: 100,
    combo: 0,
    progress: 0,
  });

  const gameAssets: AssetManifest = {
    images: [
      getAsset('petal-storm-rhythm', 'bg') || '',
    ].filter(Boolean),
    audio: [
      getAsset('petal-storm-rhythm', 'bgm') || '',
      getAsset('petal-storm-rhythm', 'hitSfx') || '',
    ].filter(Boolean),
  };

  const handleGameEnd = useCallback((score: number, didWin: boolean, accuracy: number, maxCombo: number) => {
    setGameResults({ score, accuracy, maxCombo, didWin });
    setGameState('results');
  }, []);

  const handleGameStatsUpdate = useCallback((stats: { score: number; health: number; maxHealth: number; combo: number; progress?: number }) => {
    setGameStats({
      score: stats.score,
      health: stats.health,
      maxHealth: stats.maxHealth,
      combo: stats.combo,
      progress: stats.progress || 0,
    });
  }, []);

  return (
    <GameStateMachine
      gameId="petal-storm-rhythm"
      gameTitle={`Petal Storm Rhythm - ${track.title}`}
      assets={(gameAssets.images?.length ?? 0) > 0 || (gameAssets.audio?.length ?? 0) > 0 ? gameAssets : undefined}
      onStateChange={setGameState}
    >
      {(state, transitionTo) => {
        if (state === 'title') {
          return (
            <GameTitleScreen
              title={`Petal Storm Rhythm - ${track.title}`}
              description={`${track.artist} - ${track.difficulty.toUpperCase()}`}
              instructions={[
                'Press A, S, D, F, G to hit notes in each lane',
                'Time your hits with the beat for perfect scores',
                'Build combos for multiplier bonuses',
                'Keep your health above 0 to survive',
                'Complete the track to win!',
              ]}
              onStart={() => transitionTo('playing')}
            />
          );
        }

        if (state === 'results' && gameResults) {
          return (
            <GameResultsScreen
              title={`Petal Storm Rhythm - ${track.title}`}
              score={gameResults.score}
              isWin={gameResults.didWin}
              stats={[
                { label: 'Final Score', value: gameResults.score },
                { label: 'Accuracy', value: `${Math.round(gameResults.accuracy * 100)}%` },
                { label: 'Max Combo', value: gameResults.maxCombo },
                { label: 'Result', value: gameResults.didWin ? 'Victory!' : 'Defeated' },
              ]}
              onRestart={() => {
                setGameResults(null);
                setGameStats({ score: 0, health: 100, maxHealth: 100, combo: 0, progress: 0 });
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
                milestone={track.title}
              />
              <PetalStormRhythmGame
                track={track}
                onGameEnd={(score, didWin, accuracy, maxCombo) => handleGameEnd(score, didWin, accuracy, maxCombo)}
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

