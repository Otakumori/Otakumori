import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import Navbar from '@/app/components/layout/Navbar';

const push = vi.fn();
const signOut = vi.fn(async () => undefined);
const requireAuthForSoapstone = vi.fn();
const requireAuthForWishlist = vi.fn();

let authState: Record<string, any>;
let mockedPathname = '/admin/printify';

vi.mock('next/navigation', () => ({
  usePathname: () => mockedPathname,
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
    status: 'signed-out',
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

function authHref(name: RegExp) {
  return screen.getAllByRole('link', { name })[0].getAttribute('href') ?? '';
}

function hrefFromServerHtml(html: string, label: 'Sign In' | 'Sign Up') {
  const match = html.match(new RegExp(`<a href="([^"]+)"[^>]*>${label}</a>`));
  return match?.[1]?.replace(/&amp;/g, '&') ?? '';
}

describe('Navbar Clerk session states', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    mockedPathname = '/admin/printify';
    setAuthState({ isLoaded: true, isSignedIn: false, user: null });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('server-renders same-origin auth route hrefs without a Production return origin', () => {
    vi.stubGlobal('window', undefined);

    const html = renderToString(<Navbar />);

    expect(html).not.toContain('https://www.otaku-mori.com');
    expect(html).not.toContain('https://accounts.otaku-mori.com/sign-in');
    expect(html).not.toContain('https://accounts.otaku-mori.com/sign-up');
    expect(html).toContain('href="/sign-in?redirect_url=%2Fadmin%2Fprintify"');
    expect(html).toContain('href="/sign-up?redirect_url=%2Fadmin%2Fprintify"');
  });

  it('keeps server and client auth hrefs identical for hydration', () => {
    vi.stubGlobal('window', undefined);
    const serverHtml = renderToString(<Navbar />);
    const serverSignInHref = hrefFromServerHtml(serverHtml, 'Sign In');
    const serverSignUpHref = hrefFromServerHtml(serverHtml, 'Sign Up');
    vi.unstubAllGlobals();

    render(<Navbar />);

    expect(authHref(/^sign in$/i)).toBe(serverSignInHref);
    expect(authHref(/^sign up$/i)).toBe(serverSignUpHref);
  });

  it('renders a compact loading account placeholder instead of Sign In while Clerk resolves', () => {
    setAuthState({ status: 'loading', isLoaded: false, isSignedIn: false, user: null });

    render(<Navbar />);

    const placeholders = screen.getAllByLabelText(/loading account state/i);
    expect(placeholders.length).toBeGreaterThan(0);
    expect(placeholders[0]).toHaveClass('w-36');
    expect(screen.queryByRole('link', { name: /^sign in$/i })).not.toBeInTheDocument();
  });

  it('renders same-origin Sign In route with a safe return path when signed out', () => {
    render(<Navbar />);

    const parsed = new URL(authHref(/^sign in$/i), 'https://pr73-preview.otaku-mori.com');

    expect(parsed.pathname).toBe('/sign-in');
    expect(parsed.searchParams.get('redirect_url')).toBe('/admin/printify');
  });

  it('renders same-origin Sign Up route with the same safe return path when signed out', () => {
    render(<Navbar />);

    const parsed = new URL(authHref(/^sign up$/i), 'https://pr73-preview.otaku-mori.com');

    expect(parsed.pathname).toBe('/sign-up');
    expect(parsed.searchParams.get('redirect_url')).toBe('/admin/printify');
  });

  it('preserves /shop as a same-origin Sign In and Sign Up return path', () => {
    mockedPathname = '/shop';

    render(<Navbar />);

    const signIn = new URL(authHref(/^sign in$/i), 'https://staging.otaku-mori.com');
    const signUp = new URL(authHref(/^sign up$/i), 'https://staging.otaku-mori.com');

    expect(signIn.pathname).toBe('/sign-in');
    expect(signIn.searchParams.get('redirect_url')).toBe('/shop');
    expect(signUp.pathname).toBe('/sign-up');
    expect(signUp.searchParams.get('redirect_url')).toBe('/shop');
  });

  it('normalizes unsafe Navbar return paths to the local app root', () => {
    mockedPathname = '//attacker.example/sign-in';

    render(<Navbar />);

    const signIn = new URL(authHref(/^sign in$/i), 'http://localhost:3000');
    const signUp = new URL(authHref(/^sign up$/i), 'http://localhost:3000');

    expect(signIn.searchParams.get('redirect_url')).toBe('/');
    expect(signUp.searchParams.get('redirect_url')).toBe('/');
    expect(authHref(/^sign in$/i)).not.toContain('attacker.example');
    expect(authHref(/^sign up$/i)).not.toContain('attacker.example');
  });

  it('normalizes backslash return paths before building Navbar auth links', () => {
    mockedPathname = '/admin\\printify';

    render(<Navbar />);

    const signIn = new URL(authHref(/^sign in$/i), 'https://pr73-preview.otaku-mori.com');
    const signUp = new URL(authHref(/^sign up$/i), 'https://pr73-preview.otaku-mori.com');

    expect(signIn.searchParams.get('redirect_url')).toBe('/');
    expect(signUp.searchParams.get('redirect_url')).toBe('/');
  });

  it('uses the same auth hrefs in the mobile signed-out menu', () => {
    render(<Navbar />);

    fireEvent.click(screen.getByRole('button', { name: /open menu/i }));

    const signInLinks = screen.getAllByRole('link', { name: /^sign in$/i });
    const signUpLinks = screen.getAllByRole('link', { name: /^sign up$/i });

    expect(signInLinks.map((link) => link.getAttribute('href'))).toEqual([
      '/sign-in?redirect_url=%2Fadmin%2Fprintify',
      '/sign-in?redirect_url=%2Fadmin%2Fprintify',
    ]);
    expect(signUpLinks.map((link) => link.getAttribute('href'))).toEqual([
      '/sign-up?redirect_url=%2Fadmin%2Fprintify',
      '/sign-up?redirect_url=%2Fadmin%2Fprintify',
    ]);
  });

  it('renders signed-in username publicly and private email only inside the account menu', () => {
    setAuthState({
      isLoaded: true,
      isSignedIn: true,
      status: 'signed-in',
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
    expect(screen.getByText('Account & Security')).toBeInTheDocument();
    expect(screen.getByText('Achievements')).toBeInTheDocument();
    expect(screen.getByText('Wishlist')).toBeInTheDocument();
  });

  it('uses initials when no avatar is available and matches mobile signed-in semantics', () => {
    setAuthState({
      isLoaded: true,
      isSignedIn: true,
      status: 'signed-in',
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
      status: 'signed-in',
      user: signedInUser(),
    });

    render(<Navbar />);

    fireEvent.click(screen.getByRole('button', { name: /user menu/i }));
    fireEvent.click(screen.getByRole('button', { name: /sign out/i }));

    await waitFor(() => expect(signOut).toHaveBeenCalledWith({ redirectUrl: '/' }));
    expect(push).not.toHaveBeenCalled();
  });

  it('shows explicit account recovery when Clerk client state does not resolve', async () => {
    vi.useFakeTimers();
    setAuthState({ status: 'loading', isLoaded: false, isSignedIn: false, user: null });

    render(<Navbar />);

    expect(screen.queryByText(/account unavailable/i)).not.toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(8000);
    });

    expect(
      screen.getByRole('button', { name: /account service unavailable/i }),
    ).toBeInTheDocument();
  });

  it('renders explicit account service unavailable state without Sign In', () => {
    setAuthState({ status: 'unavailable', isLoaded: false, isSignedIn: false, user: null });

    render(<Navbar />);

    expect(
      screen.getByRole('button', { name: /account service unavailable/i }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /^sign in$/i })).not.toBeInTheDocument();
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
