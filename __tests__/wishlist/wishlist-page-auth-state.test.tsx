import { render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import WishlistPage from '@/app/wishlist/page';

const push = vi.fn();
const router = { push };
const fetchMock = vi.fn();

let authState: {
  isLoaded: boolean;
  isSignedIn: boolean;
  userId: string | null;
};

vi.mock('@clerk/nextjs', () => ({
  useAuth: () => authState,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => router,
}));

vi.mock('next/image', () => ({
  default: ({ alt = '', fill: _fill, sizes: _sizes, ...props }: any) => (
    <img alt={alt} {...props} />
  ),
}));

vi.mock('@/app/components/FooterDark', () => ({
  default: () => <footer data-testid="footer" />,
}));

vi.mock('@/app/components/empty-states', () => ({
  EmptyWishlist: () => <div data-testid="empty-wishlist">Empty wishlist</div>,
}));

vi.mock('@/app/components/ui/Skeleton', () => ({
  ShopGridSkeleton: ({ count }: { count: number }) => (
    <div data-testid="wishlist-skeleton">Loading {count} items</div>
  ),
}));

vi.mock('@/app/components/GlassPanel', () => ({
  default: ({ children }: { children: ReactNode }) => <section>{children}</section>,
}));

vi.mock('@/app/lib/logger', () => ({
  logger: {
    error: vi.fn(),
  },
}));

function setAuthState(overrides: Partial<typeof authState>) {
  authState = {
    isLoaded: true,
    isSignedIn: false,
    userId: null,
    ...overrides,
  };
}

function mockWishlistResponse(body: unknown, ok = true) {
  fetchMock.mockResolvedValueOnce({
    ok,
    json: vi.fn().mockResolvedValue(body),
  });
}

describe('WishlistPage auth settlement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setAuthState({});
    vi.stubGlobal('fetch', fetchMock);
  });

  it('keeps unresolved Clerk state on a stable loading surface without redirecting or fetching', () => {
    setAuthState({ isLoaded: false, isSignedIn: false, userId: null });

    render(<WishlistPage />);

    expect(screen.getByRole('heading', { name: /my wishlist/i })).toBeInTheDocument();
    expect(screen.getByTestId('wishlist-skeleton')).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('redirects once only after Clerk confirms the visitor is signed out', async () => {
    setAuthState({ isLoaded: true, isSignedIn: false, userId: null });

    render(<WishlistPage />);

    await waitFor(() => expect(push).toHaveBeenCalledTimes(1));
    const target = new URL(push.mock.calls[0][0]);
    expect(target.origin).toBe('https://accounts.otaku-mori.com');
    expect(target.pathname).toBe('/sign-in');
    expect(target.searchParams.get('redirect_url')).toBe('http://localhost:3000/wishlist');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('fetches the wishlist after Clerk confirms a signed-in user', async () => {
    setAuthState({ isLoaded: true, isSignedIn: true, userId: 'clerk_user_123' });
    mockWishlistResponse({ ok: true, data: { items: [] } });

    render(<WishlistPage />);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(fetchMock).toHaveBeenCalledWith('/api/v1/wishlist');
    expect(push).not.toHaveBeenCalled();
    expect(await screen.findByTestId('empty-wishlist')).toBeInTheDocument();
  });

  it('does not duplicate the fetch as auth settles into the same signed-in state', async () => {
    setAuthState({ isLoaded: false, isSignedIn: false, userId: null });
    mockWishlistResponse({ ok: true, data: { items: [] } });

    const { rerender } = render(<WishlistPage />);
    expect(fetchMock).not.toHaveBeenCalled();

    setAuthState({ isLoaded: true, isSignedIn: true, userId: 'clerk_user_123' });
    rerender(<WishlistPage />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    rerender(<WishlistPage />);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('renders a bounded API failure message instead of a raw error object', async () => {
    setAuthState({ isLoaded: true, isSignedIn: true, userId: 'clerk_user_123' });
    mockWishlistResponse({
      ok: false,
      error: {
        code: 'SCHEMA_UNAVAILABLE',
        message: 'Wishlist is temporarily unavailable.',
        details: { raw: 'do not render' },
      },
    });

    render(<WishlistPage />);

    expect(await screen.findByText('Wishlist is temporarily unavailable.')).toBeInTheDocument();
    expect(screen.queryByText('[object Object]')).not.toBeInTheDocument();
    expect(screen.queryByText(/do not render/i)).not.toBeInTheDocument();
  });
});
