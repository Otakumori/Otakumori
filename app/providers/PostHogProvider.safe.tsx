'use client';
import posthog from 'posthog-js';
import { useEffect, useRef } from 'react';
import { clientEnv } from '@/env/client';

/**
 * PostHogProvider - Single source of truth for PostHog initialization
 *
 * Prevents double initialization by checking if PostHog is already initialized.
 * This provider should be the ONLY place where posthog.init() is called.
 *
 * Note: instrumentation-client.ts also had posthog.init() - that has been removed
 * to prevent the "You have already initialized PostHog!" warning.
 */
/**
 * Global singleton guard to prevent PostHog initialization across multiple provider instances
 * This ensures PostHog is only initialized once, even if the provider component re-mounts
 */
declare global {
  interface Window {
    __posthogInitialized?: boolean;
  }
}

export default function PostHogProvider({ children }: { children: React.ReactNode }) {
  const initializedRef = useRef(false);

  useEffect(() => {
    // Guard: Only initialize once, even if component re-mounts
    if (initializedRef.current) return;

    // Check if we're in browser environment
    if (typeof window === 'undefined') return;

    // Safely get PostHog key - handle undefined gracefully
    const key = clientEnv.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key || typeof key !== 'string' || key.trim().length === 0) {
      // PostHog key is missing - silently skip initialization
      if (process.env.NODE_ENV === 'development') {
        console.warn('[PostHogProvider] NEXT_PUBLIC_POSTHOG_KEY is not set – analytics disabled.');
      }
      initializedRef.current = true;
      return;
    }

    // Check global singleton guard first (prevents multiple provider instances)
    if (window.__posthogInitialized) {
      initializedRef.current = true;
      return;
    }

    // Check PostHog's built-in initialization state
    // PostHog sets __loaded and config after successful initialization
    const isAlreadyInitialized =
      (posthog as any).__loaded === true ||
      (posthog as any).config !== undefined ||
      (posthog as any).has_opted_out !== undefined; // Uninitialized PostHog has undefined has_opted_out

    if (isAlreadyInitialized) {
      window.__posthogInitialized = true;
      initializedRef.current = true;
      return;
    }

    try {
      // Safely get PostHog host with fallback
      const host =
        clientEnv.NEXT_PUBLIC_POSTHOG_HOST && typeof clientEnv.NEXT_PUBLIC_POSTHOG_HOST === 'string'
          ? clientEnv.NEXT_PUBLIC_POSTHOG_HOST
          : 'https://us.posthog.com';

      posthog.init(key, {
        api_host: host,
        autocapture: true,
        capture_pageview: true,
        capture_pageleave: true,
        // Privacy defaults: never send raw inputs or attributes
        mask_all_text: true,
        mask_all_element_attributes: true,
      });
      // Mark as initialized globally and locally
      window.__posthogInitialized = true;
      initializedRef.current = true;
    } catch (error) {
      // Silently handle "already initialized" errors (prevents console spam)
      if (error instanceof Error && error.message.includes('already initialized')) {
        window.__posthogInitialized = true;
        initializedRef.current = true;
      } else {
        // Log error but don't crash - analytics is non-critical
        if (process.env.NODE_ENV === 'development') {
          console.error('[PostHogProvider] Failed to initialize PostHog:', error);
        }
        // Mark as initialized to prevent retry loops
        initializedRef.current = true;
      }
    }
  }, []);

  return <>{children} </>;
}
