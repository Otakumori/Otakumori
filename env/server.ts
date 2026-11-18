const shouldSkipServerOnly = process.env.OTM_SKIP_SERVER_ONLY === '1';

if (!shouldSkipServerOnly) {
  void import('server-only');
}
import { env as validatedEnv } from '../env.mjs';
import { REQUIRED_SERVER_KEYS } from '@/app/lib/env-keys';
import { isVercelPreview } from '@/app/lib/security/previewIsolation';

type RequiredServerKey = (typeof REQUIRED_SERVER_KEYS)[number];
type RawServerEnv = typeof validatedEnv;
export type ServerEnv = RawServerEnv & Record<RequiredServerKey, string>;

let cachedEnv: ServerEnv | null = null;
const PREVIEW_DISABLED_PROVIDER_KEYS = new Set<RequiredServerKey>([
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'PRINTIFY_API_KEY',
  'PRINTIFY_SHOP_ID',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
]);

function ensureRequired(env: RawServerEnv): asserts env is ServerEnv {
  const missing = REQUIRED_SERVER_KEYS.filter((key) => {
    if (isVercelPreview() && PREVIEW_DISABLED_PROVIDER_KEYS.has(key)) return false;
    const value = env[key];
    return value == null || value.length === 0;
  });

  if (missing.length > 0) {
    throw new Error(
      `Missing required server environment variables: ${missing.join(
        ', ',
      )}. Verify your local .env and Vercel project settings.`,
    );
  }
}

export function getServerEnv(): ServerEnv {
  if (typeof window !== 'undefined') {
    throw new Error('serverEnv imported on the client. Use /env/client in client code.');
  }

  if (!cachedEnv) {
    ensureRequired(validatedEnv);
    cachedEnv = Object.freeze({ ...validatedEnv });
  }

  return cachedEnv;
}

export const env = getServerEnv();
export default env;
