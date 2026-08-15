import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import HeroContent from '@/app/components/hero/HeroContent';

describe('homepage hero content', () => {
  it('renders the arrival hierarchy with accessible search and real route links', () => {
    render(<HeroContent />);

    expect(
      screen.getByRole('heading', { level: 1, name: /the sakura grove is open/i }),
    ).toBeInTheDocument();

    const search = screen.getByRole('searchbox', {
      name: /search otaku-mori products, games, and stories/i,
    });
    expect(search).toHaveAttribute('name', 'q');

    expect(screen.getByRole('button', { name: /search the grove/i })).toHaveAttribute(
      'type',
      'submit',
    );
    expect(screen.getByRole('link', { name: /^visit the shop$/i })).toHaveAttribute(
      'href',
      '/shop',
    );
    expect(screen.getByRole('link', { name: /^play mini-games$/i })).toHaveAttribute(
      'href',
      '/mini-games',
    );
    expect(screen.getByRole('link', { name: /^open profile$/i })).toHaveAttribute(
      'href',
      '/profile',
    );
    expect(screen.getByRole('link', { name: /^view petals$/i })).toHaveAttribute(
      'href',
      '/profile/petals',
    );
  });

  it('does not render any unsafe local petal grant or auth shortcut controls', () => {
    render(<HeroContent />);

    expect(screen.queryByRole('button', { name: /collect/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /grant/i })).not.toBeInTheDocument();
    expect(screen.getByText(/without shortcutting auth or grant flows/i)).toBeInTheDocument();
  });
});
