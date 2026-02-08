'use client';

/**
 * PetalStormRhythmGame - Core gameplay component
 * Extracted from page.tsx for GameStateMachine integration
 * 
 * Note: This is a simplified version. The full gameplay logic remains in page.tsx
 * for backward compatibility. This component serves as a bridge to the state machine.
 */

import { useEffect } from 'react';

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

interface PetalStormRhythmGameProps {
  track: Track;
  onGameEnd?: (score: number, didWin: boolean, accuracy: number, maxCombo: number) => void;
  onStatsUpdate?: (stats: { score: number; health: number; maxHealth: number; combo: number; progress?: number }) => void;
}

export default function PetalStormRhythmGame({ track, onGameEnd, onStatsUpdate }: PetalStormRhythmGameProps) {
  // This is a placeholder component
  // The actual gameplay logic is still in page.tsx
  // This component will be fully implemented in a future refactoring
  
  useEffect(() => {
    // Placeholder: Update stats
    if (onStatsUpdate) {
      onStatsUpdate({
        score: 0,
        health: 100,
        maxHealth: 100,
        combo: 0,
        progress: 0,
      });
    }
  }, [onStatsUpdate]);

  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 via-pink-800 to-red-900">
      <div className="text-center text-white">
        <h2 className="text-2xl font-bold mb-4">Petal Storm Rhythm</h2>
        <p className="text-lg mb-2">Track: {track.title}</p>
        <p className="text-sm text-gray-300">Gameplay integration in progress...</p>
        <p className="text-xs text-gray-400 mt-4">
          The full gameplay logic is being migrated from page.tsx.
          This is a placeholder component for GameStateMachine integration.
        </p>
      </div>
    </div>
  );
}

