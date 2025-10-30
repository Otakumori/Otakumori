/**
 * Build internal checkout link for a product variant
 * Users never leave the Otaku-mori domain
 *
 * @param productId Internal product ID
 * @param variantId Internal product variant ID
 * @returns Internal checkout URL with query parameters
 *
 * @example
 * buildPrintifyCheckoutLink('prod_123', 'var_456')
 * // Returns: '/checkout?product=prod_123&variant=var_456'
 */
export function buildPrintifyCheckoutLink(productId: string, variantId: string): string {
  const params = new URLSearchParams({
    product: productId,
    variant: variantId,
  });
  return `/checkout?${params.toString()}`;
}

/**
 * Parse checkout link parameters from URL search params
 *
 * @param searchParams URLSearchParams from the checkout page
 * @returns Object with productId and variantId (null if not present)
 *
 * @example
 * const params = new URLSearchParams('product=prod_123&variant=var_456')
 * parseCheckoutParams(params)
 * // Returns: { productId: 'prod_123', variantId: 'var_456' }
 */
export function parseCheckoutParams(searchParams: URLSearchParams): {
  productId: string | null;
  variantId: string | null;
} {
  return {
    productId: searchParams.get('product'),
    variantId: searchParams.get('variant'),
  };
}

/**
 * Build checkout link with multiple items (for cart checkout)
 *
 * @param items Array of product/variant pairs
 * @returns Internal checkout URL with encoded item list
 *
 * @example
 * buildMultiItemCheckoutLink([
 *   { productId: 'prod_1', variantId: 'var_1', quantity: 2 },
 *   { productId: 'prod_2', variantId: 'var_2', quantity: 1 }
 * ])
 * // Returns: '/checkout?items=...' (JSON encoded)
 */
export function buildMultiItemCheckoutLink(
  items: Array<{
    productId: string;
    variantId: string;
    quantity: number;
  }>,
): string {
  const encoded = encodeURIComponent(JSON.stringify(items));
  return `/checkout?items=${encoded}`;
}

/**
 * Parse multi-item checkout parameters
 *
 * @param searchParams URLSearchParams from the checkout page
 * @returns Array of items or null if not present or invalid
 */
export function parseMultiItemCheckoutParams(searchParams: URLSearchParams): Array<{
  productId: string;
  variantId: string;
  quantity: number;
}> | null {
  try {
    const itemsParam = searchParams.get('items');
    if (!itemsParam) return null;

    const decoded = decodeURIComponent(itemsParam);
    const items = JSON.parse(decoded);

    // Validate structure
    if (!Array.isArray(items)) return null;

    for (const item of items) {
      if (
        typeof item.productId !== 'string' ||
        typeof item.variantId !== 'string' ||
        typeof item.quantity !== 'number' ||
        item.quantity < 1
      ) {
        return null;
      }
    }

    return items;
  } catch {
    return null;
  }
}
