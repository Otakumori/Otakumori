/**
 * Shared catalog utility functions for product deduplication and filtering
 */

export interface CatalogOptions {
  limit?: number;
  excludeTitles?: string[];
  excludeIds?: string[];
  deduplicateBy?: 'blueprintId' | 'id' | 'both';
}

export interface ProductWithBlueprint {
  id: string;
  blueprintId?: number | null;
  title: string;
}

/**
 * Deduplicates products and applies exclusions and limits
 *
 * Deduplication strategy:
 * - If deduplicateBy is 'blueprintId' or 'both': deduplicate by blueprintId first (keep first occurrence)
 * - If deduplicateBy is 'id' or 'both': deduplicate by id (keep first occurrence)
 * - Products without blueprintId are still included if deduplicating by blueprintId
 *
 * Exclusions:
 * - excludeTitles: case-insensitive title matching
 * - excludeIds: exact id matching
 *
 * Limit:
 * - Applied after deduplication and exclusions
 */
export function deduplicateProducts<T extends ProductWithBlueprint>(
  products: T[],
  options: CatalogOptions = {},
): T[] {
  const {
    limit,
    excludeTitles = [],
    excludeIds = [],
    deduplicateBy = 'blueprintId',
  } = options;

  let result = [...products];

  // Apply exclusions by title (case-insensitive)
  if (excludeTitles.length > 0) {
    const excludeTitlesLower = excludeTitles.map((t) => t.toLowerCase().trim());
    result = result.filter(
      (product) => !excludeTitlesLower.includes(product.title.toLowerCase().trim()),
    );
  }

  // Apply exclusions by id
  if (excludeIds.length > 0) {
    result = result.filter((product) => !excludeIds.includes(product.id));
  }

  // Deduplicate by blueprintId (if enabled)
  if (deduplicateBy === 'blueprintId' || deduplicateBy === 'both') {
    const seenBlueprintIds = new Set<number>();
    result = result.filter((product) => {
      if (product.blueprintId != null) {
        if (seenBlueprintIds.has(product.blueprintId)) {
          return false; // Duplicate blueprintId, skip
        }
        seenBlueprintIds.add(product.blueprintId);
      }
      return true; // Keep products without blueprintId or first occurrence
    });
  }

  // Deduplicate by id (if enabled)
  if (deduplicateBy === 'id' || deduplicateBy === 'both') {
    const seenIds = new Set<string>();
    result = result.filter((product) => {
      if (seenIds.has(product.id)) {
        return false; // Duplicate id, skip
      }
      seenIds.add(product.id);
      return true;
    });
  }

  // Apply limit
  if (limit != null && limit > 0) {
    result = result.slice(0, limit);
  }

  return result;
}

