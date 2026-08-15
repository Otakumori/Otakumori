import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import HeroContent from '@/app/components/hero/HeroContent';

describe('homepage hero content', () => {
  it('renders the arrival hierarchy with accessible search and real route links', () => {
    render(<HeroContent />);

    expect(
      screen.getByRole('heading', { level: 1, name: /welcome to the sanctuary, traveler/i }),
    ).toBeInTheDocument();

    const search = screen.getByRole('searchbox', {
      name: /search otaku-mori products, games, and stories/i,
    });
    expect(search).toHaveAttribute('name', 'q');
    expect(search).toHaveAttribute('placeholder', "What are ya eyein'?");

    expect(screen.getByRole('button', { name: /^search$/i })).toHaveAttribute('type', 'submit');
    expect(screen.getByRole('link', { name: /^gear up/i })).toHaveAttribute(
      'href',
      '/shop',
    );
    expect(screen.getByRole('link', { name: /^mini-games$/i })).toHaveAttribute(
      'href',
      '/mini-games',
    );
    expect(screen.getByRole('link', { name: /^profile$/i })).toHaveAttribute(
      'href',
      '/profile',
    );
    expect(screen.getByRole('link', { name: /^petals$/i })).toHaveAttribute(
      'href',
      '/profile/petals',
    );
  });

  it('does not render any unsafe local petal grant or auth shortcut controls', () => {
    render(<HeroContent />);

    expect(screen.queryByRole('button', { name: /collect/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /grant/i })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /petals drift from the tree/i })).toHaveAttribute(
      'href',
      '/profile/petals',
    );
  });
});
