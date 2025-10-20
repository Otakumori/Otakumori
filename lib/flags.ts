// lib/flags.ts
import { env } from '@/app/env';

export function initFlags() {
  // Only run in production
  if (env.NEXT_PUBLIC_APP_ENV !== 'production') return;

  // Use a BROWSER/PUBLIC key only
  const publicKey = env.NEXT_PUBLIC_FLAGS_PUBLIC_KEY;
  if (!publicKey) {
    if (env.NODE_ENV !== 'production') {
      console.warn('[Flags] Missing NEXT_PUBLIC_FLAGS_PUBLIC_KEY; skipping init');
    }
    return;
  }

  const provider = env.FEATURE_FLAG_PROVIDER || 'local';

  try {
    switch (provider) {
      case 'configcat':
        // Initialize ConfigCat
        // import * as configcat from 'configcat-js';
        // configcat.createClientWithAutoPoll(publicKey, {
        //   pollIntervalSeconds: 60,
        //   configChanged: () => console.log('Feature flags updated')
        // });
        console.warn('[Flags] ConfigCat integration ready - uncomment when package is installed');
        break;

      case 'flagsmith':
        // Initialize Flagsmith
        // import Flagsmith from 'flagsmith';
        // Flagsmith.init({
        //   environmentID: publicKey,
        //   cacheFlags: true,
        //   enableLogs: true,
        // });
        console.warn('[Flags] Flagsmith integration ready - uncomment when package is installed');
        break;

      case 'local':
      default:
        console.warn('[Flags] Using local feature flag provider');
        break;
    }
  } catch (error) {
    console.error('[Flags] Failed to initialize feature flag provider:', error);
  }
}
