'use client';

import { type ReactNode } from 'react';

interface GameUIProps {
  score?: number;
  combo?: number;
  lives?: number;
  timer?: number;
  progress?: number; // 0-1 for progress bar
  milestone?: string; // Current milestone text
  children?: ReactNode;
  className?: string;
}

/**
 * Persistent Game UI Component
 * Displays score, combo, lives, timer, and progress bar using design system variables
 */
export function GameUI({
  score = 0,
  combo = 0,
  lives,
  timer,
  progress,
  milestone,
  children,
  className = '',
}: GameUIProps) {
  return (
    <div
      className={`fixed inset-0 pointer-events-none z-50 ${className}`}
      style={{
        fontFamily: 'var(--font-ui, Inter, system-ui, sans-serif)',
      }}
    >
      {/* Top Bar - Score, Combo, Lives, Timer */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3"
        style={{
          background: 'linear-gradient(to bottom, var(--color-bg-surface), transparent)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div className="flex items-center gap-6">
          {/* Score */}
          <div className="flex flex-col">
            <span
              className="text-xs uppercase tracking-wider"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Score
            </span>
            <span
              className="text-2xl font-bold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {score.toLocaleString()}
            </span>
          </div>

          {/* Combo */}
          {combo > 0 && (
            <div className="flex flex-col">
              <span
                className="text-xs uppercase tracking-wider"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Combo
              </span>
              <span
                className="text-2xl font-bold"
                style={{
                  color: 'var(--color-primary)',
                  textShadow: '0 0 8px var(--color-primary)',
                }}
              >
                {combo}x
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-6">
          {/* Lives */}
          {lives !== undefined && (
            <div className="flex items-center gap-2">
              <span
                className="text-xs uppercase tracking-wider"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Lives
              </span>
              <div className="flex gap-1">
                {Array.from({ length: Math.max(0, lives) }).map((_, i) => (
                  <span
                    key={i}
                    className="text-xl"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    ❤️
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Timer */}
          {timer !== undefined && (
            <div className="flex flex-col items-end">
              <span
                className="text-xs uppercase tracking-wider"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Time
              </span>
              <span
                className="text-2xl font-bold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {progress !== undefined && (
        <div
          className="absolute bottom-0 left-0 right-0 px-4 py-3"
          style={{
            background: 'linear-gradient(to top, var(--color-bg-surface), transparent)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div className="max-w-2xl mx-auto">
            {milestone && (
              <div
                className="text-xs uppercase tracking-wider mb-2 text-center"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {milestone}
              </div>
            )}
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{
                backgroundColor: 'var(--color-bg-glass)',
                border: '1px solid var(--color-border-default)',
              }}
            >
              <div
                className="h-full transition-all duration-300 ease-out"
                style={{
                  width: `${Math.max(0, Math.min(100, progress * 100))}%`,
                  background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))',
                  boxShadow: '0 0 8px var(--color-primary)',
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Custom children (for game-specific UI elements) */}
      {children}
    </div>
  );
}

