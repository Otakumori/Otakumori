const ACCOUNTS_ORIGIN = 'https://accounts.otaku-mori.com';
const FALLBACK_APP_ORIGIN = 'https://www.otaku-mori.com';

function currentAppOrigin() {
  if (typeof window === 'undefined') return FALLBACK_APP_ORIGIN;
  return window.location.origin;
}

function safeReturnUrl(returnUrl?: string) {
  const appOrigin = currentAppOrigin();
  const fallback = typeof window === 'undefined' ? appOrigin : window.location.href;

  try {
    const parsed = new URL(returnUrl || fallback, appOrigin);
    if (parsed.protocol !== 'https:' && parsed.hostname !== 'localhost') {
      return appOrigin;
    }

    return parsed.toString();
  } catch {
    return appOrigin;
  }
}

export function buildCanonicalSignInUrl(returnUrl?: string) {
  const url = new URL('/sign-in', ACCOUNTS_ORIGIN);
  url.searchParams.set('redirect_url', safeReturnUrl(returnUrl));
  return url.toString();
}

export function buildCanonicalSignUpUrl(returnUrl?: string) {
  const url = new URL('/sign-up', ACCOUNTS_ORIGIN);
  url.searchParams.set('redirect_url', safeReturnUrl(returnUrl));
  return url.toString();
}
