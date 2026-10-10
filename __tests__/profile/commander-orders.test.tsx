import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import OrdersPage from '@/app/orders/page';

vi.mock('@clerk/nextjs', () => ({
  useAuth: () => ({ isSignedIn: false, userId: null }),
}));

describe('Commander order archive', () => {
  it('keeps signed-out order history private inside the Commander composition', () => {
    const { container } = render(<OrdersPage />);

    expect(container.querySelector('main[data-mori-archetype="commander"]')).not.toBeNull();
    expect(screen.getByRole('heading', { level: 1, name: 'Orders' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Sign in to view your orders' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Orders' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Sign In' })).toHaveAttribute('href', '/sign-in');
  });
});
