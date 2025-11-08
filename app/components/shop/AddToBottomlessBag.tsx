'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { buildPrintifyCheckoutLink } from '@/lib/printify/buildCheckoutLink';
import { clientEnv } from '@/env/client';

interface Props {
  productId: string;
  variantId: string;
  disabled?: boolean;
  className?: string;
  quantity?: number;
}

/**
 * Add to Bottomless Bag button component
 * Navigates users to internal checkout page with product/variant selection
 * Users never leave the Otaku-mori domain
 */
export function AddToBottomlessBag({
  productId,
  variantId,
  disabled = false,
  className = '',
  quantity = 1,
}: Props) {
  const router = useRouter();

  const href = useMemo(
    () => buildPrintifyCheckoutLink(productId, variantId),
    [productId, variantId],
  );

  const label = clientEnv.NEXT_PUBLIC_CHECKOUT_LINK_LABEL || 'Add to Bottomless Bag';

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();

    // Store quantity in session storage for checkout page
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`checkout-quantity-${productId}-${variantId}`, quantity.toString());
    }

    router.push(href);
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      data-testid="checkout-link"
      aria-label={`${label} - ${quantity} item${quantity > 1 ? 's' : ''}`}
      className={`
        inline-flex items-center justify-center rounded-xl px-6 py-3 
        bg-gradient-to-r from-pink-500 to-purple-500 
        hover:from-pink-600 hover:to-purple-600 
        text-white font-bold transition-all duration-300 
        shadow-lg hover:shadow-pink-500/50 
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `.trim()}
    >
      {label}
    </button>
  );
}

/**
 * Compact version of AddToBottomlessBag for use in cards/lists
 */
export function AddToBottomlessBagCompact({
  productId,
  variantId,
  disabled = false,
}: Pick<Props, 'productId' | 'variantId' | 'disabled'>) {
  return (
    <AddToBottomlessBag
      productId={productId}
      variantId={variantId}
      disabled={disabled}
      className="text-sm px-4 py-2"
    />
  );
}
