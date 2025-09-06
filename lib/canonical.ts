// Client-safe canonical URL functions
import { env } from '@/env';

const PROD_ORIGIN = 'https://www.otaku-mori.com';

export function canonicalOrigin() {
  // Check if we're in production using a client-safe method
  const isProduction =
    typeof window !== 'undefined'
      ? window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1')
      : env.NODE_ENV === 'production';

  if (isProduction) return PROD_ORIGIN;

  // Infer in dev/preview
  if (typeof window !== 'undefined') return window.location.origin;

  // Server-side fallback
  return 'http://localhost:3000';
}

export function appUrl(path = '/') {
  const base = canonicalOrigin();
  return new URL(path, base).toString();
}

export function hostedSignInUrl(pathAfterSignIn: string = '/') {
  const redirect = encodeURIComponent(appUrl(pathAfterSignIn));
  return `https://accounts.www.otaku-mori.com/sign-in?redirect_url=${redirect}`;
}

export function hostedSignUpUrl(pathAfterSignUp: string = '/onboarding') {
  const redirect = encodeURIComponent(appUrl(pathAfterSignUp));
  return `https://accounts.www.otaku-mori.com/sign-up?redirect_url=${redirect}`;
}
