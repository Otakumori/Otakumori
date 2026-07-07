import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useUser } from '@clerk/nextjs';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import Navbar from '@/app/components/layout/Navbar';

const push = vi.fn();
const signOut = vi.fn(async () => undefined);

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
  useAuthContext: () => ({
    requireAuthForSoapstone: vi.fn(),
    requireAuthForWishlist: vi.fn(),
    signOut,
  }),
}));

vi.mock('@/app/components/cart/CartProvider', () => ({
  useCart: () => ({ itemCount: 0 }),
}));

vi.mock('@/app/components/search/GlobalSearch', () => ({
  GlobalSearch: () => <div data-testid="global-search" />,
}));

describe('Navbar Clerk session states', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a neutral loading account placeholder instead of Sign In while Clerk resolves', () => {
    vi.mocked(useUser).mockReturnValue({
      isLoaded: false,
      isSignedIn: false,
      user: null,
    } as any);

    render(<Navbar />);

    expect(screen.getAllByLabelText(/loading account state/i).length).toBeGreaterThan(0);
    expect(screen.queryByRole('link', { name: /^sign in$/i })).not.toBeInTheDocument();
  });

  it('renders redirect-based Sign In when Clerk resolves signed out', () => {
    vi.mocked(useUser).mockReturnValue({
      isLoaded: true,
      isSignedIn: false,
      user: null,
    } as any);

    render(<Navbar />);

    const signIn = screen.getAllByRole('link', { name: /^sign in$/i })[0];
    expect(signIn).toHaveAttribute(
      'href',
      `/sign-in?redirect_url=${encodeURIComponent('/admin/printify')}`,
    );
  });

  it('renders signed-in identity and account menu on desktop', async () => {
    vi.mocked(useUser).mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      user: {
        fullName: 'Admin Traveler',
        firstName: 'Admin',
        imageUrl: '',
        primaryEmailAddress: { emailAddress: 'admin@example.com' },
        emailAddresses: [{ emailAddress: 'admin@example.com' }],
      },
    } as any);

    render(<Navbar />);

    fireEvent.click(screen.getByRole('button', { name: /user menu/i }));

    expect(screen.getByText(/signed in as/i)).toBeInTheDocument();
    expect(screen.getAllByText('Admin Traveler').length).toBeGreaterThan(0);
    expect(screen.getByText('admin@example.com')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Account Settings')).toBeInTheDocument();
    expect(screen.getByText('Achievements')).toBeInTheDocument();
    expect(screen.getByText('Wishlist')).toBeInTheDocument();
  });

  it('signs out without a hard refresh', async () => {
    vi.mocked(useUser).mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      user: {
        fullName: 'Admin Traveler',
        primaryEmailAddress: { emailAddress: 'admin@example.com' },
        emailAddresses: [{ emailAddress: 'admin@example.com' }],
      },
    } as any);

    render(<Navbar />);

    fireEvent.click(screen.getByRole('button', { name: /user menu/i }));
    fireEvent.click(screen.getByRole('button', { name: /sign out/i }));

    await waitFor(() => expect(signOut).toHaveBeenCalledOnce());
    expect(push).not.toHaveBeenCalled();
  });
});
