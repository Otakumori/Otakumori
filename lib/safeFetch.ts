import { env } from '@/env';

export interface SafeFetchOptions {
  allowLive?: boolean;
  probeOnly?: boolean;
  timeout?: number;
  revalidate?: number;
}

export interface SafeFetchResult<T = any> {
  ok: boolean;
  data?: T;
  error?: string;
  blocked?: boolean;
  source?: 'live' | 'probe' | 'blocked';
}

/**
 * Safe fetch utility that respects feature flags and provides graceful fallbacks
 *
 * @param input - URL or Request object
 * @param options - Configuration options
 * @returns Promise<SafeFetchResult<T>>
 *
 * Behavior:
 * - If probeOnly=true: Issues HEAD or GET ?probe=1 with 3-5s timeout
 * - If live data disabled and not probeOnly: Returns blocked result for CTA rendering
 * - If allowLive=true and live enabled: Real fetch with revalidate, timeouts, no credentials
 */
export async function safeFetch<T = any>(
  input: string | URL | Request,
  options: SafeFetchOptions = {},
): Promise<SafeFetchResult<T>> {
  const { allowLive = false, probeOnly = false, timeout = 5000, revalidate = 60 } = options;

  const isLiveDataEnabled = env.NEXT_PUBLIC_LIVE_DATA === '1';
  const isProbeModeEnabled = env.NEXT_PUBLIC_PROBE_MODE === '1';

  // If live data is disabled and not in probe mode, return blocked result
  if (!isLiveDataEnabled && !probeOnly) {
    return {
      ok: false,
      blocked: true,
      error: 'Live data is disabled',
      source: 'blocked',
    };
  }

  // If probe only mode, issue HEAD request or GET with ?probe=1
  if (probeOnly && isProbeModeEnabled) {
    try {
      const url = new URL(input.toString());
      url.searchParams.set('probe', '1');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url.toString(), {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Otaku-mori/1.0.0 (Probe)',
        },
      });

      clearTimeout(timeoutId);

      return {
        ok: response.ok,
        data: undefined,
        error: response.ok ? undefined : `Probe failed: ${response.status}`,
        source: 'probe',
      };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Probe request failed',
        source: 'probe',
      };
    }
  }

  // If live data is enabled and allowLive is true, perform real fetch
  if (isLiveDataEnabled && allowLive) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(input, {
        signal: controller.signal,
        next: { revalidate },
        headers: {
          'User-Agent': 'Otaku-mori/1.0.0 (Live)',
          Accept: 'application/json',
        },
        // Explicitly no credentials to avoid token leaks
        credentials: 'omit',
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return {
          ok: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
          source: 'live',
        };
      }

      const data = await response.json();
      return {
        ok: true,
        data,
        source: 'live',
      };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Live fetch failed',
        source: 'live',
      };
    }
  }

  // Fallback: return blocked result
  return {
    ok: false,
    blocked: true,
    error: 'Live data not allowed or disabled',
    source: 'blocked',
  };
}

/**
 * Convenience function for probe-only requests
 */
export async function probeEndpoint(
  input: string | URL | Request,
  timeout = 3000,
): Promise<SafeFetchResult> {
  return safeFetch(input, { probeOnly: true, timeout });
}

/**
 * Convenience function for live data requests
 */
export async function fetchLiveData<T = any>(
  input: string | URL | Request,
  options: Omit<SafeFetchOptions, 'allowLive'> = {},
): Promise<SafeFetchResult<T>> {
  return safeFetch<T>(input, { ...options, allowLive: true });
}

/**
 * Type guard to check if result is blocked
 */
export function isBlocked(result: SafeFetchResult): result is SafeFetchResult & { blocked: true } {
  return result.blocked === true;
}

/**
 * Type guard to check if result is successful
 */
export function isSuccess<T>(
  result: SafeFetchResult<T>,
): result is SafeFetchResult<T> & { ok: true; data: T } {
  return result.ok === true && result.data !== undefined;
}
