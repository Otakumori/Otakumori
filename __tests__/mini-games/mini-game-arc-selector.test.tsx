import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

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
});
