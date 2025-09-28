'use client';
import posthog from 'posthog-js';
import { useEffect } from 'react';

export default function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) return;
    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.posthog.com',
      autocapture: true,
      capture_pageview: true,
      capture_pageleave: true,
      // Privacy defaults: never send raw inputs or attributes
      mask_all_text: true,
      mask_all_element_attributes: true,
    });
  }, []);
  return <>{children}</>;
}
