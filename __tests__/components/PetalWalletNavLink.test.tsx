import { act, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import PetalWalletNavLink from '@/app/components/nav/PetalWalletNavLink';
import PetalWalletBadge from '@/app/components/nav/PetalWalletBadge';

function mockWalletResponse(balance: number) {
  return vi.fn(async () => ({
    ok: true,
    json: async () => ({
      ok: true,
      data: { balance },
    }),
  }));
}

describe('PetalWalletNavLink', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('links signed-out users to sign-in without displaying a fake zero balance', () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    render(
      <PetalWalletNavLink
        isLoaded
        isSignedIn={false}
        signInHref="/sign-in?redirect_url=%2Fshop"
      />,
    );

    const link = screen.getByRole('link', { name: /sign in to view petals/i });

    expect(link).toHaveAttribute('href', '/sign-in?redirect_url=%2Fshop');
    expect(link).toHaveAttribute('data-state', 'signed-out');
    expect(screen.queryByText(/^0$/)).not.toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('renders the wallet badge as a presentational component without Clerk state', () => {
    render(<PetalWalletBadge balance={42} showLabel state="ready" />);

    expect(screen.getByText('Petals')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('42').closest('[data-petal-wallet-badge]')).toHaveAttribute(
      'data-petal-wallet-state',
      'ready',
    );
  });

  it('reserves compact loading geometry while a signed-in balance is pending', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => undefined)));

    render(<PetalWalletNavLink isLoaded isSignedIn signInHref="/sign-in" />);

    expect(screen.getByRole('link', { name: /balance loading/i })).toHaveAttribute(
      'href',
      '/profile/petals',
    );
    expect(screen.getByTestId('petal-wallet-loading')).toBeInTheDocument();
  });

  it('loads and exposes the signed-in balance with bounded accessible text', async () => {
    const fetchMock = mockWalletResponse(37);
    vi.stubGlobal('fetch', fetchMock);

    render(<PetalWalletNavLink isLoaded isSignedIn signInHref="/sign-in" />);

    await waitFor(() =>
      expect(screen.getByRole('link', { name: /view petals, 37 available/i })).toBeInTheDocument(),
    );

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/petals/wallet',
      expect.objectContaining({ credentials: 'same-origin' }),
    );
    expect(screen.getByText('37')).toBeInTheDocument();
    expect(screen.getByText('37').closest('[data-petal-wallet-badge]')).toHaveAttribute(
      'data-petal-wallet-state',
      'ready',
    );
  });

  it('formats large balances without expanding the nav utility', async () => {
    vi.stubGlobal('fetch', mockWalletResponse(1500));

    render(<PetalWalletNavLink isLoaded isSignedIn signInHref="/sign-in" />);

    await waitFor(() => expect(screen.getByText('1K+')).toBeInTheDocument());
  });

  it('fails closed without exposing wallet response details', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: false,
        json: async () => ({
          ok: false,
          error: 'RAW_PROVIDER_DETAIL',
        }),
      })),
    );

    render(<PetalWalletNavLink isLoaded isSignedIn signInHref="/sign-in" />);

    await waitFor(() =>
      expect(screen.getByRole('link', { name: /balance unavailable/i })).toBeInTheDocument(),
    );

    expect(screen.queryByText(/raw_provider_detail/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/^0$/)).not.toBeInTheDocument();
  });

  it('exposes a pulse hook when collection feedback is emitted', async () => {
    vi.stubGlobal('fetch', mockWalletResponse(7));

    render(<PetalWalletNavLink isLoaded isSignedIn signInHref="/sign-in" />);

    await waitFor(() => expect(screen.getByText('7')).toBeInTheDocument());

    const badge = screen.getByText('7').closest('[data-petal-wallet-badge]');
    expect(badge).toHaveAttribute('data-petal-pulse', 'false');

    await act(async () => {
      window.dispatchEvent(new CustomEvent('otm:petal-collected', { detail: { value: 1 } }));
    });

    expect(badge).toHaveAttribute('data-petal-pulse', 'true');

    await waitFor(() => expect(badge).toHaveAttribute('data-petal-pulse', 'false'));
  });
});
