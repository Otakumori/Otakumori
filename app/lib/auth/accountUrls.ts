export const ACCOUNTS_ORIGIN = 'https://accounts.otaku-mori.com';
export const FALLBACK_APP_ORIGIN = 'https://www.otaku-mori.com';
export const STAGING_APP_ORIGIN = 'https://staging.otaku-mori.com';
export const PR73_PREVIEW_APP_ORIGIN = 'https://pr73-preview.otaku-mori.com';

const PRODUCTION_APP_ORIGINS = new Set(['https://www.otaku-mori.com', 'https://otaku-mori.com']);
const TRUSTED_NON_PRODUCTION_APP_ORIGINS = new Set([STAGING_APP_ORIGIN, PR73_PREVIEW_APP_ORIGIN]);
const LOCAL_APP_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

export type ClerkRoutingMode = 'production-hosted' | 'development-local' | 'blocked';

type ClerkRoutingFailureReason =
  | 'INVALID_APP_ORIGIN'
  | 'UNTRUSTED_APP_ORIGIN'
  | 'CLERK_ENVIRONMENT_MISMATCH';

export type ClerkRoutingDecision =
  | {
      mode: Exclude<ClerkRoutingMode, 'blocked'>;
      appOrigin: string;
    }
  | {
      mode: 'blocked';
      appOrigin: string | null;
      reason: ClerkRoutingFailureReason;
    };

export class ClerkRoutingConfigurationError extends Error {
  constructor(reason: ClerkRoutingFailureReason) {
    super(`Clerk routing is unavailable: ${reason}`);
    this.name = 'ClerkRoutingConfigurationError';
  }
}

function currentAppOrigin() {
  if (typeof window === 'undefined') return FALLBACK_APP_ORIGIN;
  return window.location.origin;
}

function isLocalAppOrigin(url: URL) {
  return LOCAL_APP_HOSTS.has(url.hostname) || LOCAL_APP_HOSTS.has(url.host);
}

function hasExplicitPort(raw: string) {
  const trimmed = raw.trim();
  if (!/^[a-z][a-z\d+.-]*:\/\//i.test(trimmed)) return false;

  const authority = trimmed.replace(/^[a-z][a-z\d+.-]*:\/\//i, '').split(/[/?#]/, 1)[0] ?? '';
  return /:\d+$/.test(authority);
}

function isProductionAppOrigin(url: URL) {
  return PRODUCTION_APP_ORIGINS.has(url.origin);
}

function isTrustedNonProductionAppOrigin(url: URL) {
  return (
    TRUSTED_NON_PRODUCTION_APP_ORIGINS.has(url.origin) ||
    isLocalAppOrigin(url) ||
    (url.protocol === 'https:' && url.hostname.endsWith('.vercel.app'))
  );
}

function isAllowedReturnOrigin(candidate: URL, appOrigin: URL) {
  if (isProductionAppOrigin(appOrigin)) {
    return PRODUCTION_APP_ORIGINS.has(candidate.origin);
  }

  if (candidate.origin === appOrigin.origin) {
    return isTrustedNonProductionAppOrigin(appOrigin);
  }

  return false;
}

function configuredPublishableKey() {
  // This shared server/client boundary needs Next's static NEXT_PUBLIC replacement;
  // it reads a public Clerk identifier, never a server credential.
  // eslint-disable-next-line no-restricted-syntax
  return process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
}

function normalizeAppOrigin(rawOrigin: string) {
  try {
    if (hasExplicitPort(rawOrigin)) {
      const candidate = new URL(rawOrigin);
      if (!isLocalAppOrigin(candidate)) return null;
    }

    const candidate = new URL(rawOrigin);
    if (
      candidate.username ||
      candidate.password ||
      candidate.pathname !== '/' ||
      candidate.search ||
      candidate.hash
    ) {
      return null;
    }
    if (
      candidate.protocol !== 'https:' &&
      !(candidate.protocol === 'http:' && isLocalAppOrigin(candidate))
    ) {
      return null;
    }
    return candidate;
  } catch {
    return null;
  }
}

export function resolveClerkRouting(
  explicitAppOrigin?: string,
  publishableKey = configuredPublishableKey(),
): ClerkRoutingDecision {
  const appOrigin = normalizeAppOrigin(explicitAppOrigin || currentAppOrigin());
  if (!appOrigin) {
    return { mode: 'blocked', appOrigin: null, reason: 'INVALID_APP_ORIGIN' };
  }

  const isProduction = isProductionAppOrigin(appOrigin);
  if (!isProduction && !isTrustedNonProductionAppOrigin(appOrigin)) {
    return { mode: 'blocked', appOrigin: appOrigin.origin, reason: 'UNTRUSTED_APP_ORIGIN' };
  }

  const hasProductionKey = publishableKey?.startsWith('pk_live_') === true;
  const hasDevelopmentKey = publishableKey?.startsWith('pk_test_') === true;
  if ((isProduction && !hasProductionKey) || (!isProduction && !hasDevelopmentKey)) {
    return {
      mode: 'blocked',
      appOrigin: appOrigin.origin,
      reason: 'CLERK_ENVIRONMENT_MISMATCH',
    };
  }

  return {
    mode: isProduction ? 'production-hosted' : 'development-local',
    appOrigin: appOrigin.origin,
  };
}

function requireClerkRouting(appOrigin?: string) {
  const decision = resolveClerkRouting(appOrigin);
  if (decision.mode === 'blocked') {
    throw new ClerkRoutingConfigurationError(decision.reason);
  }
  return decision;
}

export function safeReturnUrl(returnUrl?: string, explicitAppOrigin?: string) {
  const appOriginValue = explicitAppOrigin || currentAppOrigin();
  const appOrigin = new URL(appOriginValue);
  const fallback =
    typeof window === 'undefined' || explicitAppOrigin
      ? appOrigin.toString()
      : window.location.href;

  try {
    const rawReturnUrl = returnUrl || fallback;
    const parsed = new URL(rawReturnUrl, appOrigin);
    const isLocal = isLocalAppOrigin(parsed);
    const hasAllowedProtocol =
      parsed.protocol === 'https:' || (isLocal && parsed.protocol === 'http:');

    if (
      parsed.username !== '' ||
      parsed.password !== '' ||
      (hasExplicitPort(rawReturnUrl) && !isLocal) ||
      !hasAllowedProtocol ||
      !isAllowedReturnOrigin(parsed, appOrigin)
    ) {
      return appOrigin.toString();
    }

    return parsed.toString();
  } catch {
    return appOrigin.toString();
  }
}

export function buildCanonicalSignInUrl(returnUrl?: string, appOrigin?: string) {
  const routing = requireClerkRouting(appOrigin);
  const url = new URL(
    '/sign-in',
    routing.mode === 'production-hosted' ? ACCOUNTS_ORIGIN : routing.appOrigin,
  );
  url.searchParams.set('redirect_url', safeReturnUrl(returnUrl, routing.appOrigin));
  return url.toString();
}

export function buildCanonicalSignUpUrl(returnUrl?: string, appOrigin?: string) {
  const routing = requireClerkRouting(appOrigin);
  const url = new URL(
    '/sign-up',
    routing.mode === 'production-hosted' ? ACCOUNTS_ORIGIN : routing.appOrigin,
  );
  url.searchParams.set('redirect_url', safeReturnUrl(returnUrl, routing.appOrigin));
  return url.toString();
}

export function buildCanonicalUserProfileUrl(returnUrl?: string, appOrigin?: string) {
  const routing = requireClerkRouting(appOrigin);
  const url = new URL(
    routing.mode === 'production-hosted' ? '/user' : '/account',
    routing.mode === 'production-hosted' ? ACCOUNTS_ORIGIN : routing.appOrigin,
  );
  if (returnUrl) {
    url.searchParams.set('redirect_url', safeReturnUrl(returnUrl, routing.appOrigin));
  }
  return url.toString();
}
