/**
 * Search query parsing utilities
 * Handles cat:<slug> syntax for category-specific searches
 */

export interface ParsedQuery {
  category?: string;
  text?: string;
  original: string;
}

/**
 * Parse search query for category and text components
 * Supports cat:<slug> syntax to jump to specific categories
 *
 * @param query - Raw search query string
 * @returns Parsed query with category and text components
 *
 * @example
 * parseQuery("cat:t-shirts anime") // { category: "t-shirts", text: "anime", original: "cat:t-shirts anime" }
 * parseQuery("cat:hoodies-sweatshirts") // { category: "hoodies-sweatshirts", text: undefined, original: "cat:hoodies-sweatshirts" }
 * parseQuery("naruto merchandise") // { category: undefined, text: "naruto merchandise", original: "naruto merchandise" }
 */
export function parseQuery(query: string): ParsedQuery {
  if (!query || typeof query !== 'string') {
    return { original: '' };
  }

  const trimmed = query.trim();

  // Match cat:<slug> pattern (case insensitive)
  const categoryMatch = trimmed.match(/cat:([a-z0-9-]+)/i);
  const category = categoryMatch?.[1]?.toLowerCase();

  // Remove cat:<slug> from query to get remaining text
  const text = trimmed.replace(/cat:[a-z0-9-]+/gi, '').trim();

  const result: any = { original: trimmed };
  if (category) result.category = category;
  if (text) result.text = text;
  return result;
}

/**
 * Check if query contains a category directive
 */
export function hasCategoryDirective(query: string): boolean {
  return /cat:[a-z0-9-]+/i.test(query);
}

/**
 * Extract category slug from query if present
 */
export function extractCategorySlug(query: string): string | null {
  const match = query.match(/cat:([a-z0-9-]+)/i);
  return match?.[1]?.toLowerCase() || null;
}

/**
 * Remove category directive from query, returning clean text
 */
export function stripCategoryDirective(query: string): string {
  return query.replace(/cat:[a-z0-9-]+/gi, '').trim();
}
