import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import OtakuBeatEmUpGameWrapper from '@/app/mini-games/(games)/otaku-beat-em-up/Game';

const { beginResultSession, recordResult, routerPush } = vi.hoisted(() => ({
  beginResultSession: vi.fn(),
  recordResult: vi.fn().mockResolvedValue({
    success: true,
    personalBest: {
      status: 'new_best',
      previousBest: 1800,
      currentBest: 2400,
      isNewBest: true,
    },
  }),
  routerPush: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: routerPush }),
}));

vi.mock('@/app/lib/games/progress', () => ({
  useGameProgress: () => ({ beginResultSession, recordResult }),
}));

vi.mock('@/app/mini-games/_shared/audio-bus', () => ({
  pauseGameAudio: vi.fn().mockResolvedValue(undefined),
  resumeGameAudio: vi.fn().mockResolvedValue(undefined),
  stopGameAudio: vi.fn(),
}));

vi.mock('@/app/mini-games/_shared/assets-resolver', () => ({ getAsset: () => null }));

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
  GameTitleScreen: ({ onStart }: { onStart: () => void }) => (
    <button type="button" onClick={onStart}>
      Start
    </button>
  ),
}));

vi.mock('@/app/mini-games/_shared/GameResultsScreen', () => ({
  GameResultsScreen: ({
    score,
    stats = [],
    personalBest,
    onBack,
  }: {
    score: number;
    stats?: Array<{ label: string; value: string | number }>;
    personalBest?: { currentBest: number | null; isNewBest: boolean } | null;
    onBack: () => void;
  }) => (
    <section aria-label="Results">
      <output aria-label="Final score">{score}</output>
      {stats.map((stat) => (
        <p key={stat.label}>
          {stat.label}: {stat.value}
        </p>
      ))}
      {personalBest?.isNewBest && <p>NEW BEST {personalBest.currentBest}</p>}
      <button type="button" onClick={onBack}>
        Return to games
      </button>
    </section>
  ),
}));

vi.mock('@/app/mini-games/_shared/GameUI', () => ({ GameUI: () => null }));

vi.mock('@/app/mini-games/_shared/GamePlatform', () => ({
  GamePlatformControls: ({ session }: { session: { pause: () => void; exit: () => void } }) => (
    <nav aria-label="Game session controls">
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

vi.mock('@/app/mini-games/(games)/otaku-beat-em-up/BeatEmUpGame', () => ({
  default: ({
    paused,
    onGameEnd,
  }: {
    paused: boolean;
    onGameEnd: (score: number, didWin: boolean) => void;
  }) => (
    <section aria-label="Beat runtime" data-paused={paused}>
      <button
        type="button"
        onClick={() => {
          onGameEnd(2400, true);
          onGameEnd(2400, true);
        }}
      >
        Finish combat
      </button>
    </section>
  ),
}));

afterEach(() => {
  beginResultSession.mockClear();
  recordResult.mockClear();
  routerPush.mockClear();
});

describe('ready-game shared-platform adoption', () => {
  it('coordinates Beat-em-up lifecycle and submits one canonical result', async () => {
    render(<OtakuBeatEmUpGameWrapper mode="arcade" />);

    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    expect(beginResultSession).toHaveBeenCalledWith('otaku-beat-em-up');

    fireEvent.click(screen.getByRole('button', { name: 'Pause' }));
    expect(screen.getByRole('region', { name: 'Beat runtime' })).toHaveAttribute(
      'data-paused',
      'true',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Resume' }));

    fireEvent.click(screen.getByRole('button', { name: 'Finish combat' }));
    await waitFor(() => expect(recordResult).toHaveBeenCalledTimes(1));
    expect(recordResult).toHaveBeenCalledWith(
      expect.objectContaining({ gameId: 'otaku-beat-em-up', score: 2400, didWin: true }),
    );
    expect(screen.getByRole('status', { name: 'Final score' })).toHaveTextContent('2400');
    expect(screen.getByText(/Run Grade: C/)).toBeInTheDocument();
    expect(await screen.findByText('NEW BEST 2400')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Return to games' }));
    expect(routerPush).toHaveBeenCalledWith('/mini-games');
  });

  it.each([
    ['petal-storm-rhythm/page.tsx', 'petal-storm-rhythm'],
    ['otaku-beat-em-up/Game.tsx', 'otaku-beat-em-up'],
    ['puzzle-reveal/page.tsx', 'puzzle-reveal'],
  ])('%s uses shared lifecycle and progression authority', (relativePath, gameId) => {
    const source = readFileSync(
      join(process.cwd(), 'app/mini-games/(games)', relativePath),
      'utf8',
    );

    expect(source).toContain('useGameSession');
    expect(source).toContain('useGameProgress');
    expect(source).toContain(`beginResultSession('${gameId}')`);
    expect(source).toContain('recordResult');
    expect(source).not.toContain('/api/v1/petals/collect');
  });

  it('keeps specialized runtime input game-owned while accepting controlled pause', () => {
    const beatRuntime = readFileSync(
      join(process.cwd(), 'app/mini-games/(games)/otaku-beat-em-up/BeatEmUpGame.tsx'),
      'utf8',
    );
    const puzzleRuntime = readFileSync(
      join(process.cwd(), 'app/mini-games/(games)/puzzle-reveal/EnhancedTileGame.tsx'),
      'utf8',
    );

    expect(beatRuntime).toContain('paused?: boolean');
    expect(puzzleRuntime).toContain('paused?: boolean');
    expect(beatRuntime).toContain('Light Attack (on-beat for bonus!)');
    expect(beatRuntime).toContain('Touch combat controls');
    expect(puzzleRuntime).toContain('handleCanvasClick');
  });
});
