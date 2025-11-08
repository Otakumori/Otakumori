import { getServerEnv } from '@/env/server';

const env = getServerEnv();

export const APP_URLS = {
  site: env.NEXT_PUBLIC_SITE_URL,
  app: env.NEXT_PUBLIC_APP_URL,
  canonical: env.NEXT_PUBLIC_CANONICAL_ORIGIN,
};

export const STRIPE_CONFIG = {
  secretKey: env.STRIPE_SECRET_KEY,
  webhookSecret: env.STRIPE_WEBHOOK_SECRET,
};

export const CLERK_CONFIG = {
  secretKey: env.CLERK_SECRET_KEY,
  proxyUrl: env.CLERK_PROXY_URL,
};

export const PRINTIFY_CONFIG = {
  apiKey: env.PRINTIFY_API_KEY,
  shopId: env.PRINTIFY_SHOP_ID,
  apiUrl: env.PRINTIFY_API_URL,
};
