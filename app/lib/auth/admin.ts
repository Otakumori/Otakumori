/**
 * Admin Authentication Helpers
 *
 * Centralized admin access control for server-side routes and pages.
 * Uses Clerk metadata.role = admin as the canonical admin source.
 */

import { currentUser, auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { isAdminEmail, ADMIN_EMAILS } from '@/app/lib/config/admin';
import { hasAdminRole } from '@/app/lib/auth/adminRole';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * Get admin email addresses
 * Supports extension via env variable in the future
 */
export function getAdminEmails(): readonly string[] {
  // Future: could extend with env var like OM_ADMIN_EMAILS
  return ADMIN_EMAILS;
}

// Legacy bootstrap helper only. Runtime admin authorization must use Clerk role claims
// so server pages, middleware, and API routes agree for the same session.
export function isAdmin(
  user: {
    emailAddresses?: Array<{ emailAddress?: string | null }>;
    primaryEmailAddress?: { emailAddress?: string | null } | null;
  } | null,
): boolean {
  if (!user) return false;

  const email =
    user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses?.[0]?.emailAddress ?? null;

  return isAdminEmail(email);
}

/**
 * Require admin access - throws/redirects if not admin
 * Returns the authenticated admin user
 *
 * @throws Redirects to sign-in if not authenticated
 * @throws Redirects to /admin/unauthorized if not admin
 */
export async function requireAdmin(): Promise<{ id: string; email: string | null }> {
  const authResult = await auth();

  if (!authResult.userId) {
    redirect('/sign-in?redirect_url=/admin');
  }

  if (!hasAdminRole(authResult.sessionClaims)) {
    redirect('/admin/unauthorized');
  }

  const user = await currentUser();
  const email =
    user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses?.[0]?.emailAddress ?? null;

  return {
    id: authResult.userId,
    email,
  };
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
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { ok: false, error: 'AUTH_REQUIRED' },
        { status: 401, headers: { 'x-otm-reason': 'AUTH_REQUIRED' } },
      );
    }

    const authResult = await auth();
    if (!hasAdminRole(authResult.sessionClaims)) {
      return NextResponse.json(
        { ok: false, error: 'FORBIDDEN' },
        { status: 403, headers: { 'x-otm-reason': 'FORBIDDEN' } },
      );
    }

    return handler(req, context);
  };
}
