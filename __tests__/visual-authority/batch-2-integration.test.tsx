import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { EmptyCart } from '@/app/components/empty-states/EmptyCart';
import { EmptyOrders } from '@/app/components/empty-states/EmptyOrders';
import { EmptySearch } from '@/app/components/empty-states/EmptySearch';
import { EmptyWishlist } from '@/app/components/empty-states/EmptyWishlist';
import { approvedVisualAssets, getApprovedGamePresentation } from '@/lib/approved-visual-assets';
import gamesRegistry from '@/lib/games.meta.json';

vi.mock('next/image', () => ({
  default: ({ alt = '', fill: _fill, sizes: _sizes, priority: _priority, ...props }: any) => (
    <img alt={alt} {...props} />
  ),
}));

describe('approved visual assets batch 2', () => {
  it('uses runtime WebP paths and never source-master PNG paths', () => {
    const serializedAssets = JSON.stringify(approvedVisualAssets);

    expect(serializedAssets).toContain('.webp');
    expect(serializedAssets).not.toContain('.png');
    expect(serializedAssets).not.toContain('docs/design/references');
  });

  it('preserves the Bubble Ragdoll stable ID and route while updating presentation', () => {
    const bubbleGame = gamesRegistry.games.find((game) => game.id === 'bubble-girl');

    expect(bubbleGame).toMatchObject({
      id: 'bubble-girl',
      slug: 'bubble-girl',
      title: 'Bubble Ragdoll',
      image: approvedVisualAssets.games['bubble-ragdoll'].cover,
    });
    expect(getApprovedGamePresentation('bubble-girl')).toMatchObject({
      displayName: 'Bubble Ragdoll',
      hub: '/assets/games/hub/game-bubble-ragdoll-hub.webp',
    });
  });

  it('exposes the existing Maid Café Manager route with its approved presentation', () => {
    expect(gamesRegistry.games.find((game) => game.id === 'maid-cafe-manager')).toMatchObject({
      slug: 'maid-cafe-manager',
      title: 'Maid Café Manager',
      image: approvedVisualAssets.games['maid-cafe-manager'].cover,
    });
    expect(getApprovedGamePresentation('maid-cafe-manager')).toMatchObject({
      hub: '/assets/games/hub/game-maid-cafe-manager-hub.webp',
    });
  });

  it.each([
    [EmptyCart, 'Your cart is feeling light', approvedVisualAssets.emptyStates.cart],
    [EmptyWishlist, 'No favorites yet', approvedVisualAssets.emptyStates.wishlist],
    [EmptySearch, 'No results found', approvedVisualAssets.emptyStates.search],
    [EmptyOrders, 'No orders yet', approvedVisualAssets.destinations.orders],
  ])('keeps %s copy alongside decorative approved artwork', (Component, heading, src) => {
    const { container } = render(<Component />);

    expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
    const artwork = container.querySelector(`img[src="${src}"]`);
    expect(artwork).toHaveAttribute('alt', '');
    expect(artwork?.closest('[aria-hidden="true"]')).not.toBeNull();
  });
});
