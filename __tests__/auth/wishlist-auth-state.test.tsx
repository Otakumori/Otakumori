import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import WishlistPage from '@/app/wishlist/page';

const testState = vi.hoisted(() => ({
  auth: {
    isLoaded: false,
    isSignedIn: false,
    userId: null as string | null,
  },
  push: vi.fn(),
  router: null as { push: ReturnType<typeof vi.fn> } | null,
}));

vi.mock('@clerk/nextjs', () => ({
  useAuth: () => testState.auth,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => testState.router,
}));

vi.mock('next/image', () => ({
  default: ({ alt }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <span data-testid="next-image" aria-label={alt} />
  ),
}));

vi.mock('@/app/components/FooterDark', () => ({
  default: () => <footer data-testid="wishlist-footer" />,
}));

vi.mock('@/app/components/empty-states', () => ({
  EmptyWishlist: () => <div data-testid="empty-wishlist">Your wishlist is empty</div>,
}));

vi.mock('@/app/components/ui/Skeleton', () => ({
  ShopGridSkeleton: ({ count }: { count: number }) => (
    <div data-testid="wishlist-loading">Loading {count} wishlist slots</div>
  ),
}));

vi.mock('@/app/components/GlassPanel', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <section data-testid="glass-panel">{children}</section>
  ),
}));

vi.mock('@/app/lib/logger', () => ({
  logger: {
    error: vi.fn(),
  },
}));

function setAuth(auth: typeof testState.auth) {
  testState.auth = auth;
}

function mockWishlistResponse(body: unknown) {
  return {
    json: vi.fn().mockResolvedValue(body),
  };
}

describe('wishlist auth settlement', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    testState.auth = {
      isLoaded: false,
      isSignedIn: false,
      userId: null,
    };
    testState.push.mockReset();
    testState.router = { push: testState.push };
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  it('renders loading without redirecting or fetching before Clerk resolves', () => {
    render(<WishlistPage />);

    expect(screen.getByTestId('wishlist-loading')).toBeInTheDocument();
    expect(testState.push).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('redirects once without fetching after Clerk confirms signed-out state', async () => {
    setAuth({
      isLoaded: true,
      isSignedIn: false,
      userId: null,
    });

    const { rerender } = render(<WishlistPage />);
    rerender(<WishlistPage />);

    await waitFor(() => expect(testState.push).toHaveBeenCalledTimes(1));
    expect(testState.push.mock.calls[0]?.[0]).toContain('https://accounts.otaku-mori.com/sign-in');
    const redirectUrl = new URL(String(testState.push.mock.calls[0]?.[0])).searchParams.get(
      'redirect_url',
    );
    expect(redirectUrl ? new URL(redirectUrl).pathname : null).toBe('/wishlist');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('fetches once for a settled signed-in user and preserves empty state', async () => {
    setAuth({
      isLoaded: true,
      isSignedIn: true,
      userId: 'clerk-user-a',
    });
    fetchMock.mockResolvedValue(mockWishlistResponse({ ok: true, data: { items: [] } }));

    render(<WishlistPage />);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(fetchMock).toHaveBeenCalledWith('/api/v1/wishlist');
    expect(await screen.findByTestId('empty-wishlist')).toBeInTheDocument();
    expect(testState.push).not.toHaveBeenCalled();
  });

  it('does not duplicate fetches for same-user rerenders and permits a new user fetch', async () => {
    setAuth({
      isLoaded: true,
      isSignedIn: true,
      userId: 'clerk-user-a',
    });
    fetchMock.mockResolvedValue(mockWishlistResponse({ ok: true, data: { items: [] } }));

    const { rerender } = render(<WishlistPage />);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    rerender(<WishlistPage />);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    setAuth({
      isLoaded: true,
      isSignedIn: true,
      userId: 'clerk-user-b',
    });
    rerender(<WishlistPage />);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  });

  it('allows explicit retry after a bounded API failure', async () => {
    setAuth({
      isLoaded: true,
      isSignedIn: true,
      userId: 'clerk-user-a',
    });
    fetchMock
      .mockResolvedValueOnce(mockWishlistResponse({ ok: false, error: 'Wishlist unavailable' }))
      .mockResolvedValueOnce(mockWishlistResponse({ ok: true, data: { items: [] } }));

    render(<WishlistPage />);

    expect(await screen.findByText('Wishlist unavailable')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Try Again' }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(await screen.findByTestId('empty-wishlist')).toBeInTheDocument();
  });
});
