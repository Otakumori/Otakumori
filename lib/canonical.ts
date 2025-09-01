 
 
import { env } from '@/env';

const PROD_ORIGIN = (env.NEXT_PUBLIC_SITE_URL || 'https://otaku-mori.com').replace(/\/$/, '');

export function canonicalOrigin() {
  // Always canonical in prod
  if (env.NODE_ENV === 'production') return PROD_ORIGIN;

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
  return `https://accounts.otaku-mori.com/sign-in?redirect_url=${redirect}`;
}

export function hostedSignUpUrl(pathAfterSignUp: string = '/onboarding') {
  const redirect = encodeURIComponent(appUrl(pathAfterSignUp));
  return `https://accounts.otaku-mori.com/sign-up?redirect_url=${redirect}`;
}
