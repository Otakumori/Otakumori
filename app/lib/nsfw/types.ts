/**
 * NSFW Content Rating System
 * 
 * Centralized content rating types for NSFW gating.
 * Maps to cosmetics config and other content systems.
 */

export type ContentRating = 'sfw' | 'spicy' | 'nsfw-illustration' | 'nsfw-hard';

/**
 * NSFW Visibility Level
 * Controls how NSFW content is displayed to others
 */
export type NSFWVisibility = 'off' | 'on' | 'private';

/**
 * Check if a content rating is NSFW
 */
export function isNSFWContent(rating: ContentRating): boolean {
  return rating !== 'sfw';
}

/**
 * Get the severity level of a content rating
 * Higher numbers = more explicit
 */
export function getContentRatingLevel(rating: ContentRating): number {
  switch (rating) {
    case 'sfw':
      return 0;
    case 'spicy':
      return 1;
    case 'nsfw-illustration':
      return 2;
    case 'nsfw-hard':
      return 3;
    default:
      return 0;
  }
}

/**
 * Map old rating system to new system
 */
export function mapLegacyRating(oldRating: string): ContentRating {
  switch (oldRating) {
    case 'nsfw-soft':
      return 'nsfw-illustration';
    case 'nsfw-hard':
      return 'nsfw-hard';
    case 'spicy':
      return 'spicy';
    default:
      return 'sfw';
  }
}

