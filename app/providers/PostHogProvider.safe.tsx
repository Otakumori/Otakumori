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
export default function PostHogProvider({ children }: { children: React.ReactNode }) {
  const initializedRef = useRef(false);

  useEffect(() => {
    // Guard: Only initialize once, even if component re-mounts
    if (initializedRef.current) return;
    
    const key = clientEnv.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) return;

    // Check if PostHog is already initialized (from instrumentation-client or previous mount)
    if (typeof window !== 'undefined' && (posthog as any).__loaded) {
      initializedRef.current = true;
      return;
    }

    try {
      posthog.init(key, {
        api_host: clientEnv.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.posthog.com',
        autocapture: true,
        capture_pageview: true,
        capture_pageleave: true,
        // Privacy defaults: never send raw inputs or attributes
        mask_all_text: true,
        mask_all_element_attributes: true,
      });
      initializedRef.current = true;
    } catch (error) {
      // Silently fail if PostHog is already initialized (prevents console spam)
      if (error instanceof Error && error.message.includes('already initialized')) {
        initializedRef.current = true;
      } else {
        console.error('[PostHogProvider] Failed to initialize PostHog:', error);
      }
    }
  }, []);

  return <>{children}</>;
}
