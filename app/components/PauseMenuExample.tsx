'use client';

import { useEffect, useState } from 'react';
import { gameAudio } from '@/app/lib/game-audio';

/**
 * Example component showing how to use Midna's lament in pause menus
 * This can be used as a reference for implementing pause menus in games
 */
export default function PauseMenuExample() {
  const [isPaused, setIsPaused] = useState(false);
  const [pauseMusic, setPauseMusic] = useState<(() => void) | null>(null);

  // Handle pause menu music
  useEffect(() => {
    if (isPaused && !pauseMusic) {
      // Start Midna's lament when pausing
      const stopMusic = gameAudio.playPauseMenu();
      setPauseMusic(() => stopMusic);
    } else if (!isPaused && pauseMusic) {
      // Stop music when unpausing
      pauseMusic();
      setPauseMusic(null);
    }
  }, [isPaused, pauseMusic]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pauseMusic) {
        pauseMusic();
      }
    };
  }, [pauseMusic]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-8 rounded-lg">
        <h2 className="text-2xl font-bold text-white mb-4">Game Paused</h2>
        <p className="text-gray-300 mb-6">Midna's lament is playing in the background</p>
        
        <div className="space-x-4">
          <button
            onClick={() => setIsPaused(false)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Resume Game
          </button>
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {isPaused ? 'Unpause' : 'Pause'} (Toggle)
          </button>
        </div>
      </div>
    </div>
  );
}
