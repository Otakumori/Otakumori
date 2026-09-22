import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/image', () => ({
  default: ({ alt = '', fill: _fill, priority: _priority, sizes: _sizes, ...props }: any) => (
    <img alt={alt} {...props} />
  ),
}));

import HeroContent from '@/app/components/hero/HeroContent';

describe('homepage hero content', () => {
  it('renders the arrival hierarchy with accessible search and the shop route', () => {
    render(<HeroContent />);

    expect(
      screen.getByRole('heading', { level: 1, name: /you found otaku-mori/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/sanctuary open/i)).not.toBeInTheDocument();

    const search = screen.getByRole('searchbox', {
      name: /search otaku-mori products, games, and stories/i,
    });
    expect(search).toHaveAttribute('name', 'q');
    expect(search).toHaveAttribute('placeholder', "What are ya eyein'?");

    expect(screen.getByRole('button', { name: /^search$/i })).toHaveAttribute('type', 'submit');
    expect(screen.getByRole('link', { name: /^gear up/i })).toHaveAttribute('href', '/shop');
  });

  it('does not render any unsafe local petal grant or auth shortcut controls', () => {
    render(<HeroContent />);

    expect(screen.queryByRole('button', { name: /collect/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /grant/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/petals drift from the tree/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/add to bottomless cart/i)).not.toBeInTheDocument();
  });
});
