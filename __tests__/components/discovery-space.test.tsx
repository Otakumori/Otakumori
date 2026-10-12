import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const navigation = vi.hoisted(() => ({
  push: vi.fn(),
  params: new URLSearchParams(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: navigation.push }),
  useSearchParams: () => new URLSearchParams(navigation.params),
}));

vi.mock('next/image', () => ({
  default: ({ alt, src }: { alt: string; src: string }) => <img alt={alt} src={src} />,
}));

import SearchPage from '@/app/search/page';
import SearchInterface from '@/app/components/search/SearchInterface';

describe('Discovery Space', () => {
  beforeEach(() => {
    navigation.params = new URLSearchParams();
    navigation.push.mockReset();
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it('applies the Discovery archetype while keeping search immediately accessible', () => {
    const { container } = render(<SearchPage />);

    expect(container.querySelector('main')).toHaveAttribute('data-mori-archetype', 'discovery');
    expect(screen.getByRole('heading', { level: 1, name: 'Search Otaku-mori' })).toBeVisible();
    expect(screen.getByRole('search')).toBeVisible();
    expect(screen.getByRole('textbox', { name: 'Search Otaku-mori' })).toHaveAttribute(
      'placeholder',
      'What’re ya eyein’?',
    );
    expect(screen.getByRole('textbox', { name: 'Search Otaku-mori' })).toHaveAttribute('name', 'q');
  });

  it('renders authoritative results as a semantic, keyboard-reachable index', async () => {
    navigation.params = new URLSearchParams('q=moon');
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          ok: true,
          data: {
            results: [
              {
                id: 'product-1',
                type: 'product',
                title: 'Moon Reliquary',
                description: 'A quiet object for the night archive.',
                url: '/shop/product/product-1',
                metadata: { priceCents: 4200, category: 'Relics' },
              },
            ],
            totalCount: 1,
            hasMore: false,
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    render(<SearchInterface />);

    expect(await screen.findByRole('heading', { name: '1 result for "moon"' })).toBeVisible();
    expect(screen.getByRole('link', { name: /Moon Reliquary/i })).toHaveAttribute(
      'href',
      '/shop/product/product-1',
    );
    expect(screen.getByText('$42.00')).toBeVisible();
  });

  it('preserves an edited query while the current URL query is unchanged', async () => {
    navigation.params = new URLSearchParams('q=missing+relic');
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          ok: true,
          data: { results: [], totalCount: 0, hasMore: false },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    render(<SearchInterface />);

    const input = screen.getByRole('textbox', { name: 'Search Otaku-mori' });
    await waitFor(() => expect(input).toHaveValue('missing relic'));
    fireEvent.change(input, { target: { value: 'unavailable archive' } });
    await waitFor(() => expect(input).toHaveValue('unavailable archive'));
  });

  it('uses the shared assertive system state when search is unavailable', async () => {
    navigation.params = new URLSearchParams('q=moon');
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 503 }));

    render(<SearchInterface />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Search is temporarily unavailable');
    });
  });
});
