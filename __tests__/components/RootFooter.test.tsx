import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import RootFooter from '@/app/components/hero/RootFooter';

describe('RootFooter', () => {
  it('renders restrained semantic footer groups without placeholder copy', () => {
    render(<RootFooter />);

    const footer = screen.getByTestId('mori-root-footer');

    expect(footer).toHaveAttribute('data-root-footer-contract', 'combined-world-overlay');
    expect(footer).toHaveTextContent('The roots remember every path.');
    expect(footer).not.toHaveTextContent("The world isn't perfect");

    const nav = screen.getByRole('navigation', { name: /rooted homepage navigation/i });
    for (const group of ['Shop', 'Account', 'World', 'Support']) {
      expect(within(nav).getByRole('heading', { name: group })).toBeInTheDocument();
    }
    expect(within(nav).getByRole('link', { name: /petal wallet/i })).toHaveAttribute(
      'href',
      '/profile/petals',
    );
  });
});
