'use client';
import posthog from 'posthog-js';
import type { EventName } from './events.safe';

/** No-op if PH isn't loaded; never throws; avoids blocking frames. */
export function ph(event: EventName, props?: Record<string, unknown>) {
  try {
    if (typeof window === 'undefined') return;
    if (!(posthog as any)?.capture) return;
    (window as any).requestIdleCallback?.(() => posthog.capture(event, props ?? {})) ??
      posthog.capture(event, props ?? {});
  } catch {}
}
