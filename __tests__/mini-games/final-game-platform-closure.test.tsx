import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import MaidCafeManagerGame from '@/app/mini-games/(games)/maid-cafe-manager/Game';
import MemoryMatchGameWrapper from '@/app/mini-games/(games)/memory-match/Game';
import gamesMeta from '@/lib/games.meta.json';

const { beginResultSession, recordResult, routerPush, saveBeforeExit } = vi.hoisted(() => ({
  beginResultSession: vi.fn(),
  recordResult: vi.fn().mockResolvedValue({ success: true }),
  routerPush: vi.fn(),
  saveBeforeExit: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: routerPush, replace: routerPush }),
}));

vi.mock('@/app/lib/games/progress', () => ({
  useGameProgress: () => ({ beginResultSession, recordResult }),
}));

vi.mock('@/app/mini-games/_shared/audio-bus', () => ({
  pauseGameAudio: vi.fn().mockResolvedValue(undefined),
  resumeGameAudio: vi.fn().mockResolvedValue(undefined),
  stopGameAudio: vi.fn(),
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
  GameTitleScreen: ({ onStart }: { onStart: () => void }) => (
    <button type="button" onClick={onStart}>
      Start
    </button>
  ),
}));

vi.mock('@/app/mini-games/(games)/memory-match/MemoryDefragScreens', () => ({
  MemoryDefragTitleScreen: ({ onStart }: { onStart: () => void }) => (
    <button type="button" onClick={onStart}>
      Start memory
    </button>
  ),
  MemoryDefragResultsScreen: ({ score }: { score: number }) => (
    <output aria-label="Memory score">{score}</output>
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

vi.mock('@/app/mini-games/(games)/maid-cafe-manager/MaidCafeGame', async () => {
  const React = await import('react');
  return {
    default: ({
      paused,
      onGameEnd,
      onExitSaveReady,
    }: {
      paused: boolean;
      onGameEnd: (result: { score: number; money: number; level: number }) => void;
      onExitSaveReady: (save: () => void) => void;
    }) => {
      React.useEffect(() => onExitSaveReady(saveBeforeExit), [onExitSaveReady]);
      return (
        <section aria-label="Maid runtime" data-paused={paused}>
          <button type="button" onClick={() => onGameEnd({ score: 400, money: 90, level: 2 })}>
            Finish shift
          </button>
        </section>
      );
    },
  };
});

vi.mock('@/app/mini-games/(games)/memory-match/MemoryMatchGame', () => ({
  default: ({ onGameEnd }: { onGameEnd: (result: Record<string, unknown>) => void }) => (
    <button
      type="button"
      onClick={() => {
        const result = {
          score: 900,
          matches: 8,
          moves: 8,
          timeElapsed: 12000,
          didWin: true,
          rewardIntent: { facts: { perfectClear: true, lowMoveClear: true } },
          achievementIntent: {
            facts: ['memory_defrag_first_clear', 'memory_defrag_perfect_clear'],
          },
        };
        onGameEnd(result);
        onGameEnd(result);
      }}
    >
      Finish memory
    </button>
  ),
}));

afterEach(() => {
  beginResultSession.mockClear();
  recordResult.mockClear();
  routerPush.mockClear();
  saveBeforeExit.mockClear();
});

describe('final game platform closure', () => {
  it('routes the canonical Bubble hub identity to the adopted runtime', () => {
    const bubble = gamesMeta.games.find((game) => game.slug === 'bubble-ragdoll');
    expect(bubble).toMatchObject({
      id: 'bubble-ragdoll',
      title: 'Bubble Ragdoll',
      slug: 'bubble-ragdoll',
    });

    const legacyRoute = readFileSync(
      join(process.cwd(), 'app/mini-games/(games)/bubble-girl/layout.tsx'),
      'utf8',
    );
    expect(legacyRoute).toContain("redirect('/mini-games/bubble-ragdoll')");
  });

  it('uses the page-owned Petal Storm runtime and guards completion once', () => {
    const source = readFileSync(
      join(process.cwd(), 'app/mini-games/(games)/petal-storm-rhythm/page.tsx'),
      'utf8',
    );
    expect(source).not.toContain('PetalStormRhythmGameWrapper');
    expect(source).toContain('completionSubmittedRef.current');
    expect(source).toContain("beginResultSession('petal-storm-rhythm')");
    expect(source).toContain('await recordResult({');
    expect(source).toContain("gameId: 'petal-storm-rhythm'");
    expect(source).not.toContain("fetch('/api/v1/leaderboards/petal-storm-rhythm'");
  });

  it('routes Maid pause and exit through the shared session while preserving exit save', () => {
    render(<MaidCafeManagerGame />);
    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    fireEvent.click(screen.getByRole('button', { name: 'Pause' }));
    expect(screen.getByRole('region', { name: 'Maid runtime' })).toHaveAttribute(
      'data-paused',
      'true',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Resume' }));
    fireEvent.click(screen.getByRole('button', { name: 'Exit' }));
    expect(saveBeforeExit).toHaveBeenCalledTimes(1);
    expect(routerPush).toHaveBeenCalledWith('/mini-games');
  });

  it('consumes Memory completion and achievement facts through progression once', () => {
    render(<MemoryMatchGameWrapper />);
    fireEvent.click(screen.getByRole('button', { name: 'Start memory' }));
    fireEvent.click(screen.getByRole('button', { name: 'Finish memory' }));

    expect(recordResult).toHaveBeenCalledTimes(1);
    expect(recordResult).toHaveBeenCalledWith(
      expect.objectContaining({
        gameId: 'memory-match',
        score: 900,
        metadata: expect.objectContaining({
          perfectClear: true,
          achievementFacts: ['memory_defrag_first_clear', 'memory_defrag_perfect_clear'],
        }),
      }),
    );
  });
});
