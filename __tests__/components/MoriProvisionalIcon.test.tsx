import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { MoriProvisionalIcon } from '@/app/components/mori/MoriProvisionalIcon';

describe('Mori provisional icon family', () => {
  it('keeps unlabeled utility artwork out of the accessibility tree', () => {
    const { container } = render(<MoriProvisionalIcon name="cart" />);

    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
    expect(container.firstChild).toHaveAttribute('data-mori-provisional-icon', 'cart');
  });

  it('can expose an intentional accessible name when used outside a labeled control', () => {
    render(<MoriProvisionalIcon label="Merchant ledger" name="orders" />);

    expect(screen.getByRole('img', { name: 'Merchant ledger' })).toBeVisible();
  });
});
