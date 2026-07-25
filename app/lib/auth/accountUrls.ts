export const ACCOUNTS_ORIGIN = 'https://accounts.otaku-mori.com';
export const FALLBACK_APP_ORIGIN = 'https://www.otaku-mori.com';

const PRODUCTION_APP_ORIGINS = new Set(['https://www.otaku-mori.com', 'https://otaku-mori.com']);
const LOCAL_APP_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

function currentAppOrigin() {
  if (typeof window === 'undefined') return FALLBACK_APP_ORIGIN;
  return window.location.origin;
}

function isLocalAppOrigin(url: URL) {
  return LOCAL_APP_HOSTS.has(url.hostname) || LOCAL_APP_HOSTS.has(url.host);
}

function isAllowedReturnOrigin(candidate: URL, appOrigin: URL) {
  if (PRODUCTION_APP_ORIGINS.has(candidate.origin)) return true;

  if (candidate.origin === appOrigin.origin) {
    if (PRODUCTION_APP_ORIGINS.has(appOrigin.origin)) return true;
    if (isLocalAppOrigin(appOrigin)) return true;
    if (appOrigin.protocol === 'https:' && appOrigin.hostname.endsWith('.vercel.app')) return true;
  }

  return false;
}

export function safeReturnUrl(returnUrl?: string, explicitAppOrigin?: string) {
  const appOriginValue = explicitAppOrigin || currentAppOrigin();
  const appOrigin = new URL(appOriginValue);
  const fallback =
    typeof window === 'undefined' || explicitAppOrigin
      ? appOrigin.toString()
      : window.location.href;

  try {
    const parsed = new URL(returnUrl || fallback, appOrigin);
    const isLocal = isLocalAppOrigin(parsed);
    const hasAllowedProtocol =
      parsed.protocol === 'https:' || (isLocal && parsed.protocol === 'http:');

    if (!hasAllowedProtocol || !isAllowedReturnOrigin(parsed, appOrigin)) {
      return appOrigin.toString();
    }

    return parsed.toString();
  } catch {
    return appOrigin.toString();
  }
}

export function buildCanonicalSignInUrl(returnUrl?: string, appOrigin?: string) {
  const url = new URL('/sign-in', ACCOUNTS_ORIGIN);
  url.searchParams.set('redirect_url', safeReturnUrl(returnUrl, appOrigin));
  return url.toString();
}

export function buildCanonicalSignUpUrl(returnUrl?: string, appOrigin?: string) {
  const url = new URL('/sign-up', ACCOUNTS_ORIGIN);
  url.searchParams.set('redirect_url', safeReturnUrl(returnUrl, appOrigin));
  return url.toString();
}

export function buildCanonicalUserProfileUrl(returnUrl?: string, appOrigin?: string) {
  const url = new URL('/user', ACCOUNTS_ORIGIN);
  if (returnUrl) {
    url.searchParams.set('redirect_url', safeReturnUrl(returnUrl, appOrigin));
  }
  return url.toString();
}
