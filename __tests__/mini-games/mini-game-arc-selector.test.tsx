import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/image', () => ({
  default: ({ alt, src }: { alt: string; src: string }) => <img alt={alt} src={src} />,
}));

import { MiniGameArcSelector } from '@/app/mini-games/_components/MiniGameArcSelector';

const games = [
  {
    category: 'Action',
    description: 'A measured first game.',
    id: 'first',
    slug: 'first-game',
    title: 'First Game',
  },
  {
    category: 'Puzzle',
    description: 'A careful second game.',
    id: 'second',
    slug: 'second-game',
    title: 'Second Game',
  },
  {
    category: 'Rhythm',
    description: 'A bright third game.',
    id: 'third',
    slug: 'third-game',
    title: 'Third Game',
  },
  {
    category: 'Adventure',
    description: 'A distant fourth game.',
    id: 'fourth',
    slug: 'fourth-game',
    title: 'Fourth Game',
  },
  {
    category: 'Strategy',
    description: 'A careful fifth game.',
    id: 'fifth',
    slug: 'fifth-game',
    title: 'Fifth Game',
  },
];

describe('MiniGameArcSelector', () => {
  it('keeps a semantic selected option and supports arrow-key selection', () => {
    render(<MiniGameArcSelector games={games} />);

    const selector = screen.getByRole('listbox', { name: 'Mini-game selector' });
    expect(screen.getByRole('option', { name: 'First Game' })).toHaveAttribute('aria-selected', 'true');

    fireEvent.keyDown(selector, { key: 'ArrowRight' });

    expect(screen.getByRole('option', { name: 'Second Game' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('heading', { name: 'Second Game' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Enter game' })).toHaveAttribute(
      'href',
      '/mini-games/second-game',
    );
  });

  it('keeps game entry as an ordinary accessible link instead of a custom canvas control', () => {
    render(<MiniGameArcSelector games={games} />);

    expect(screen.getByRole('link', { name: 'Enter game' })).toBeVisible();
    expect(screen.getByRole('img', { name: 'Selected game' })).toBeVisible();
  });

  it('derives an occluded relic slice from one canonical logical list', () => {
    const { container } = render(<MiniGameArcSelector games={games} />);

    const selector = screen.getByRole('listbox', { name: 'Mini-game selector' });
    const options = screen.getAllByRole('option');

    expect(options).toHaveLength(games.length);
    expect(selector).toHaveAttribute('aria-activedescendant', 'mini-game-option-first');
    expect(options.every((option) => option.getAttribute('tabindex') === '-1')).toBe(true);
    expect(screen.getByRole('option', { name: 'Third Game' })).toHaveClass('is-perceptible');
    expect(screen.getByRole('option', { name: 'Fourth Game' })).toHaveClass('is-perceptible');
    expect(screen.getByRole('status')).toHaveTextContent('Selected game: First Game. 1 of 5.');
    expect(container.querySelector('.om-games-selector__cover--fallback')).toBeVisible();
  });

  it('supports neighbor click and preserves deterministic wraparound', () => {
    render(<MiniGameArcSelector games={games} />);

    fireEvent.click(screen.getByRole('option', { name: 'Second Game' }));
    expect(screen.getByRole('status')).toHaveTextContent('Selected game: Second Game. 2 of 5.');

    fireEvent.keyDown(screen.getByRole('listbox', { name: 'Mini-game selector' }), {
      key: 'ArrowLeft',
    });
    expect(screen.getByRole('status')).toHaveTextContent('Selected game: First Game. 1 of 5.');
  });
});
