import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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
  });

  it('prevents double activation during mismatch resolution', () => {
    const seed = 'mismatch-lock';
    const game = createMemoryDefragGame({ difficulty: 'initiate', seed, nowMs: 0 });
    const firstIndex = 0;
    const secondIndex = game.cards.findIndex((card) => card.pairId !== game.cards[firstIndex].pairId);
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
    const secondIndex = game.cards.findIndex((card) => card.pairId !== game.cards[firstIndex].pairId);

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
});
