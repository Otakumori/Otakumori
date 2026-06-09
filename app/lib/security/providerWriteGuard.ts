/**
 * Provider Write Guard
 *
 * Shared, route-local authorization for endpoints that perform provider-side
 * writes (Printify orders, EasyPost label purchases, Clerk Admin API calls,
 * external data sync, etc.).
 *
 * This guard intentionally mirrors the shape of `authorizeAdminApi` in
 * `app/lib/auth/admin.ts` so callers can use the same
 * `{ ok: true, principal } | { ok: false, response }` pattern:
 *
 *   const guard = await authorizeProviderWrite(req);
 *   if (!guard.ok) return guard.response;
 *
 * Defaults to the `clerk_admin_or_internal_service` policy (Clerk admin OR a
 * valid INTERNAL_AUTH_TOKEN / API_KEY compared with timingSafeEqual).
 *
 * Optional `requireEnvFlag` and `developmentOnly` modes fail closed: if the
 * required condition is not satisfied the request is rejected with 403/404
 * before any provider call is made. No raw request body or secret material is
 * logged from this module.
 */

import { type NextRequest, NextResponse } from 'next/server';
import { env } from '@/env';
import { authorizeAdminApi, type AdminApiPolicy } from '@/app/lib/auth/admin';

export type ProviderWritePrincipal = 'clerk_admin' | 'internal_service';

export type ProviderWriteAuthorization =
  | { ok: true; principal: ProviderWritePrincipal }
  | { ok: false; response: NextResponse };

export type ProviderWriteOptions = {
  /**
   * Admin policy delegated to `authorizeAdminApi`. Defaults to
   * `clerk_admin_or_internal_service`.
   */
  policy?: AdminApiPolicy;
  /**
   * When set, the named env flag must equal one of `requireEnvFlagValues`
   * (default `['true']`) for the request to proceed. Used to keep
   * staging-only capabilities fenced off in other environments. Fails closed.
   */
  requireEnvFlag?: keyof typeof env;
  requireEnvFlagValues?: readonly string[];
  /**
   * When true, the route is only reachable in `NODE_ENV === 'development'`
   * unless the caller is an authorized admin/internal principal. Outside of
   * development, unauthenticated callers receive a 404 (route is hidden).
   */
  developmentOnly?: boolean;
};

function reason(status: 403 | 404, code: string) {
  return NextResponse.json(
    { ok: false, error: code },
    { status, headers: { 'x-otm-reason': code } },
  );
}

/**
 * Authorize a provider-write request.
 *
 * Returns `{ ok: true, principal }` when authorized, otherwise
 * `{ ok: false, response }` with a fail-closed NextResponse.
 */
export async function authorizeProviderWrite(
  request: NextRequest | Request,
  opts: ProviderWriteOptions = {},
): Promise<ProviderWriteAuthorization> {
  const policy: AdminApiPolicy = opts.policy ?? 'clerk_admin_or_internal_service';

  // Staging-only env flag gate (fail closed).
  if (opts.requireEnvFlag) {
    const allowed = opts.requireEnvFlagValues ?? (['true'] as const);
    const flagValue = env[opts.requireEnvFlag];
    if (typeof flagValue !== 'string' || !allowed.includes(flagValue)) {
      return { ok: false, response: reason(403, 'FORBIDDEN') };
    }
  }

  // developmentOnly: open in development, but require admin/internal auth in
  // every other environment. We still let an authorized principal through in
  // development so the same code path is exercised everywhere.
  if (opts.developmentOnly && env.NODE_ENV === 'development') {
    return { ok: true, principal: 'internal_service' };
  }

  const authorization = await authorizeAdminApi(request as Request, policy);

  if (authorization.ok) {
    return { ok: true, principal: authorization.principal };
  }

  return authorization;
}
