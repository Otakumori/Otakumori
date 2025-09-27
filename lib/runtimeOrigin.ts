/**
 * Runtime origin resolver for dynamic environments
 * Resolves canonical origin for API calls and redirects
 */
import { env } from '@/env.mjs';

/**
 * Get the canonical runtime origin for the application
 * Prioritizes explicit public origin vars, falls back to Vercel URL, then localhost
 * @returns Canonical origin URL without trailing slash
 */
export function getRuntimeOrigin(): string {
  // Check for explicit public origin configuration
  const publicOrigin =
    env.NEXT_PUBLIC_CANONICAL_ORIGIN || env.NEXT_PUBLIC_SITE_URL || env.NEXT_PUBLIC_APP_URL;

  if (publicOrigin) {
    return publicOrigin.replace(/\/$/, '');
  }

  // Fall back to Vercel URL in deployed environments
  const vercelUrl = env.VERCEL_URL ? `https://${env.VERCEL_URL}` : '';

  // Final fallback to localhost for development
  return vercelUrl || 'http://localhost:3000';
}

/**
 * Get the base URL for API calls (always returns origin without trailing slash)
 * Use this for internal API fetches instead of hardcoded localhost
 * @returns Base URL for API calls
 */
export function getApiBaseUrl(): string {
  return getRuntimeOrigin();
}

/**
 * Resolve a relative path to an absolute URL using runtime origin
 * @param path - Relative path (with or without leading slash)
 * @returns Absolute URL
 */
export function resolveUrl(path: string): string {
  const origin = getRuntimeOrigin();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${origin}${normalizedPath}`;
}
