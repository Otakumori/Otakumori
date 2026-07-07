import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { CatalogProduct } from '@/lib/catalog/serialize';
import { ProductGrid, productImageMode } from '@/app/components/shop/StorefrontProductCard';

vi.mock('next/image', () => ({
  default: ({
    alt = '',
    fill: _fill,
    priority: _priority,
    unoptimized: _unoptimized,
    ...props
  }: any) => <img alt={alt} {...props} />,
}));

const baseProduct: CatalogProduct = {
  id: 'product-1',
  title: 'Sakura Starter Tee',
  slug: 'sakura-starter-tee',
  description: '<p>Soft cotton traveler gear.</p>',
  image: 'https://example.com/tee.png',
  images: ['https://example.com/tee.png'],
  tags: [],
  category: 'Apparel',
  categorySlug: 'apparel',
  price: 24,
  priceCents: 2400,
  priceRange: { min: 2400, max: 3200 },
  available: true,
  visible: true,
  active: true,
  provider: 'printify',
  variants: [
    {
      id: 'variant-1',
      title: 'Small',
      sku: 'sku-1',
      price: 24,
      priceCents: 2400,
      inStock: true,
      isEnabled: true,
      printifyVariantId: 101,
      optionValues: [],
      previewImageUrl: null,
    },
    {
      id: 'variant-2',
      title: 'Medium',
      sku: 'sku-2',
      price: 32,
      priceCents: 3200,
      inStock: true,
      isEnabled: true,
      printifyVariantId: 102,
      optionValues: [],
      previewImageUrl: null,
    },
  ],
  integrationRef: 'printify',
  printifyProductId: 'printify-1',
  blueprintId: 1,
  printProviderId: 1,
  lastSyncedAt: null,
};

describe('storefront product card system', () => {
  it('renders the preserved product-grid and product-card contracts', () => {
    render(<ProductGrid products={[baseProduct]} />);

    expect(screen.getByTestId('product-grid')).toBeInTheDocument();
    expect(screen.getByTestId('product-card')).toHaveAttribute('href', '/shop/product/product-1');
    expect(screen.getByText('Sakura Starter Tee')).toBeInTheDocument();
    expect(screen.getByText('$24.00')).toBeInTheDocument();
    expect(screen.getByText('Starting at')).toBeInTheDocument();
    expect(screen.getByText('Choose options')).toBeInTheDocument();
  });

  it('uses contained image framing for product types that need full composition', () => {
    expect(productImageMode({ ...baseProduct, title: 'Ryuko Mesh Sneakers' })).toContain(
      'object-contain',
    );
    expect(productImageMode({ ...baseProduct, title: 'Warlboros Pin' })).toContain(
      'object-contain',
    );
    expect(productImageMode(baseProduct)).toBe('object-cover');
  });
});
