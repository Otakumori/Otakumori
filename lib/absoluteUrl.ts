import { headers } from 'next/headers';
import { env } from '@/env.mjs';

/**
 * Generate absolute URLs for server-side requests
 * Handles both development and production environments
 */
export async function absoluteUrl(path: string) {
  const h = await headers();
  const proto = h.get('x-forwarded-proto') ?? 'https';
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
  const base = env.NEXT_PUBLIC_SITE_URL || `${proto}://${host}`;
  return new URL(path, base).toString();
}
