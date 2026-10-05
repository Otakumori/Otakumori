import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const navigation = vi.hoisted(() => ({ push: vi.fn(), params: new URLSearchParams() }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: navigation.push }),
  useSearchParams: () => navigation.params,
}));
vi.mock('next/image', () => ({
  default: ({ alt, src }: { alt: string; src: string }) => <img alt={alt} src={src} />,
}));

import SearchInterface from '@/app/components/search/SearchInterface';
import { EmptyCart } from '@/app/components/empty-states/EmptyCart';
import { approvedVisualAssets } from '@/lib/approved-visual-assets';
import { paths } from '@/lib/paths';

describe('owner-directed public copy', () => {
  beforeEach(() => { window.localStorage.clear(); vi.clearAllMocks(); });

  it('names search accessibly without repeating the owner placeholder or narrowing discovery to products', () => {
    render(<SearchInterface />);
    const form = screen.getByRole('search');
    const input = within(form).getByRole('textbox', { name: 'Search Otaku-mori' });
    expect(input).toHaveAttribute('placeholder', 'What’re ya eyein’?');
    expect(screen.getAllByPlaceholderText('What’re ya eyein’?')).toHaveLength(1);
    expect(screen.queryByText(/suggestions/i)).not.toBeInTheDocument();
    for (const name of ['All', 'Products', 'Posts', 'Games']) {
      expect(within(form).getByRole('button', { name })).toBeVisible();
    }
    fireEvent.click(screen.getByRole('button', { name: 'Games' }));
    expect(screen.getByRole('button', { name: 'Games' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('preserves the approved bag and canonical browse destination with the locked empty-cart copy', () => {
    const { container } = render(<EmptyCart />);
    expect(screen.getByRole('heading', { name: 'Your bottomless bag is... seemingly empty?' })).toBeVisible();
    expect(screen.getByText('Wanna add something?')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Browse the goods' })).toHaveAttribute('href', paths.shop());
    expect(container.querySelector('img')).toHaveAttribute('src', approvedVisualAssets.emptyStates.cart);
  });
});
