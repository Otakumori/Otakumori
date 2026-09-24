import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryKeeperPresentation } from '@/app/mini-games/(games)/memory-match/MemoryKeeperPresentation';
import MemoryMatchGame from '@/app/mini-games/(games)/memory-match/MemoryMatchGame';
import { createMemoryDefragGame } from '@/app/mini-games/(games)/memory-match/memoryDefragEngine';

vi.mock('@/app/mini-games/_shared/SaveSystem', () => ({
  useGameSave: () => ({
    autoSave: vi.fn().mockResolvedValue(undefined),
    saveOnExit: vi.fn().mockResolvedValue(true),
  }),
}));

function stubMatchMedia(matches: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({
      matches,
      media: '(prefers-reduced-motion: reduce)',
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
}

describe('memory defrag UI', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    stubMatchMedia(false);
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('renders an accessible keyboard-operated card grid', () => {
    render(<MemoryMatchGame difficulty="initiate" seed="keyboard-grid" />);

    const board = screen.getByRole('grid', { name: /initiate memory defrag board/i });
    const cards = screen.getAllByRole('gridcell');

    expect(board).toBeInTheDocument();
    expect(cards).toHaveLength(12);

    cards[0].focus();
    fireEvent.keyDown(cards[0], { key: 'ArrowRight' });
    expect(cards[1]).toHaveFocus();

    fireEvent.keyDown(cards[1], { key: 'Enter' });
    expect(screen.getByText(/revealed/i)).toBeInTheDocument();
    expect(screen.getByTestId('memory-keeper-presentation')).toHaveAttribute(
      'data-reaction',
      'reveal',
    );
  });

  it('prevents double activation during mismatch resolution', () => {
    const seed = 'mismatch-lock';
    const game = createMemoryDefragGame({ difficulty: 'initiate', seed, nowMs: 0 });
    const firstIndex = 0;
    const secondIndex = game.cards.findIndex(
      (card) => card.pairId !== game.cards[firstIndex].pairId,
    );
    const extraIndex = game.cards.findIndex(
      (_card, index) => index !== firstIndex && index !== secondIndex,
    );

    render(<MemoryMatchGame difficulty="initiate" seed={seed} />);

    const cards = screen.getAllByRole('gridcell');
    fireEvent.click(cards[firstIndex]);
    fireEvent.click(cards[secondIndex]);

    const movesBefore = screen.getByText('Moves').parentElement?.textContent;
    fireEvent.click(cards[extraIndex]);
    const movesAfter = screen.getByText('Moves').parentElement?.textContent;

    expect(movesAfter).toBe(movesBefore);
  });

  it('exposes reduced motion state and shortens mismatch conceal timing', () => {
    cleanup();
    vi.unstubAllGlobals();
    stubMatchMedia(true);

    const seed = 'reduced-motion';
    const game = createMemoryDefragGame({ difficulty: 'initiate', seed, nowMs: 0 });
    const firstIndex = 0;
    const secondIndex = game.cards.findIndex(
      (card) => card.pairId !== game.cards[firstIndex].pairId,
    );

    render(<MemoryMatchGame difficulty="initiate" seed={seed} />);
    expect(screen.getByTestId('memory-defrag-game')).toHaveAttribute('data-reduced-motion', 'true');

    const cards = screen.getAllByRole('gridcell');
    fireEvent.click(cards[firstIndex]);
    fireEvent.click(cards[secondIndex]);

    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(screen.getByTestId('memory-defrag-game')).not.toHaveAttribute('data-phase', 'resolving');
  });

  it('returns transient Keeper reactions to idle without changing the card grid', () => {
    render(<MemoryMatchGame difficulty="initiate" seed="keeper-reaction" />);

    const cards = screen.getAllByRole('gridcell');
    fireEvent.click(cards[0]);

    const keeper = screen.getByTestId('memory-keeper-presentation');
    expect(keeper).toHaveAttribute('aria-hidden', 'true');
    expect(keeper).toHaveAttribute('data-reaction', 'reveal');
    expect(screen.getAllByRole('gridcell')).toHaveLength(12);

    act(() => {
      vi.advanceTimersByTime(560);
    });

    expect(keeper).toHaveAttribute('data-reaction', 'idle');
    expect(screen.getAllByRole('gridcell')).toHaveLength(12);
  });

  it('emits completion immediately while clear presentation is still active', () => {
    const seed = 'clear-handoff';
    const fixture = createMemoryDefragGame({ difficulty: 'initiate', seed, nowMs: 0 });
    const pairIds = new Map<string, string[]>();
    fixture.cards.forEach((card) => {
      pairIds.set(card.pairId, [...(pairIds.get(card.pairId) ?? []), card.id]);
    });
    const onGameEnd = vi.fn();

    render(<MemoryMatchGame difficulty="initiate" seed={seed} onGameEnd={onGameEnd} />);

    const cards = screen.getAllByRole('gridcell');
    for (const ids of pairIds.values()) {
      const firstIndex = fixture.cards.findIndex((card) => card.id === ids[0]);
      const secondIndex = fixture.cards.findIndex((card) => card.id === ids[1]);
      fireEvent.click(cards[firstIndex]);
      fireEvent.click(cards[secondIndex]);
    }

    expect(onGameEnd).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('memory-keeper-presentation')).toHaveAttribute(
      'data-reaction',
      'clear',
    );
  });

  it('keeps the fail cinematic out of production gameplay mapping', () => {
    render(<MemoryMatchGame difficulty="initiate" seed="no-fail-path" />);

    const keeper = screen.getByTestId('memory-keeper-presentation');
    expect(keeper).not.toHaveAttribute('data-reaction', 'fail');

    cleanup();

    render(
      <MemoryKeeperPresentation
        reaction="fail"
        nonce={1}
        reducedMotion={false}
        progress={0}
        streakTier="quiet"
      />,
    );

    expect(screen.getByTestId('memory-keeper-presentation')).toHaveAttribute(
      'data-reaction',
      'fail',
    );
  });
});
