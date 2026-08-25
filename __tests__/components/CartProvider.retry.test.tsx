import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useAuth } from '@clerk/nextjs';
import { vi } from 'vitest';
import { CartProvider, useCart } from '@/app/components/cart/CartProvider';

vi.mock('@/app/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

const originalFetch = globalThis.fetch;

function response(status: number, body: unknown) {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'content-type': 'application/json' },
    }),
  );
}

function Harness() {
  const { addItem, itemCount, retryServerSync, syncWarning, updateQuantity } = useCart();

  return (
    <div>
      <p data-testid="item-count">{itemCount}</p>
      <p data-testid="warning">{syncWarning ?? ''}</p>
      <button
        type="button"
        onClick={() =>
          addItem({
            id: 'second-product',
            name: 'Second Product',
            price: 12,
            quantity: 1,
            image: '/second.jpg',
          })
        }
      >
        add later
      </button>
      <button type="button" onClick={() => updateQuantity('initial-product::default', 2)}>
        update quantity
      </button>
      <button type="button" onClick={retryServerSync}>
        retry
      </button>
    </div>
  );
}

function seedLocalCart() {
  localStorage.setItem(
    'cart',
    JSON.stringify([
      {
        id: 'initial-product',
        name: 'Initial Product',
        price: 10,
        quantity: 1,
        image: '/initial.jpg',
      },
    ]),
  );
}

describe('CartProvider retry server sync', () => {
  beforeEach(() => {
    localStorage.clear();
    seedLocalCart();
    vi.mocked(useAuth).mockReturnValue({
      isSignedIn: true,
      userId: 'user_123',
      isLoaded: true,
    } as ReturnType<typeof useAuth>);
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('does not call Clerk auth hooks in the explicit visual QA provider stack', async () => {
    vi.mocked(useAuth).mockImplementation(() => {
      throw new Error('Clerk useAuth should not run in visual QA cart mode');
    });
    const fetchMock = vi.fn();
    globalThis.fetch = fetchMock as typeof fetch;

    render(
      <CartProvider visualQaAuth>
        <Harness />
      </CartProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('item-count')).toHaveTextContent('1'));
    expect(useAuth).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('keeps autosync enabled after a successful retry', async () => {
    const syncBodies: unknown[] = [];
    globalThis.fetch = vi.fn(async (input, init) => {
      if (String(input) === '/api/v1/cart') {
        return response(503, { ok: false, error: 'Temporary cart outage' });
      }
      if (String(input) === '/api/v1/cart/sync') {
        syncBodies.push(JSON.parse(String(init?.body)));
        return response(200, { ok: true });
      }
      throw new Error(`Unexpected request: ${String(input)}`);
    }) as typeof fetch;

    render(
      <CartProvider>
        <Harness />
      </CartProvider>,
    );

    await screen.findByText('Your local cart is preserved, but account cart sync is temporarily unavailable.');
    expect(screen.getByTestId('item-count')).toHaveTextContent('1');

    fireEvent.click(screen.getByText('retry'));

    await waitFor(() => expect(screen.getByTestId('warning')).toHaveTextContent(''));
    expect(syncBodies).toHaveLength(1);

    fireEvent.click(screen.getByText('add later'));

    await waitFor(() => expect(syncBodies).toHaveLength(2), { timeout: 1000 });
    expect(syncBodies[1]).toEqual({
      items: expect.arrayContaining([
        { productId: 'initial-product', quantity: 1 },
        { productId: 'second-product', quantity: 1 },
      ]),
    });
  });

  it('keeps the warning visible after a failed retry without starting a request loop', async () => {
    const syncBodies: unknown[] = [];
    globalThis.fetch = vi.fn(async (input, init) => {
      if (String(input) === '/api/v1/cart') {
        return response(503, { ok: false, error: 'Temporary cart outage' });
      }
      if (String(input) === '/api/v1/cart/sync') {
        syncBodies.push(JSON.parse(String(init?.body)));
        return response(503, { ok: false, error: 'Temporary sync outage' });
      }
      throw new Error(`Unexpected request: ${String(input)}`);
    }) as typeof fetch;

    render(
      <CartProvider>
        <Harness />
      </CartProvider>,
    );

    await screen.findByText('Your local cart is preserved, but account cart sync is temporarily unavailable.');

    fireEvent.click(screen.getByText('retry'));
    await waitFor(() => expect(syncBodies).toHaveLength(1));

    expect(screen.getByTestId('warning')).toHaveTextContent(
      'Your local cart is preserved, but account cart sync is temporarily unavailable.',
    );

    await new Promise((resolve) => setTimeout(resolve, 500));

    expect(syncBodies).toHaveLength(1);
  });
});
