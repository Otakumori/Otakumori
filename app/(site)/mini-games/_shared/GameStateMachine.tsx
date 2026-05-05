'use client';

import { useState, useEffect, type ReactNode } from 'react';
import type { AssetManifest } from '@/app/components/games/GameAssetPreloader';
import GameAssetPreloader from '@/app/components/games/GameAssetPreloader';

export type GameState = 'loading' | 'boot' | 'title' | 'playing' | 'results';

interface GameStateMachineProps {
  gameId: string;
  gameTitle: string;
  assets?: AssetManifest;
  onStateChange?: (state: GameState) => void;
  children: (state: GameState, transitionTo: (newState: GameState) => void) => ReactNode;
}

/**
 * Game State Machine Component
 * Manages game lifecycle: loading → boot → title → playing → results
 */
export function GameStateMachine({
  gameId,
  gameTitle,
  assets,
  onStateChange,
  children,
}: GameStateMachineProps) {
  const [state, setState] = useState<GameState>('loading');
  const [assetsLoaded, setAssetsLoaded] = useState(!assets);

  useEffect(() => {
    onStateChange?.(state);
  }, [state, onStateChange]);

  const transitionTo = (newState: GameState) => {
    setState(newState);
  };

  const handleAssetsLoaded = () => {
    setAssetsLoaded(true);
    // Auto-transition to boot after assets load
    if (state === 'loading') {
      setState('boot');
    }
  };

  // Show loading screen while assets are loading
  if (state === 'loading' && assets && !assetsLoaded) {
    return (
      <div className="fixed inset-0 bg-[var(--color-bg-base)] flex items-center justify-center">
        <GameAssetPreloader
          gameId={gameId}
          assets={assets}
          onComplete={handleAssetsLoaded}
        />
      </div>
    );
  }

  // Boot screen (brief animation/logo)
  if (state === 'boot') {
    return (
      <div className="fixed inset-0 bg-[var(--color-bg-base)] flex items-center justify-center">
        <div className="text-center">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[var(--color-text-primary)] mb-2">
              {gameTitle}
            </h1>
            <div className="w-16 h-1 bg-[var(--color-primary)] mx-auto" />
          </div>
          <button
            onClick={() => transitionTo('title')}
            className="px-8 py-3 rounded-lg bg-[var(--color-primary)] text-white font-semibold hover:bg-[var(--color-primary-hover)] transition-colors"
            style={{ minHeight: '44px' }}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  // Render children with state and transition function
  return <>{children(state, transitionTo)}</>;
}

