import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import Navbar from '@/app/components/layout/Navbar';

const push = vi.fn();
const signOut = vi.fn(async () => undefined);
const requireAuthForSoapstone = vi.fn();
const requireAuthForWishlist = vi.fn();

let authState: Record<string, any>;

vi.mock('next/navigation', () => ({
  usePathname: () => '/admin/printify',
  useRouter: () => ({ push }),
}));

vi.mock('next/image', () => ({
  default: ({ alt = '', fill: _fill, priority: _priority, ...props }: any) => (
    <img alt={alt} {...props} />
  ),
}));

vi.mock('@/app/contexts/AuthContext', () => ({
  useAuthContext: () => authState,
}));

vi.mock('@/app/components/cart/CartProvider', () => ({
  useCart: () => ({ itemCount: 0 }),
}));

vi.mock('@/app/components/search/GlobalSearch', () => ({
  GlobalSearch: ({ className }: { className?: string }) => (
    <div className={className} data-testid="global-search" />
  ),
}));

function setAuthState(overrides: Record<string, any>) {
  authState = {
    isLoaded: true,
    isSignedIn: false,
    user: null,
    requireAuthForSoapstone,
    requireAuthForWishlist,
    signOut,
    ...overrides,
  };
}

function signedInUser(overrides: Record<string, any> = {}) {
  return {
    username: 'sakura_admin',
    firstName: 'Shipping',
    fullName: 'Shipping Recipient',
    imageUrl: '',
    primaryEmailAddress: { emailAddress: 'admin@example.com' },
    emailAddresses: [{ emailAddress: 'admin@example.com' }],
    publicMetadata: { username: 'metadata_name' },
    ...overrides,
  };
}

describe('Navbar Clerk session states', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    setAuthState({ isLoaded: true, isSignedIn: false, user: null });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders a compact loading account placeholder instead of Sign In while Clerk resolves', () => {
    setAuthState({ isLoaded: false, isSignedIn: false, user: null });

    render(<Navbar />);

    const placeholders = screen.getAllByLabelText(/loading account state/i);
    expect(placeholders.length).toBeGreaterThan(0);
    expect(placeholders[0]).toHaveClass('w-36');
    expect(screen.queryByRole('link', { name: /^sign in$/i })).not.toBeInTheDocument();
  });

  it('renders canonical accounts-domain Sign In with a safe return URL when signed out', () => {
    render(<Navbar />);

    const signIn = screen.getAllByRole('link', { name: /^sign in$/i })[0];
    const href = signIn.getAttribute('href') ?? '';
    const parsed = new URL(href);

    expect(parsed.origin).toBe('https://accounts.otaku-mori.com');
    expect(parsed.pathname).toBe('/sign-in');
    expect(parsed.searchParams.get('redirect_url')).toContain('/admin/printify');
  });

  it('renders signed-in username publicly and private email only inside the account menu', () => {
    setAuthState({
      isLoaded: true,
      isSignedIn: true,
      user: signedInUser(),
    });

    render(<Navbar />);

    expect(screen.getByRole('button', { name: /user menu/i })).toHaveTextContent('sakura_admin');
    expect(screen.queryByText('admin@example.com')).not.toBeInTheDocument();
    expect(screen.queryByText('Shipping Recipient')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /user menu/i }));

    expect(screen.getByText(/signed in as/i)).toBeInTheDocument();
    expect(screen.getAllByText('sakura_admin').length).toBeGreaterThan(0);
    expect(screen.getByText('admin@example.com')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Account Settings')).toBeInTheDocument();
    expect(screen.getByText('Achievements')).toBeInTheDocument();
    expect(screen.getByText('Wishlist')).toBeInTheDocument();
  });

  it('uses initials when no avatar is available and matches mobile signed-in semantics', () => {
    setAuthState({
      isLoaded: true,
      isSignedIn: true,
      user: signedInUser({ username: 'neon_sakura', imageUrl: '' }),
    });

    render(<Navbar />);

    fireEvent.click(screen.getByRole('button', { name: /open menu/i }));

    expect(screen.getAllByText('neon_sakura').length).toBeGreaterThan(0);
    expect(screen.getByText('Signed in as')).toBeInTheDocument();
    expect(screen.getByText('admin@example.com')).toBeInTheDocument();
  });

  it('signs out without a hard refresh', async () => {
    setAuthState({
      isLoaded: true,
      isSignedIn: true,
      user: signedInUser(),
    });

    render(<Navbar />);

    fireEvent.click(screen.getByRole('button', { name: /user menu/i }));
    fireEvent.click(screen.getByRole('button', { name: /sign out/i }));

    await waitFor(() => expect(signOut).toHaveBeenCalledOnce());
    expect(push).not.toHaveBeenCalled();
  });

  it('shows explicit account recovery when Clerk client state does not resolve', async () => {
    vi.useFakeTimers();
    setAuthState({ isLoaded: false, isSignedIn: false, user: null });

    render(<Navbar />);

    expect(screen.queryByText(/account unavailable/i)).not.toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(8000);
    });

    expect(screen.getByRole('button', { name: /account unavailable/i })).toBeInTheDocument();
  });

  it('keeps Mini-Games on one desktop line and shifts desktop layout to large viewports', () => {
    render(<Navbar />);

    const miniGamesDesktopButton = screen
      .getAllByRole('button', { name: /mini-games menu/i })
      .find((button) => button.className.includes('whitespace-nowrap'));

    expect(miniGamesDesktopButton).toBeTruthy();
    expect(screen.getByTestId('global-search')).toHaveClass('hidden', 'xl:block');
    expect(screen.getByRole('button', { name: /open menu/i })).toHaveClass('lg:hidden');
  });
});
