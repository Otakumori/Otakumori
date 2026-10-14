import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import DungeonOfDesireGameWrapper from '@/app/mini-games/(games)/dungeon-of-desire/Game';
import ThighColiseumGameWrapper from '@/app/mini-games/(games)/thigh-coliseum/Game';

const { routerPush } = vi.hoisted(() => ({ routerPush: vi.fn() }));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: routerPush }),
}));

vi.mock('@/app/mini-games/_shared/audio-bus', () => ({
  pauseGameAudio: vi.fn().mockResolvedValue(undefined),
  resumeGameAudio: vi.fn().mockResolvedValue(undefined),
  stopGameAudio: vi.fn(),
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

vi.mock('@/app/mini-games/_shared/GameTitleScreen', () => ({
  GameTitleScreen: ({ title, onStart }: { title: string; onStart: () => void }) => (
    <section>
      <h1>{title}</h1>
      <button type="button" onClick={onStart}>
        Start
      </button>
    </section>
  ),
}));

vi.mock('@/app/mini-games/_shared/GameResultsScreen', () => ({
  GameResultsScreen: ({ score, onBack }: { score: number; onBack: () => void }) => (
    <section aria-label="Results">
      <output aria-label="Final score">{score}</output>
      <button type="button" onClick={onBack}>
        Return to games
      </button>
    </section>
  ),
}));

vi.mock('@/app/mini-games/_shared/GamePlatform', () => ({
  GamePlatformHud: ({
    session,
  }: {
    session: { phase: string; pause: () => void; exit: () => void };
  }) => (
    <nav aria-label="Game session controls">
      <output aria-label="Session phase">{session.phase}</output>
      <button type="button" onClick={session.pause}>
        Pause
      </button>
      <button type="button" onClick={session.exit}>
        Exit
      </button>
    </nav>
  ),
  GamePlatformPause: ({ session }: { session: { phase: string; resume: () => void } }) =>
    session.phase === 'paused' ? (
      <button type="button" onClick={session.resume}>
        Resume
      </button>
    ) : null,
  GameSessionAnnouncement: () => null,
}));

vi.mock('@/app/mini-games/(games)/dungeon-of-desire/DungeonGame', () => ({
  default: ({
    paused,
    onGameEnd,
    onStatsUpdate,
  }: {
    paused: boolean;
    onGameEnd: (score: number, didWin: boolean) => void;
    onStatsUpdate: (stats: {
      score: number;
      health: number;
      maxHealth: number;
      floor: number;
    }) => void;
  }) => (
    <section aria-label="Dungeon runtime" data-paused={paused}>
      <button
        type="button"
        onClick={() => {
          onStatsUpdate({ score: 1200, health: 42, maxHealth: 100, floor: 4 });
          onGameEnd(1200, false);
        }}
      >
        Finish dungeon
      </button>
    </section>
  ),
}));

vi.mock('@/app/mini-games/(games)/thigh-coliseum/ThighChaseGame', () => ({
  default: ({
    paused,
    onGameEnd,
    onStatsUpdate,
  }: {
    paused: boolean;
    onGameEnd: (score: number, didWin: boolean) => void;
    onStatsUpdate: (stats: { score: number; lives: number; stage: number }) => void;
  }) => (
    <section aria-label="Colosseum runtime" data-paused={paused}>
      <button
        type="button"
        onClick={() => {
          onStatsUpdate({ score: 800, lives: 1, stage: 3 });
          onGameEnd(800, false);
        }}
      >
        Finish chase
      </button>
    </section>
  ),
}));

afterEach(() => {
  routerPush.mockClear();
});

describe.each([
  {
    name: 'Dungeon of Desire',
    runtime: 'Dungeon runtime',
    finish: 'Finish dungeon',
    score: '1200',
    Component: DungeonOfDesireGameWrapper,
  },
  {
    name: 'Thigh Colosseum',
    runtime: 'Colosseum runtime',
    finish: 'Finish chase',
    score: '800',
    Component: ThighColiseumGameWrapper,
  },
])('$name shared-platform adoption', ({ Component, runtime, finish, score }) => {
  it('coordinates running, pause, results, and shared exit without changing game output', () => {
    render(<Component />);

    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    expect(screen.getByRole('status', { name: 'Session phase' })).toHaveTextContent('running');

    fireEvent.click(screen.getByRole('button', { name: 'Pause' }));
    expect(screen.getByRole('region', { name: runtime })).toHaveAttribute('data-paused', 'true');

    fireEvent.click(screen.getByRole('button', { name: 'Resume' }));
    expect(screen.getByRole('region', { name: runtime })).toHaveAttribute('data-paused', 'false');

    fireEvent.click(screen.getByRole('button', { name: finish }));
    expect(screen.getByRole('status', { name: 'Final score' })).toHaveTextContent(score);

    fireEvent.click(screen.getByRole('button', { name: 'Return to games' }));
    expect(routerPush).toHaveBeenCalledWith('/mini-games');
  });
});
