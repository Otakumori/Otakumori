import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import PetalSamuraiGameWrapper from '@/app/mini-games/(games)/petal-samurai/GameWrapper';

const { beginResultSession, recordResult } = vi.hoisted(() => ({
  beginResultSession: vi.fn(),
  recordResult: vi.fn().mockResolvedValue({
    success: true,
    personalBest: {
      status: 'new_best',
      previousBest: null,
      currentBest: 1200,
      isNewBest: true,
    },
  }),
}));

vi.mock('@/app/lib/games/progress', () => ({
  useGameProgress: () => ({ beginResultSession, recordResult }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/app/mini-games/_shared/assets-resolver', () => ({
  getAsset: () => null,
}));

vi.mock('@/app/mini-games/_shared/GameStateMachine', async () => {
  const React = await import('react');
  return {
    GameStateMachine: ({
      children,
      onStateChange,
    }: {
      children: (state: string, transitionTo: (state: string) => void) => ReactNode;
      onStateChange?: (state: string) => void;
    }) => {
      const [state, setState] = React.useState('title');
      React.useEffect(() => onStateChange?.(state), [onStateChange, state]);
      return children(state, setState);
    },
  };
});

vi.mock('@/app/mini-games/_shared/GameSession', () => ({
  useGameSession: () => ({
    phase: 'ready',
    complete: vi.fn(),
    exit: vi.fn(),
    pause: vi.fn(),
    prepare: vi.fn(),
    ready: vi.fn(),
    restart: vi.fn(),
    resume: vi.fn(),
    start: vi.fn(),
  }),
}));

vi.mock('@/app/mini-games/_shared/GamePlatform', () => ({
  GamePlatformHud: () => null,
  GamePlatformPause: () => null,
  GameSessionAnnouncement: () => null,
}));

vi.mock('@/app/mini-games/_shared/GameResultsScreen', () => ({
  GameResultsScreen: ({
    stats,
    personalBest,
  }: {
    stats: Array<{ label: string; value: ReactNode }>;
    personalBest?: { currentBest: number | null; isNewBest: boolean } | null;
  }) => (
    <dl aria-label="Petal Samurai results">
      {stats.map((stat) => (
        <div key={stat.label}>
          <dt>{stat.label}</dt>
          <dd>{stat.value}</dd>
        </div>
      ))}
      {personalBest?.isNewBest && <div>NEW BEST {personalBest.currentBest}</div>}
    </dl>
  ),
}));

vi.mock('@/app/mini-games/(games)/petal-samurai/Game', () => ({
  default: ({
    difficulty,
    mode,
    onGameEnd,
  }: {
    difficulty: string;
    mode: string;
    onGameEnd: (result: { score: number; combo: number; misses: number; didWin: boolean }) => void;
  }) => (
    <section aria-label="Petal Samurai runtime" data-difficulty={difficulty} data-mode={mode}>
      <button
        type="button"
        onClick={() => onGameEnd({ score: 1200, combo: 14, misses: 3, didWin: false })}
      >
        Finish run
      </button>
    </section>
  ),
}));

describe('Petal Samurai product closure', () => {
  it('offers only truthful launch modes and disciplines, then preserves the selection in results', async () => {
    render(<PetalSamuraiGameWrapper />);

    expect(screen.queryByRole('button', { name: 'Classic' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Storm' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Medium' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Endless' }));
    fireEvent.click(screen.getByRole('button', { name: 'Ronin' }));
    fireEvent.click(screen.getByRole('button', { name: 'Begin ritual' }));

    expect(screen.getByRole('region', { name: 'Petal Samurai runtime' })).toHaveAttribute(
      'data-mode',
      'endless',
    );
    expect(screen.getByRole('region', { name: 'Petal Samurai runtime' })).toHaveAttribute(
      'data-difficulty',
      'hard',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Finish run' }));
    await waitFor(() => expect(recordResult).toHaveBeenCalledTimes(1));
    expect(recordResult).toHaveBeenCalledWith(
      expect.objectContaining({
        gameId: 'petal-samurai',
        resultKey: 'endless:hard',
        score: 1200,
      }),
    );
    expect(screen.getByText('Ritual').nextElementSibling).toHaveTextContent('Endless');
    expect(screen.getByText('Discipline').nextElementSibling).toHaveTextContent('Ronin');
    expect(screen.getByText('NEW BEST 1200')).toBeInTheDocument();
  });

  it('keeps one frame-loop owner, one pointer input path, and no invalid leaderboard write', () => {
    const source = readFileSync(
      join(process.cwd(), 'app/mini-games/(games)/petal-samurai/Game.tsx'),
      'utf8',
    );

    expect(source).not.toContain('private startGameLoop');
    expect(source).not.toContain("fetch('/api/v1/leaderboards/petal-samurai'");
    expect(source).toContain('onPointerDown={handlePointerDown}');
    expect(source).toContain('onPointerMove={handlePointerMove}');
    expect(source).toContain('onPointerCancel={handlePointerUp}');
    expect(source).toContain("touchAction: 'none'");
    expect(source).toContain('setPointerCapture(event.pointerId)');
  });
});
