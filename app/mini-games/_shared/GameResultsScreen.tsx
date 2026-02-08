'use client';

import { type ReactNode } from 'react';

interface GameResultsScreenProps {
  title: string;
  score: number;
  isWin: boolean;
  stats?: Array<{ label: string; value: string | number }>;
  onRestart: () => void;
  onBack: () => void;
  children?: ReactNode;
}

/**
 * Game Results Screen Component
 * Displays final score, win/loss state, and stats using design system variables
 */
export function GameResultsScreen({
  title,
  score,
  isWin,
  stats = [],
  onRestart,
  onBack,
  children,
}: GameResultsScreenProps) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        backgroundColor: 'var(--color-bg-base)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div
        className="max-w-md w-full mx-4 p-8 rounded-2xl"
        style={{
          backgroundColor: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border-default)',
          boxShadow: 'var(--shadow-xl, 0 20px 25px -5px rgba(0, 0, 0, 0.1))',
        }}
      >
        {/* Title */}
        <h2
          className="text-3xl font-bold text-center mb-2"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {isWin ? '🎉 Victory!' : '💀 Game Over'}
        </h2>
        <p
          className="text-center mb-6"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {title}
        </p>

        {/* Score */}
        <div className="text-center mb-6">
          <div
            className="text-xs uppercase tracking-wider mb-2"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Final Score
          </div>
          <div
            className="text-5xl font-bold"
            style={{
              color: 'var(--color-primary)',
              textShadow: '0 0 12px var(--color-primary)',
            }}
          >
            {score.toLocaleString()}
          </div>
        </div>

        {/* Stats */}
        {stats.length > 0 && (
          <div className="mb-6 space-y-2">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="flex justify-between items-center py-2 px-4 rounded-lg"
                style={{
                  backgroundColor: 'var(--color-bg-glass)',
                  border: '1px solid var(--color-border-default)',
                }}
              >
                <span style={{ color: 'var(--color-text-secondary)' }}>{stat.label}</span>
                <span
                  className="font-semibold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Custom children */}
        {children}

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={onBack}
            className="flex-1 py-3 px-4 rounded-lg font-semibold transition-colors"
            style={{
              backgroundColor: 'var(--color-bg-glass)',
              border: '1px solid var(--color-border-default)',
              color: 'var(--color-text-primary)',
              minHeight: '44px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-bg-surface)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-bg-glass)';
            }}
          >
            Back to Menu
          </button>
          <button
            onClick={onRestart}
            className="flex-1 py-3 px-4 rounded-lg font-semibold transition-colors"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-text-primary)',
              minHeight: '44px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-primary)';
            }}
          >
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
}

