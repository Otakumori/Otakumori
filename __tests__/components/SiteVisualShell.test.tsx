import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import SiteVisualShell from '@/app/components/layout/SiteVisualShell';

const usePathname = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: () => usePathname(),
}));

describe('SiteVisualShell', () => {
  it('leaves the homepage path to the dedicated combined-world shell', () => {
    usePathname.mockReturnValue('/');

    render(
      <SiteVisualShell>
        <section data-testid="home-child" />
      </SiteVisualShell>,
    );

    expect(screen.getByTestId('home-child')).toBeInTheDocument();
    expect(screen.queryByTestId('mori-site-interior-shell')).not.toBeInTheDocument();
  });

  it('wraps non-home routes in the shared Mori interior shell', () => {
    usePathname.mockReturnValue('/shop');

    render(
      <SiteVisualShell>
        <main data-testid="shop-child" />
      </SiteVisualShell>,
    );

    const shell = screen.getByTestId('mori-site-interior-shell');
    expect(shell).toHaveAttribute('id', 'main-content');
    expect(shell).toHaveAttribute('data-visual-surface', 'mori-interior');
    expect(shell).toHaveClass('om-site-interior-shell');
    expect(screen.getByTestId('shop-child')).toBeInTheDocument();
  });
});
