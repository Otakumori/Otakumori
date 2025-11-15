/**
 * Shared Game Overlay Component
 * Instruction overlay, win/lose screens, restart/back buttons
 */

'use client';

import Link from 'next/link';
import { getOtakumoriPalette } from '@om/avatar-engine/materials/palette';

export interface GameOverlayProps {
  state: 'instructions' | 'playing' | 'win' | 'lose' | 'paused';
  instructions?: string[];
  winMessage?: string;
  loseMessage?: string;
  score?: number;
  onRestart?: () => void;
  onResume?: () => void;
  className?: string;
}

/**
 * Shared overlay component for all games
 * Consistent styling across all games
 */
export function GameOverlay({
  state,
  instructions,
  winMessage,
  loseMessage,
  score,
  onRestart,
  onResume,
  className = '',
}: GameOverlayProps) {
  const palette = getOtakumoriPalette('hub');

  if (state === 'playing') {
    return null; // No overlay during gameplay
  }

  return (
    <div
      className={`fixed inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-sm ${className}`}
    >
      <div
        className="rounded-2xl p-8 max-w-md w-full mx-4 backdrop-blur-lg"
        style={{
          backgroundColor: `${palette.coolCharcoal}cc`,
          border: `2px solid ${palette.accent}40`,
        }}
      >
        {/* Instructions */}
        {state === 'instructions' && instructions && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4" style={{ color: palette.accent }}>
              How to Play
            </h2>
            <ul className="text-left space-y-2 mb-6" style={{ color: palette.softPink }}>
              {instructions.map((instruction, index) => (
                <li key={index}>• {instruction}</li>
              ))}
            </ul>
            <button
              onClick={onResume}
              className="w-full py-3 rounded-xl font-semibold transition-all hover:scale-105"
              style={{
                backgroundColor: palette.accent,
                color: '#ffffff',
              }}
            >
              Start Game
            </button>
          </div>
        )}

        {/* Win Screen */}
        {state === 'win' && (
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4" style={{ color: palette.petals }}>
              Victory!
            </h2>
            {winMessage && <p className="mb-4" style={{ color: palette.softPink }}>{winMessage}</p>}
            {score !== undefined && (
              <p className="text-2xl font-bold mb-6" style={{ color: palette.accent }}>
                Final Score: {score.toLocaleString()}
              </p>
            )}
            <div className="flex gap-4">
              {onRestart && (
                <button
                  onClick={onRestart}
                  className="flex-1 py-3 rounded-xl font-semibold transition-all hover:scale-105"
                  style={{
                    backgroundColor: palette.accent,
                    color: '#ffffff',
                  }}
                >
                  Play Again
                </button>
              )}
              <Link
                href="/mini-games"
                className="flex-1 py-3 rounded-xl font-semibold transition-all hover:scale-105 text-center"
                style={{
                  backgroundColor: palette.deepPurple,
                  color: '#ffffff',
                }}
              >
                Back to Arcade
              </Link>
            </div>
          </div>
        )}

        {/* Lose Screen */}
        {state === 'lose' && (
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4" style={{ color: '#f43f5e' }}>
              Defeat
            </h2>
            {loseMessage && <p className="mb-4" style={{ color: palette.softPink }}>{loseMessage}</p>}
            {score !== undefined && (
              <p className="text-xl font-bold mb-6" style={{ color: palette.accent }}>
                Score: {score.toLocaleString()}
              </p>
            )}
            <div className="flex gap-4">
              {onRestart && (
                <button
                  onClick={onRestart}
                  className="flex-1 py-3 rounded-xl font-semibold transition-all hover:scale-105"
                  style={{
                    backgroundColor: palette.accent,
                    color: '#ffffff',
                  }}
                >
                  Retry
                </button>
              )}
              <Link
                href="/mini-games"
                className="flex-1 py-3 rounded-xl font-semibold transition-all hover:scale-105 text-center"
                style={{
                  backgroundColor: palette.deepPurple,
                  color: '#ffffff',
                }}
              >
                Return to Arcade
              </Link>
            </div>
          </div>
        )}

        {/* Paused Screen */}
        {state === 'paused' && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4" style={{ color: palette.accent }}>
              Paused
            </h2>
            <div className="flex gap-4">
              {onResume && (
                <button
                  onClick={onResume}
                  className="flex-1 py-3 rounded-xl font-semibold transition-all hover:scale-105"
                  style={{
                    backgroundColor: palette.accent,
                    color: '#ffffff',
                  }}
                >
                  Resume
                </button>
              )}
              <Link
                href="/mini-games"
                className="flex-1 py-3 rounded-xl font-semibold transition-all hover:scale-105 text-center"
                style={{
                  backgroundColor: palette.deepPurple,
                  color: '#ffffff',
                }}
              >
                Back to Arcade
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

