import 'server-only';
import { env as validatedEnv } from '../env.mjs';

const REQUIRED_SERVER_KEYS = [
  'CLERK_SECRET_KEY',
  'STRIPE_SECRET_KEY',
  'PRINTIFY_API_KEY',
  'PRINTIFY_SHOP_ID',
] as const;

type RequiredServerKey = (typeof REQUIRED_SERVER_KEYS)[number];
type RawServerEnv = typeof validatedEnv;
export type ServerEnv = RawServerEnv & Record<RequiredServerKey, string>;

let cachedEnv: ServerEnv | null = null;

function ensureRequired(env: RawServerEnv): asserts env is ServerEnv {
  const missing = REQUIRED_SERVER_KEYS.filter((key) => {
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
