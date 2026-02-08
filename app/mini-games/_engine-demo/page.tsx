'use client';

/**
 * TestGame Demo Page
 * Demonstrates the universal game runtime framework
 */

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GameRuntime } from '../_engine/GameRuntime';
import { GameCanvas } from '../_engine/GameCanvas';
import { GameOverlay } from '../_engine/GameOverlay';
import { TestGame } from './TestGame';

export default function TestGamePage() {
  const router = useRouter();
  const runtimeRef = useRef<GameRuntime | null>(null);
  const gameRef = useRef<TestGame | null>(null);
  const [runtime, setRuntime] = useState<GameRuntime | null>(null);

  useEffect(() => {
    // Create game instance
    const game = new TestGame();
    gameRef.current = game;

    // Create runtime
    const rt = new GameRuntime(game, 'Test Game', {
      targetFPS: 60,
      fixedTimestep: true,
      fixedDelta: 1 / 60,
    });

    // Set up callbacks
    rt.setCallbacks({
      onStateChange: (state) => {
        console.log('[TestGame] State:', state);
      },
      onProgress: (progress) => {
        console.log('[TestGame] Progress:', progress.percentage.toFixed(1) + '%');
      },
      onResults: (results) => {
        console.log('[TestGame] Results:', results);
      },
    });

    // Check for game end condition in play loop
    const checkGameEnd = () => {
      if (rt.getState() === 'play' && game.shouldEndGame()) {
        rt.endGame();
      }
    };

    // Check every second
    const endCheckInterval = setInterval(checkGameEnd, 1000);

    runtimeRef.current = rt;
    setRuntime(rt);


    return () => {
      clearInterval(endCheckInterval);
      rt.destroy();
    };
  }, []);

  if (!runtime) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--color-bg-base)]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p style={{ color: 'var(--color-text-secondary)' }}>Initializing runtime...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <button
            onClick={() => router.push('/mini-games')}
            className="text-white/70 hover:text-white transition-colors mb-2"
          >
            ← Back to Mini-Games
          </button>
          <h1 className="text-2xl font-bold text-white">Test Game Demo</h1>
          <p className="text-white/60 text-sm">
            Demonstrates the universal game runtime framework
          </p>
        </div>

        {/* Game Container */}
        <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-white/20">
          <GameCanvas
            runtime={runtime}
            className="w-full h-full"
            onMouseMove={(x, y) => {
              if (gameRef.current && runtime.getState() === 'play') {
                gameRef.current.handleMouseMove(x, y);
              }
            }}
          />
          <GameOverlay
            runtime={runtime}
            title="Test Game"
            onStart={() => {
              console.log('[TestGame] Game started');
            }}
            onRestart={() => {
              console.log('[TestGame] Game restarted');
            }}
            onQuit={() => {
              router.push('/mini-games');
            }}
          />
        </div>

        {/* Info Panel */}
        <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10">
          <h2 className="text-lg font-semibold text-white mb-2">Runtime Info</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-white/60">State:</div>
              <div className="text-white font-mono">{runtime.getState()}</div>
            </div>
            <div>
              <div className="text-white/60">FPS:</div>
              <div className="text-white font-mono">{runtime.getFPS()}</div>
            </div>
          </div>
          <div className="mt-4 text-xs text-white/50">
            <p>• Preload: Assets load with progress bar</p>
            <p>• Title: Press Enter or click Start to begin</p>
            <p>• Play: Click and drag to move the pink square</p>
            <p>• Pause: Press ESC to pause/resume</p>
            <p>• Results: Game ends automatically after 30 seconds</p>
          </div>
        </div>
      </div>
    </div>
  );
}

