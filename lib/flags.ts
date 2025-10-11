// lib/flags.ts
export function initFlags() {
  // Only run in production
  if (process.env.NEXT_PUBLIC_APP_ENV !== 'production') return;

  // Use a BROWSER/PUBLIC key only
  const publicKey = process.env.NEXT_PUBLIC_FLAGS_PUBLIC_KEY;
  if (!publicKey) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[Flags] Missing NEXT_PUBLIC_FLAGS_PUBLIC_KEY; skipping init');
    }
    return;
  }

  // TODO: Replace with your provider's client init
  // Example:
  // flagsClient.init({ clientKey: publicKey, /* domain: 'www.otaku-mori.com', */ });
}
