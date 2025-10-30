/**
 * Printify integration utilities
 * Handles category mapping and integration reference generation
 */

import { isCategory } from '@/lib/categories';

/**
 * Generate deterministic integration reference for Printify products
 * Format: printify:<shopId>:<productId>
 */
export function integrationRef(shopId: string, productId: string): string {
  return `printify:${shopId}:${productId}`;
}

/**
 * Parse integration reference to extract shop and product IDs
 */
export function parseIntegrationRef(ref: string): { shopId: string; productId: string } | null {
  const match = ref.match(/^printify:([^:]+):(.+)$/);
  if (!match) return null;

  const shopId = match[1];
  const productId = match[2];
  if (!shopId || !productId) return null;

  return {
    shopId,
    productId,
  };
}

/**
 * Normalize category from Printify product data to canonical slug
 * Uses title, tags, and product_type to determine best category match
 */
export function normalizeCategorySlug(input: {
  title?: string;
  tags?: string[];
  product_type?: string;
}): string {
  const { title = '', tags = [], product_type = '' } = input;

  // Combine all text for analysis
  const allText = [
    title.toLowerCase(),
    product_type.toLowerCase(),
    ...tags.map((tag) => tag.toLowerCase()),
  ].join(' ');

  // Direct product type mappings
  const productTypeMap: Record<string, string> = {
    't-shirt': 't-shirts',
    tshirt: 't-shirts',
    tee: 't-shirts',
    hoodie: 'hoodies-sweatshirts',
    sweatshirt: 'hoodies-sweatshirts',
    'long sleeve': 'long-sleeves',
    longsleeve: 'long-sleeves',
    'tank top': 'tank-tops',
    tanktop: 'tank-tops',
    cap: 'hats',
    hat: 'hats',
    beanie: 'hats',
    sticker: 'stickers',
    poster: 'posters',
    'phone case': 'phone-cases',
    phonecase: 'phone-cases',
    mug: 'mugs-drinkware',
    drinkware: 'mugs-drinkware',
    tumbler: 'mugs-drinkware',
    bag: 'bags',
    backpack: 'bags',
    tote: 'bags',
    accessory: 'accessories',
    accessories: 'accessories',
    home: 'home-living',
    living: 'home-living',
    decor: 'home-living',
  };

  // Check for exact product type matches
  for (const [key, category] of Object.entries(productTypeMap)) {
    if (allText.includes(key)) {
      if (isCategory(category)) {
        return category;
      }
    }
  }

  // Keyword-based category detection
  const keywordMap: Record<string, string> = {
    shirt: 't-shirts',
    top: 't-shirts',
    hoodie: 'hoodies-sweatshirts',
    sweater: 'hoodies-sweatshirts',
    jacket: 'hoodies-sweatshirts',
    'long sleeve': 'long-sleeves',
    tank: 'tank-tops',
    sleeveless: 'tank-tops',
    cap: 'hats',
    beanie: 'hats',
    headwear: 'hats',
    sticker: 'stickers',
    decal: 'stickers',
    poster: 'posters',
    print: 'posters',
    'wall art': 'posters',
    phone: 'phone-cases',
    case: 'phone-cases',
    mug: 'mugs-drinkware',
    cup: 'mugs-drinkware',
    drink: 'mugs-drinkware',
    tumbler: 'mugs-drinkware',
    bag: 'bags',
    backpack: 'bags',
    tote: 'bags',
    purse: 'bags',
    keychain: 'accessories',
    pin: 'accessories',
    badge: 'accessories',
    home: 'home-living',
    decor: 'home-living',
    living: 'home-living',
    room: 'home-living',
  };

  // Check for keyword matches
  for (const [keyword, category] of Object.entries(keywordMap)) {
    if (allText.includes(keyword)) {
      if (isCategory(category)) {
        return category;
      }
    }
  }

  // Default fallback
  return 'accessories';
}

/**
 * Validate that a category slug is canonical
 */
export function validateCategorySlug(slug: string): boolean {
  return isCategory(slug);
}

/**
 * Get category mapping statistics for debugging
 */
export function getCategoryMappingStats(
  products: Array<{
    title?: string;
    tags?: string[];
    product_type?: string;
    category_slug?: string;
  }>,
): Record<string, number> {
  const stats: Record<string, number> = {};

  products.forEach((product) => {
    const mapped = normalizeCategorySlug(product);
    stats[mapped] = (stats[mapped] || 0) + 1;
  });

  return stats;
}
