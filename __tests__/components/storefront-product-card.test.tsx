import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { shopProduct as baseProduct } from '@/tests/fixtures/shop-product';
import { canOptimizeProductImage } from '@/app/components/shop/product-image';
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

describe('storefront product card system', () => {
  it('renders the preserved product-grid and product-card contracts', () => {
    render(<ProductGrid products={[baseProduct]} />);

    expect(screen.getByTestId('product-grid')).toBeInTheDocument();
    expect(screen.getByTestId('product-card')).toHaveAttribute('href', '/shop/product/product-1');
    expect(screen.getByText('Sakura Starter Tee')).toBeInTheDocument();
    expect(screen.getByText('$24.00')).toBeInTheDocument();
    expect(screen.getByText('Starting at')).toBeInTheDocument();
    expect(screen.getByText('View details')).toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(1);
    expect(screen.queryByText('printify')).not.toBeInTheDocument();
    expect(screen.queryByText('Soft cotton traveler gear.')).not.toBeInTheDocument();
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
  it('optimizes compatible sources and preserves other catalogue image hosts', () => {
    expect(canOptimizeProductImage('/products/tee.webp')).toBe(true);
    expect(canOptimizeProductImage('https://images-api.printify.com/mockup/tee.png')).toBe(true);
    expect(canOptimizeProductImage('https://other.example/tee.png')).toBe(false);
    expect(canOptimizeProductImage('https://images-api.printify.com:8443/tee.png')).toBe(false);
    expect(canOptimizeProductImage('//other.example/tee.png')).toBe(false);
    expect(canOptimizeProductImage('https://printify.com.other.example/tee.png')).toBe(false);
  });
});
