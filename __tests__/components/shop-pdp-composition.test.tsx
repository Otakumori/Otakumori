import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import BuyReadyShopCatalog from '@/app/components/shop/BuyReadyShopCatalog';
import ProductClient from '@/app/shop/product/[id]/ProductClient';
import { shopProduct } from '@/tests/fixtures/shop-product';

const mocks = vi.hoisted(() => ({
  fetch: vi.fn(),
  addItem: vi.fn(),
  addProduct: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
}));
vi.mock('next/image', () => ({
  default: ({
    fill: _fill,
    priority: _priority,
    unoptimized: _unoptimized,
    alt,
    ...props
  }: any) => <img alt={alt} {...props} />,
}));
vi.mock('@/app/components/cart/CartProvider', () => ({
  useCart: () => ({ addItem: mocks.addItem }),
}));
vi.mock('@/app/hooks/useRecentlyViewed', () => ({
  useRecentlyViewed: () => ({ addProduct: mocks.addProduct }),
}));
vi.mock('@/app/contexts/ToastContext', () => ({
  useToastContext: () => ({ success: mocks.success, error: mocks.error }),
}));
vi.mock('@/app/components/shop/PetalDiscountBadge', () => ({ PetalDiscountBadge: () => null }));
vi.mock('@/app/components/shop/ShareButtons', () => ({ ShareButtons: () => null }));

function catalogue(products = [shopProduct]) {
  return {
    ok: true,
    json: async () => ({
      ok: true,
      data: { products, filters: { availableCategories: ['apparel'] } },
    }),
  };
}
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('fetch', mocks.fetch);
});
afterEach(() => vi.unstubAllGlobals());

describe('catalogue presentation contracts', () => {
  it('announces loading without fake product links', () => {
    mocks.fetch.mockReturnValue(new Promise(() => {}));
    render(<BuyReadyShopCatalog />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading products');
    expect(screen.queryByTestId('product-card')).not.toBeInTheDocument();
  });
  it('submits supported query/category/price sort parameters', async () => {
    mocks.fetch.mockResolvedValue(catalogue());
    render(<BuyReadyShopCatalog />);
    await screen.findByRole('link', { name: 'View Sakura Starter Tee' });
    fireEvent.click(screen.getByText('Filter and sort'));
    fireEvent.change(screen.getByLabelText('Search the collection'), {
      target: { value: 'Sakura' },
    });
    fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'apparel' } });
    fireEvent.change(screen.getByLabelText('Sort by'), { target: { value: 'price-desc' } });
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    await waitFor(() =>
      expect(mocks.fetch).toHaveBeenLastCalledWith(
        '/api/v1/catalog?limit=48&sortBy=price&sortOrder=desc&q=Sakura&category=apparel',
        expect.any(Object),
      ),
    );
    expect(screen.queryByRole('option', { name: /newest|relevance/i })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }));
    await waitFor(() =>
      expect(mocks.fetch).toHaveBeenLastCalledWith(
        '/api/v1/catalog?limit=48&sortBy=title&sortOrder=asc',
        expect.any(Object),
      ),
    );
  });
  it('shows a customer empty state without admin instructions', async () => {
    mocks.fetch.mockResolvedValue(catalogue([]));
    render(<BuyReadyShopCatalog />);
    expect(
      await screen.findByRole('heading', { name: 'The collection is between arrivals' }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/admin|sync|printify/i)).not.toBeInTheDocument();
  });
  it('bounds transport failure and offers retry', async () => {
    mocks.fetch
      .mockRejectedValueOnce(new Error('internal configuration detail'))
      .mockResolvedValue(catalogue());
    render(<BuyReadyShopCatalog />);
    expect(
      await screen.findByRole('heading', { name: 'Storefront temporarily unavailable' }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/internal configuration/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(
      await screen.findByRole('link', { name: 'View Sakura Starter Tee' }),
    ).toBeInTheDocument();
  });
});

describe('object inspection presentation', () => {
  it('keeps variant image/price, quantity and the existing cart payload intact', async () => {
    const product = {
      ...shopProduct,
      variants: shopProduct.variants.map((v, i) => ({
        ...v,
        previewImageUrl: i ? 'https://example.com/medium.png' : null,
      })),
    };
    mocks.fetch.mockResolvedValue({ ok: true, json: async () => ({ ok: true, data: product }) });
    render(<ProductClient productId={product.id} />);
    await screen.findByRole('heading', { level: 1, name: product.title });
    expect(screen.getByTestId('product-price')).toHaveTextContent('$24.00');
    fireEvent.change(screen.getByLabelText('Select Variant'), { target: { value: 'variant-2' } });
    expect(screen.getByTestId('product-price')).toHaveTextContent('$32.00');
    expect(screen.getByRole('img', { name: product.title })).toHaveAttribute(
      'src',
      'https://example.com/medium.png',
    );
    expect(screen.getByRole('img', { name: product.title })).toHaveAttribute('sizes');
    fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: '2' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add to Cart' }));
    expect(mocks.addItem).toHaveBeenCalledWith(
      expect.objectContaining({
        id: product.id,
        price: 32,
        quantity: 2,
        selectedVariant: { id: 'variant-2', title: 'Medium' },
      }),
    );
    expect(screen.getByRole('link', { name: 'View cart' })).toHaveAttribute('href', '/shop/cart');
    expect(
      screen
        .getByRole('button', { name: 'Add to Cart' })
        .compareDocumentPosition(screen.getByRole('heading', { name: 'About this piece' })) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
  it('retains unavailable variant protection', async () => {
    const product = {
      ...shopProduct,
      variants: shopProduct.variants.map((v) => ({ ...v, inStock: false })),
    };
    mocks.fetch.mockResolvedValue({ ok: true, json: async () => ({ ok: true, data: product }) });
    render(<ProductClient productId={product.id} />);
    expect(await screen.findByRole('button', { name: 'Add to Cart' })).toBeDisabled();
    expect(screen.getByText('This option is unavailable')).toBeInTheDocument();
    expect(mocks.addItem).not.toHaveBeenCalled();
  });
  it('bounds unavailability with one semantic return link', async () => {
    mocks.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ ok: false, error: 'internal provider detail' }),
    });
    render(<ProductClient productId="missing" />);
    expect(await screen.findByRole('heading', { name: 'Product unavailable' })).toBeInTheDocument();
    const link = screen.getByRole('link', { name: 'Return to Shop' });
    expect(link).toHaveAttribute('href', '/shop');
    expect(link.querySelector('button')).toBeNull();
    expect(screen.queryByText(/internal provider detail/)).not.toBeInTheDocument();
  });
});
