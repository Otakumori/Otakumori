// lib/flags.ts
import { env } from '@/env';

export function initFlags() {
  // Only run in production
  // eslint-disable-next-line no-restricted-syntax -- Next.js public env var, safe for client use
  if (process.env.NEXT_PUBLIC_APP_ENV !== 'production') return;

  // Use a BROWSER/PUBLIC key only
  // eslint-disable-next-line no-restricted-syntax -- Next.js public env var, safe for client use
  const publicKey = process.env.NEXT_PUBLIC_FLAGS_PUBLIC_KEY;
  if (!publicKey) {
    if (env.NODE_ENV !== 'production') {
      console.warn('[Flags] Missing NEXT_PUBLIC_FLAGS_PUBLIC_KEY; skipping init');
    }
    return;
  }

  // TODO: Replace with your provider's client init
  // Example:
  // flagsClient.init({ clientKey: publicKey, /* domain: 'www.otaku-mori.com', */ });
}
