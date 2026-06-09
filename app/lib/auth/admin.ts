/**
 * Admin Authentication Helpers
 *
 * Centralized admin access control for server-side routes and pages.
 * Uses email-based admin detection via ADMIN_EMAILS config.
 */

import { timingSafeEqual } from 'node:crypto';
import { currentUser, auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { isAdminEmail, ADMIN_EMAILS } from '@/app/lib/config/admin';
import { type NextRequest, NextResponse } from 'next/server';
import { env } from '@/env';

export type AdminApiPolicy =
  | 'clerk_admin'
  | 'internal_service'
  | 'clerk_admin_or_internal_service';

export type AdminApiAuthorization =
  | {
      ok: true;
      principal: 'clerk_admin' | 'internal_service';
      userId: string | null;
      email: string | null;
    }
  | { ok: false; response: NextResponse };

/**
 * Get admin email addresses
 * Supports extension via env variable in the future
 */
export function getAdminEmails(): readonly string[] {
  // Future: could extend with env var like OM_ADMIN_EMAILS
  return ADMIN_EMAILS;
}

/**
 * Check if a Clerk user is an admin based on their email
 */
export function isAdmin(
  user: {
    emailAddresses?: Array<{ emailAddress?: string | null }>;
    primaryEmailAddress?: { emailAddress?: string | null } | null;
    publicMetadata?: Record<string, unknown> | null;
    privateMetadata?: Record<string, unknown> | null;
  } | null,
): boolean {
  if (!user) return false;

  const email =
    user.primaryEmailAddress?.emailAddress ?? user.emailAddresses?.[0]?.emailAddress ?? null;

  return (
    isAdminEmail(email)
    || user.publicMetadata?.role === 'admin'
    || user.privateMetadata?.role === 'admin'
  );
}

/**
 * Require admin access - throws/redirects if not admin
 * Returns the authenticated admin user
 *
 * @throws Redirects to sign-in if not authenticated
 * @throws Redirects to /admin/unauthorized if not admin
 */
export async function requireAdmin(): Promise<{ id: string; email: string | null }> {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in?redirect_url=/admin');
  }

  const email =
    user.primaryEmailAddress?.emailAddress ?? user.emailAddresses?.[0]?.emailAddress ?? null;

  if (!isAdmin(user)) {
    redirect('/admin/unauthorized');
  }

  return {
    id: user.id,
    email,
  };
}

function unauthorized(status: 401 | 403) {
  const error = status === 401 ? 'AUTH_REQUIRED' : 'FORBIDDEN';
  return NextResponse.json(
    { ok: false, error },
    { status, headers: { 'x-otm-reason': error } },
  );
}

function equalSecret(supplied: string, expected: string) {
  const suppliedBytes = Buffer.from(supplied);
  const expectedBytes = Buffer.from(expected);
  return (
    suppliedBytes.length === expectedBytes.length &&
    timingSafeEqual(suppliedBytes, expectedBytes)
  );
}

function internalCredential(request: Request) {
  const authorization = request.headers.get('authorization') ?? '';
  const bearer = authorization.replace(/^Bearer\s+/i, '').trim();
  return (
    bearer ||
    request.headers.get('x-internal-auth')?.trim() ||
    request.headers.get('x-api-key')?.trim() ||
    ''
  );
}

function isInternalServiceAuthorized(request: Request) {
  const supplied = internalCredential(request);
  if (!supplied) return false;
  const expectedTokens = [env.INTERNAL_AUTH_TOKEN, env.API_KEY].filter(
    (value): value is string => typeof value === 'string' && value.trim().length > 0,
  );
  return expectedTokens.some((expected) => equalSecret(supplied, expected.trim()));
}

async function authorizeClerkAdmin(): Promise<AdminApiAuthorization> {
  const { userId } = await auth();
  if (!userId) return { ok: false, response: unauthorized(401) };

  const user = await currentUser();
  if (!isAdmin(user)) return { ok: false, response: unauthorized(403) };

  const email =
    user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses?.[0]?.emailAddress ?? null;
  return { ok: true, principal: 'clerk_admin', userId, email };
}

export async function authorizeAdminApi(
  request?: Request,
  policy: AdminApiPolicy = 'clerk_admin',
): Promise<AdminApiAuthorization> {
  if (
    request &&
    (policy === 'internal_service' || policy === 'clerk_admin_or_internal_service') &&
    isInternalServiceAuthorized(request)
  ) {
    return { ok: true, principal: 'internal_service', userId: null, email: null };
  }

  if (policy === 'internal_service') {
    return { ok: false, response: unauthorized(401) };
  }

  return authorizeClerkAdmin();
}

export async function requireAdminApi() {
  const result = await authorizeAdminApi();
  if (!result.ok) {
    throw new Response(
      result.response.status === 401 ? 'Authentication required' : 'Admin access required',
      { status: result.response.status },
    );
  }
  return { id: result.userId!, email: result.email };
}

/**
 * Middleware wrapper for API routes that require admin access
 * Returns 403 with x-otm-reason header if not admin
 *
 * @example
 * export const POST = withAdminAuth(async (req) => {
 *   // Admin-only logic here
 *   return NextResponse.json({ ok: true });
 * });
 */
export function withAdminAuth<T extends NextRequest>(
  handler: (req: T, context?: any) => Promise<NextResponse> | NextResponse,
) {
  return async (req: T, context?: any): Promise<NextResponse> => {
    const authorization = await authorizeAdminApi(req);
    if (!authorization.ok) return authorization.response;

    return handler(req, context);
  };
}

export function withAdminPolicy<T extends NextRequest>(
  policy: AdminApiPolicy,
  handler: (req: T, context?: any) => Promise<NextResponse> | NextResponse,
) {
  return async (req: T, context?: any): Promise<NextResponse> => {
    const authorization = await authorizeAdminApi(req, policy);
    if (!authorization.ok) return authorization.response;
    return handler(req, context);
  };
}
