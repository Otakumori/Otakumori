import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  MoriAmbientPetals,
  MoriButton,
  MoriField,
  MoriInput,
  MoriLink,
  MoriUnavailableState,
  MoriVariantOption,
} from '@/app/components/mori';
import { PetalBalanceDisplay } from '@/app/components/shop/PetalBalanceDisplay';

vi.mock('@clerk/nextjs', () => ({
  useUser: () => ({ isSignedIn: true }),
}));

describe('Mori visual primitives', () => {
  it('keeps buttons, links, fields, and variant options semantic', () => {
    render(
      <div>
        <MoriButton type="button">Add to Cart</MoriButton>
        <MoriLink href="/shop">Visit the Shop</MoriLink>
        <MoriField label="Email" htmlFor="email" description="Receipt address">
          <MoriInput id="email" name="email" type="email" />
        </MoriField>
        <MoriVariantOption selected aria-label="Select medium size">
          Medium
        </MoriVariantOption>
        <MoriVariantOption unavailable aria-label="Select sold out large size">
          Large
        </MoriVariantOption>
      </div>,
    );

    expect(screen.getByRole('button', { name: 'Add to Cart' })).toBeEnabled();
    expect(screen.getByRole('link', { name: 'Visit the Shop' })).toHaveAttribute('href', '/shop');
    expect(screen.getByLabelText('Email')).toHaveAttribute('name', 'email');
    expect(screen.getByRole('button', { name: 'Select medium size' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Select sold out large size' })).toBeDisabled();
  });

  it('renders decorative petals without collectible controls', () => {
    const { container } = render(<MoriAmbientPetals count={4} />);

    const petalRegion = container.firstElementChild;
    expect(petalRegion).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelectorAll('.mori-ambient-petal')).toHaveLength(4);
    expect(container.querySelector('button')).toBeNull();
    expect(screen.queryByLabelText(/collect/i)).not.toBeInTheDocument();
  });

  it('renders unavailable states without leaking backend implementation names', () => {
    render(
      <MoriUnavailableState
        title="Global petal rankings are temporarily unavailable"
        description="Petal leaderboard data is paused until the wallet service is restored."
      />,
    );

    expect(screen.getByText('Global petal rankings are temporarily unavailable')).toBeInTheDocument();
    expect(screen.getByText(/wallet service is restored/i)).toBeInTheDocument();
    expect(screen.queryByText(/Prisma/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/PetalWallet/i)).not.toBeInTheDocument();
  });

  it('does not query PetalWallet-backed APIs from the cart petal notice', () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    render(<PetalBalanceDisplay />);

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(screen.getByText('Petal Pouch is temporarily unavailable')).toBeInTheDocument();
    expect(screen.getByText(/cart, variants, totals, and checkout remain available/i)).toBeInTheDocument();

    vi.unstubAllGlobals();
  });
});
