import { clientEnv } from '@/env/client';

const truthy = (value: string | undefined, defaultValue = false) => {
  if (value == null) return defaultValue;
  return !['false', '0', 'off'].includes(value.toLowerCase());
};

const appEnv = clientEnv.NEXT_PUBLIC_APP_ENV ?? clientEnv.NODE_ENV;

export const RUNTIME_FLAGS = {
  isDev: clientEnv.NODE_ENV === 'development',
  isProd: clientEnv.NODE_ENV === 'production',
  appEnv,
};

export const FEATURE_FLAGS = {
  performanceMonitorEnabled: truthy(clientEnv.NEXT_PUBLIC_FEATURE_PERF_MODULE, true),
  audioEnabled: truthy(clientEnv.NEXT_PUBLIC_ENABLE_AUDIO, true),
};

export const PUBLIC_KEYS = {
  apiKey: clientEnv.NEXT_PUBLIC_API_KEY ?? '',
  adminApiKey: clientEnv.NEXT_PUBLIC_ADMIN_API_KEY ?? '',
  flagsPublicKey: clientEnv.NEXT_PUBLIC_FLAGS_PUBLIC_KEY,
};

export const CLERK_PUBLIC_PATHS = {
  signInUrl: clientEnv.NEXT_PUBLIC_CLERK_SIGN_IN_URL ?? '/sign-in',
  signUpUrl: clientEnv.NEXT_PUBLIC_CLERK_SIGN_UP_URL ?? '/sign-up',
};

export const PETAL_COLOR_OVERRIDE = clientEnv.NEXT_PUBLIC_PETAL_COLOR_OVERRIDE;

export const FEATURE_FLAG_PROVIDER =
  clientEnv.NEXT_PUBLIC_FEATURE_FLAG_PROVIDER ?? 'local';
