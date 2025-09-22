import { env } from '@/env.mjs';

['NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', 'CLERK_SECRET_KEY', 'NEXT_PUBLIC_URL'].forEach((k) => {
  if (!env[k as keyof typeof env]) console.warn(`⚠ Missing ${k}`);
});
