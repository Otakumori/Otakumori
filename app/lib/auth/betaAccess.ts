import { hasAdminRole } from '@/app/lib/auth/adminRole';

type BetaClaimsLike =
  | {
      metadata?: { betaAccess?: unknown } | null;
      public_metadata?: { betaAccess?: unknown } | null;
      publicMetadata?: { betaAccess?: unknown } | null;
      private_metadata?: { betaAccess?: unknown } | null;
    }
  | null
  | undefined;

export function hasBetaAccess(claims: unknown): boolean {
  if (hasAdminRole(claims)) return true;

  const record = claims as BetaClaimsLike;
  return (
    record?.metadata?.betaAccess === true ||
    record?.public_metadata?.betaAccess === true ||
    record?.publicMetadata?.betaAccess === true ||
    record?.private_metadata?.betaAccess === true
  );
}

const PUBLIC_EXACT_PATHS = new Set([
  '/age-check',
  '/beta-access',
  '/cookies',
  '/data-deletion',
  '/health',
  '/privacy',
  '/terms',
]);

const PUBLIC_PATH_PREFIXES = [
  '/sign-in',
  '/sign-up',
  '/sso-callback',
  '/api/_health',
  '/api/health',
  '/api/clerk/webhook',
  '/api/contact',
  '/api/stripe/webhook',
  '/api/webhooks/',
  '/api/v1/auth/',
  '/internal/health',
];

export function isBetaPublicPath(pathname: string): boolean {
  return (
    PUBLIC_EXACT_PATHS.has(pathname) ||
    PUBLIC_PATH_PREFIXES.some((prefix) => {
      const base = prefix.endsWith('/') ? prefix.slice(0, -1) : prefix;
      return pathname === base || pathname.startsWith(`${base}/`);
    })
  );
}

export function isBetaCheckoutBlocked(pathname: string, method: string): boolean {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase())) return false;

  return (
    pathname === '/api/checkout' ||
    pathname.startsWith('/api/checkout/') ||
    pathname === '/api/v1/checkout/session' ||
    pathname === '/api/v1/checkout/order'
  );
}

export function isBetaCheckoutPage(pathname: string): boolean {
  return pathname === '/checkout' || pathname === '/shop/checkout';
}
