'use client';

/**
 * GameOverlay Component
 * React UI for title, pause, and results screens
 * Only updates on state changes, not per-frame
 */

import { useEffect, useState } from 'react';
import type { GameState, GameProgress, GameResults } from './types';
import type { GameRuntime } from './GameRuntime';

interface GameOverlayProps {
  runtime: GameRuntime;
  title: string;
  onStart?: () => void;
  onRestart?: () => void;
  onQuit?: () => void;
}

export function GameOverlay({ runtime, title, onStart, onRestart, onQuit }: GameOverlayProps) {
  const [state, setState] = useState<GameState>('boot');
  const [progress, setProgress] = useState<GameProgress>({ loaded: 0, total: 0, percentage: 0 });
  const [results, setResults] = useState<GameResults | null>(null);

  useEffect(() => {
    // Subscribe to state changes
    runtime.setCallbacks({
      onStateChange: (newState) => {
        setState(newState);
      },
      onProgress: (prog) => {
        setProgress(prog);
      },
      onResults: (res) => {
        setResults(res);
      },
    });

    // Start preload automatically
    const currentState = runtime.getState();
    if (currentState === 'preload') {
      runtime.startPreload().catch((error) => {
        console.error('[GameOverlay] Preload error:', error);
      });
    }
  }, [runtime]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (state === 'play') {
          runtime.pause();
        } else if (state === 'pause') {
          runtime.resume();
        }
      } else if (e.key === 'Enter' || e.key === ' ') {
        if (state === 'title') {
          runtime.startGame();
          onStart?.();
        } else if (state === 'results') {
          runtime.restart();
          onRestart?.();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state, runtime, onStart, onRestart]);

  // Preload screen
  if (state === 'preload') {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50">
        <div className="text-center max-w-md px-6">
          <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
          <div className="w-full bg-white/10 rounded-full h-2 mb-2">
            <div
              className="bg-pink-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
          <p className="text-white/70 text-sm">
            Loading... {progress.loaded} / {progress.total} ({Math.round(progress.percentage)}%)
          </p>
        </div>
      </div>
    );
  }

  // Title screen
  if (state === 'title') {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50">
        <div className="text-center max-w-md px-6">
          <h1 className="text-4xl font-bold text-white mb-2">{title}</h1>
          <p className="text-white/70 mb-8">Press Enter or click Start to begin</p>
          <button
            onClick={() => {
              runtime.startGame();
              onStart?.();
            }}
            className="px-8 py-3 rounded-xl bg-pink-500 text-white font-semibold hover:bg-pink-600 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-black"
            style={{ minHeight: '44px' }}
          >
            Start
          </button>
        </div>
      </div>
    );
  }

  // Pause screen
  if (state === 'pause') {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50">
        <div className="text-center max-w-md px-6">
          <h2 className="text-3xl font-bold text-white mb-4">Paused</h2>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                runtime.resume();
              }}
              className="px-8 py-3 rounded-xl bg-pink-500 text-white font-semibold hover:bg-pink-600 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-black"
              style={{ minHeight: '44px' }}
            >
              Resume
            </button>
            <button
              onClick={() => {
                runtime.restart();
                onRestart?.();
              }}
              className="px-8 py-3 rounded-xl border-2 border-pink-500 text-pink-500 font-semibold hover:bg-pink-500/10 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-black"
              style={{ minHeight: '44px' }}
            >
              Restart
            </button>
            {onQuit && (
              <button
                onClick={onQuit}
                className="px-8 py-3 rounded-xl border-2 border-white/30 text-white/70 font-semibold hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black"
                style={{ minHeight: '44px' }}
              >
                Quit to Hub
              </button>
            )}
          </div>
          <p className="text-white/50 text-sm mt-6">Press ESC to resume</p>
        </div>
      </div>
    );
  }

  // Results screen
  if (state === 'results') {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50">
        <div className="text-center max-w-md px-6">
          <h2 className="text-3xl font-bold text-white mb-4">Game Over</h2>
          <div className="bg-white/10 rounded-xl p-6 mb-6">
            <div className="text-4xl font-bold text-pink-500 mb-2">{results?.score ?? 0}</div>
            <div className="text-white/70 text-sm">Score</div>
            {results?.durationMs && (
              <div className="text-white/50 text-xs mt-2">
                Time: {(results.durationMs / 1000).toFixed(1)}s
              </div>
            )}
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                runtime.restart();
                onRestart?.();
              }}
              className="px-8 py-3 rounded-xl bg-pink-500 text-white font-semibold hover:bg-pink-600 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-black"
              style={{ minHeight: '44px' }}
            >
              Play Again
            </button>
            {onQuit && (
              <button
                onClick={onQuit}
                className="px-8 py-3 rounded-xl border-2 border-white/30 text-white/70 font-semibold hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black"
                style={{ minHeight: '44px' }}
              >
                Quit to Hub
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Persist screen (optional, can show saving indicator)
  if (state === 'persist') {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/70">Saving...</p>
        </div>
      </div>
    );
  }

  // No overlay for 'boot' or 'play' states
  return null;
}

