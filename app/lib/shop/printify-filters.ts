/**
 * Comprehensive filtering utilities for Printify products
 * Filters out placeholder, test, draft, and invalid products
 */

export interface PrintifyProductLike {
    id: string | number;
    title?: string;
    visible?: boolean;
    images?: Array<{ src?: string; is_default?: boolean }> | string[];
    variants?: Array<{ is_enabled?: boolean; is_available?: boolean; id?: number | string; price?: number; available?: boolean; inStock?: boolean; isEnabled?: boolean }>;
    blueprint_id?: number | null;
    blueprintId?: number | null;
    integrationRef?: string | null;
    image?: string;
    printifyProductId?: string | null;
    description?: string;
}

/**
 * Check if a product title indicates it's a test/draft/placeholder product
 */
function isTestOrDraftProduct(title: string): boolean {
    const lowerTitle = title.toLowerCase().trim();
    // Only filter if title explicitly starts with test indicators or is exactly these values
    // Don't filter products that contain these words naturally (e.g., "Test Shirt" could be a real product)
    const exactTestIndicators = [
        '[test]',
        '[draft]',
        '[placeholder]',
        'untitled',
        'new product',
        'product name',
    ];
    
    // Check for exact matches at start
    if (exactTestIndicators.some((indicator) => lowerTitle.startsWith(indicator))) {
        return true;
    }
    
    // Only filter if title is exactly "test", "draft", "placeholder", etc. (very short titles)
    if (lowerTitle.length < 10 && ['test', 'draft', 'placeholder', 'sample', 'example', 'temp'].includes(lowerTitle)) {
        return true;
    }
    
    return false;
}

/**
 * Check if an image URL is a placeholder or invalid
 */
function isPlaceholderImage(imageUrl: string | null | undefined): boolean {
    if (!imageUrl || imageUrl.trim() === '') return true;

    const lowerUrl = imageUrl.toLowerCase();
    const placeholderIndicators = [
        'placeholder',
        'seed:',
        'data:image/svg',
        'blank',
        'default',
        'no-image',
        'missing',
    ];

    return placeholderIndicators.some((indicator) => lowerUrl.includes(indicator));
}

/**
 * Comprehensive filter for Printify products
 * Returns true if the product should be included, false if it should be excluded
 */
export function isValidPrintifyProduct(product: PrintifyProductLike): boolean {
    // Must have an ID
    if (!product.id) return false;

    // Check if ID is a seed/test ID
    const idStr = String(product.id);
    if (idStr.startsWith('seed:') || idStr.includes('test') || idStr.includes('draft')) {
        return false;
    }

    // Check integrationRef for seed indicators
    if (product.integrationRef?.startsWith('seed:')) {
        return false;
    }

    // Must be visible (if visible property exists)
    if (product.visible !== undefined && !product.visible) {
        return false;
    }

    // Must have at least one enabled variant
    if (product.variants && product.variants.length > 0) {
        const hasEnabledVariant = product.variants.some(
            (variant) => variant.is_enabled !== false && variant.is_available !== false,
        );
        if (!hasEnabledVariant) return false;
    }

    // Check for valid image
    let imageUrl: string | null = null;

    // Try to get image from various sources
    if (product.image) {
        imageUrl = product.image;
    } else if (product.images && product.images.length > 0) {
      // Handle both object array and string array
      const firstImage = product.images[0];
      if (typeof firstImage === 'string') {
          imageUrl = firstImage;
      } else {
        // Prefer default image, otherwise first image
          const defaultImage = product.images.find((img) => typeof img === 'object' && img.is_default);
          imageUrl = (defaultImage && typeof defaultImage === 'object' ? defaultImage.src : null) ||
              (typeof firstImage === 'object' ? firstImage.src : null) || null;
      }
  }

    // Must have a valid, non-placeholder image
    if (isPlaceholderImage(imageUrl)) {
        return false;
    }

    // Check title for test/draft indicators
    if (product.title && isTestOrDraftProduct(product.title)) {
        return false;
    }

    return true;
}

/**
 * Filter an array of Printify products
 */
export function filterValidPrintifyProducts<T extends PrintifyProductLike>(
    products: T[],
): T[] {
    return products.filter(isValidPrintifyProduct);
}

