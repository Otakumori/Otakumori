import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/image', () => ({
  default: ({ alt, className, src }: { alt: string; className?: string; src: string }) => (
    <img alt={alt} className={className} src={src} />
  ),
}));

import { GameResultsScreen } from '@/app/mini-games/_shared/GameResultsScreen';
import { GameTitleScreen } from '@/app/mini-games/_shared/GameTitleScreen';
import MiniGamesError from '@/app/mini-games/error';
import Loading from '@/app/mini-games/loading';

describe('Game Threshold shared screens', () => {
  it('keeps launch identity, instructions, and escape navigation semantic', () => {
    const onStart = vi.fn();

    const { container } = render(
      <GameTitleScreen
        description="Restore the archive."
        instructions={['Move between fragments.', 'Match each memory.']}
        onStart={onStart}
        title="Memory Keeper"
      />,
    );

    expect(container.querySelector('[data-mori-archetype="game-threshold"]')).toBeVisible();
    expect(screen.getByRole('heading', { level: 1, name: 'Memory Keeper' })).toBeVisible();
    expect(screen.getByRole('heading', { level: 2, name: 'How to play' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Return to Mini-Games' })).toHaveAttribute(
      'href',
      '/mini-games',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Start game' }));
    expect(onStart).toHaveBeenCalledOnce();
  });

  it('supports a game-specific focal asset and keeps extended instructions disclosed', () => {
    const { container } = render(
      <GameTitleScreen
        artworkSrc="/assets/mini-games/memory-defrag/keeper/keeper-layer.webp"
        inputLabel="Keyboard / touch"
        instructions={['Move between fragments.', 'Match each memory.', 'Keep the archive stable.']}
        launchLabel="Enter the archive"
        onStart={vi.fn()}
        title="Memory Keeper"
      />,
    );

    expect(container.querySelector('img')).toHaveAttribute(
      'src',
      expect.stringContaining('keeper-layer.webp'),
    );
    expect(screen.getByLabelText('Game readiness')).toHaveTextContent('ReadyKeyboard / touch');
    expect(screen.getByText('Move between fragments.')).toBeVisible();
    expect(screen.getByText('Match each memory.')).toBeVisible();
    expect(screen.getByText('Keep the archive stable.')).not.toBeVisible();
    expect(screen.getByText('More instructions')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Enter the archive' })).toBeVisible();
  });

  it('keeps results readable and preserves existing restart and return callbacks', () => {
    const onBack = vi.fn();
    const onRestart = vi.fn();

    render(
      <GameResultsScreen
        isWin
        onBack={onBack}
        onRestart={onRestart}
        score={2400}
        stats={[{ label: 'Recovered memories', value: 6 }]}
        title="Memory Keeper"
      />,
    );

    expect(screen.getByText('2,400')).toBeVisible();
    expect(screen.getByText('Recovered memories')).toBeVisible();
    expect(screen.getByText('6')).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Play again' }));
    fireEvent.click(screen.getByRole('button', { name: 'Return to games' }));
    expect(onRestart).toHaveBeenCalledOnce();
    expect(onBack).toHaveBeenCalledOnce();
  });

  it('keeps loading and recovery states bounded without exposing raw errors', () => {
    const reset = vi.fn();
    const { rerender } = render(<Loading />);

    expect(screen.getByRole('status')).toHaveAttribute('data-mori-system-state', 'loading');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Opening the game threshold',
    );

    rerender(<MiniGamesError error={new Error('private transport detail')} reset={reset} />);
    expect(screen.getByRole('alert')).toHaveAttribute('data-mori-system-state', 'error');
    expect(screen.queryByText('private transport detail')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(reset).toHaveBeenCalledOnce();
  });
});
