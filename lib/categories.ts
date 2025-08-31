/**
 * Canonical category definitions for navigation, mapping, and search validation
 * Aligned with Printify product types and common e-commerce categories
 */

export type Category = {
  slug: string;
  label: string;
  description?: string;
  icon?: string;
};

export const CATEGORIES: Category[] = [
  { slug: 't-shirts', label: 'T-Shirts', description: 'Anime and gaming themed t-shirts' },
  {
    slug: 'hoodies-sweatshirts',
    label: 'Hoodies & Sweatshirts',
    description: 'Comfortable anime hoodies and sweatshirts',
  },
  { slug: 'long-sleeves', label: 'Long Sleeves', description: 'Long sleeve anime apparel' },
  { slug: 'tank-tops', label: 'Tank Tops', description: 'Anime tank tops and sleeveless shirts' },
  { slug: 'hats', label: 'Hats', description: 'Anime caps, beanies, and headwear' },
  { slug: 'stickers', label: 'Stickers', description: 'Anime stickers and decals' },
  { slug: 'posters', label: 'Posters', description: 'Anime wall art and posters' },
  { slug: 'phone-cases', label: 'Phone Cases', description: 'Anime phone cases and accessories' },
  {
    slug: 'mugs-drinkware',
    label: 'Mugs & Drinkware',
    description: 'Anime mugs, tumblers, and drinkware',
  },
  { slug: 'bags', label: 'Bags', description: 'Anime bags, backpacks, and totes' },
  { slug: 'accessories', label: 'Accessories', description: 'Anime accessories and small items' },
  { slug: 'home-living', label: 'Home & Living', description: 'Anime home decor and living items' },
];

/**
 * Check if a string is a valid category slug
 */
export const isCategory = (slug: string): boolean => {
  return CATEGORIES.some((c) => c.slug === slug);
};

/**
 * Get category by slug
 */
export const getCategoryBySlug = (slug: string): Category | undefined => {
  return CATEGORIES.find((c) => c.slug === slug);
};

/**
 * Get all category slugs as array
 */
export const getCategorySlugs = (): string[] => {
  return CATEGORIES.map((c) => c.slug);
};

/**
 * Get category label by slug
 */
export const getCategoryLabel = (slug: string): string => {
  const category = getCategoryBySlug(slug);
  return category?.label || slug;
};
