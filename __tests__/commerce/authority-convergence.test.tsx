import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { paths } from '@/lib/paths';
import LegacyCartPage from '@/app/cart/page';
import LegacyCheckoutPage from '@/app/checkout/page';
import LegacyProfileOrdersPage from '@/app/profile/orders/page';
import { GET as accountOrdersRedirect } from '@/app/account/orders/route';
import CheckoutSuccessPage from '@/app/shop/checkout/success/page';
import CartPage from '@/app/shop/cart/page';
import CheckoutPage from '@/app/shop/checkout/page';

const mocks = vi.hoisted(() => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
  replace: vi.fn(),
  clearCart: vi.fn(),
  updateQuantity: vi.fn(),
  removeItem: vi.fn(),
  retryServerSync: vi.fn(),
  fetch: vi.fn(),
  search: new URLSearchParams('session_id=cs_test_confirmed'),
}));

vi.mock('next/navigation', () => ({
  redirect: mocks.redirect,
  useRouter: () => ({ replace: mocks.replace }),
  useSearchParams: () => mocks.search,
}));

vi.mock('@clerk/nextjs', () => ({
  useAuth: () => ({ isSignedIn: true }),
  useUser: () => ({ user: null }),
}));

vi.mock('@/app/components/cart/CartProvider', () => ({
  useCart: () => ({
    items: [
      {
        id: 'product_1',
        name: 'Sakura Tee',
        price: 29,
        quantity: 1,
        image: '/tee.webp',
        selectedVariant: { id: 'variant_1', title: 'Small' },
      },
    ],
    total: 29,
    clearCart: mocks.clearCart,
    updateQuantity: mocks.updateQuantity,
    removeItem: mocks.removeItem,
    syncWarning: null,
    retryServerSync: mocks.retryServerSync,
  }),
}));

vi.mock('@/app/components/shop/PetalBalanceDisplay', () => ({
  PetalBalanceDisplay: () => <div>Petal balance</div>,
}));

vi.mock('next/image', () => ({
  default: ({ alt = '', fill: _fill, ...props }: any) => <img alt={alt} {...props} />,
}));

describe('commerce authority convergence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.search = new URLSearchParams('session_id=cs_test_confirmed');
    mocks.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, data: { orderId: 'order_1', orderNumber: 42, status: 'pending' } }),
    });
    vi.stubGlobal('fetch', mocks.fetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('centralizes canonical commerce destinations', () => {
    expect(paths.cart()).toBe('/shop/cart');
    expect(paths.checkout()).toBe('/shop/checkout');
    expect(paths.orders()).toBe('/orders');
  });

  it.each([
    ['cart', LegacyCartPage, paths.cart()],
    ['checkout', LegacyCheckoutPage, paths.checkout()],
    ['profile orders', LegacyProfileOrdersPage, paths.orders()],
  ])('redirects legacy %s routes to canonical authority', (_name, Route, expected) => {
    expect(Route).toThrow(`NEXT_REDIRECT:${expected}`);
  });

  it('redirects the historical account orders URL to canonical orders', () => {
    const response = accountOrdersRedirect(new Request('https://otaku-mori.example/account/orders') as any);
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('https://otaku-mori.example/orders');
  });

  it('does not clear a cart without a verified success return', async () => {
    mocks.search = new URLSearchParams();
    render(<CheckoutSuccessPage />);

    expect(await screen.findByRole('heading', { name: 'Order confirmation unavailable' })).toBeInTheDocument();
    expect(mocks.clearCart).not.toHaveBeenCalled();
  });

  it('clears the cart only after server confirmation and links to canonical orders', async () => {
    render(<CheckoutSuccessPage />);

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Order Confirmed' })).toBeInTheDocument());
    expect(mocks.clearCart).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('link', { name: 'View Orders' })).toHaveAttribute('href', '/orders');
  });

  it('gives canonical cart controls accessible names', () => {
    render(<CartPage />);

    expect(screen.getByRole('button', { name: 'Decrease quantity for Sakura Tee' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Increase quantity for Sakura Tee' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove Sakura Tee from cart' })).toBeInTheDocument();
  });

  it('gives canonical checkout fields visible associated labels', () => {
    render(<CheckoutPage />);

    expect(screen.getByLabelText('First name')).toHaveAttribute('name', 'firstName');
    expect(screen.getByLabelText('Last name')).toHaveAttribute('name', 'lastName');
    expect(screen.getByLabelText('Email')).toHaveAttribute('name', 'email');
    expect(screen.getByLabelText('Street address')).toHaveAttribute('name', 'address');
    expect(screen.getByLabelText('Country')).toHaveAttribute('name', 'country');
  });
});
