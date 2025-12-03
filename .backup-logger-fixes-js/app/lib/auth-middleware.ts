import { logger } from '@/app/lib/logger';
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserRole, type UserRole } from './authz';
import { db } from './db';

export interface AuthError {
  ok: false;
  error: string;
  requestId: string;
}

export interface AuthSuccess<T = any> {
  ok: true;
  data: T;
  requestId: string;
}

export type AuthResponse<T = any> = AuthSuccess<T> | AuthError;

export function generateRequestId(): string {
  return `otm_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

export function createAuthError(message: string, reason: string, requestId: string): NextResponse {
  const headers = new Headers({
    'Content-Type': 'application/json',
    'x-otm-reason': reason,
  });

  return NextResponse.json(
    {
      ok: false,
      error: message,
      requestId,
    },
    { status: 401, headers },
  );
}

export function createForbiddenError(
  message: string,
  reason: string,
  requestId: string,
): NextResponse {
  const headers = new Headers({
    'Content-Type': 'application/json',
    'x-otm-reason': reason,
  });

  return NextResponse.json(
    {
      ok: false,
      error: message,
      requestId,
    },
    { status: 403, headers },
  );
}

export async function withAuth<T>(
  handler: (userId: string, requestId: string) => Promise<NextResponse | AuthResponse<T>>,
  requiredRole?: UserRole,
) {
  return async (_request: NextRequest): Promise<NextResponse> => {
    const requestId = generateRequestId();

    try {
      const { userId } = await auth();

      if (!userId) {
        return createAuthError('Authentication required', 'NO_TOKEN', requestId);
      }

      // Check role if required
      if (requiredRole) {
        const userRole = await getUserRole(userId);

        if (requiredRole === 'admin' && userRole !== 'admin') {
          return createForbiddenError(
            'Admin access required',
            'INSUFFICIENT_PERMISSIONS',
            requestId,
          );
        }

        if (requiredRole === 'moderator' && userRole !== 'admin' && userRole !== 'moderator') {
          return createForbiddenError(
            'Moderator access required',
            'INSUFFICIENT_PERMISSIONS',
            requestId,
          );
        }
      }

      const result = await handler(userId, requestId);

      // If handler returns a NextResponse, return it directly
      if (result instanceof NextResponse) {
        return result;
      }

      // If handler returns an AuthResponse, convert to NextResponse
      if (result.ok) {
        return NextResponse.json(result);
      } else {
        return NextResponse.json(result, { status: 400 });
      }
    } catch (error) {
      logger.error('Auth middleware error:', error);

      if (error instanceof Error) {
        if (error.message === 'UNAUTHORIZED') {
          return createAuthError('Authentication required', 'TOKEN_INVALID', requestId);
        }

        if (error.message === 'FORBIDDEN') {
          return createForbiddenError('Access denied', 'INSUFFICIENT_PERMISSIONS', requestId);
        }
      }

      return NextResponse.json(
        {
          ok: false,
          error: 'Internal server error',
          requestId,
        },
        { status: 500 },
      );
    }
  };
}

export async function withAdminAuth<T>(
  handler: (userId: string, requestId: string) => Promise<NextResponse | AuthResponse<T>>,
) {
  return withAuth(handler, 'admin');
}

export async function withModeratorAuth<T>(
  handler: (userId: string, requestId: string) => Promise<NextResponse | AuthResponse<T>>,
) {
  return withAuth(handler, 'moderator');
}

// Enhanced RBAC functions for granular permissions
export interface Permission {
  action: string;
  resource: string;
  conditions?: Record<string, any>;
}

export async function hasPermission(userId: string, permission: Permission): Promise<boolean> {
  try {
    const userRole = await getUserRole(userId);

    // Admin has all permissions
    if (userRole === 'admin') return true;

    // Get user's specific permissions from ModeratorRole
    const moderatorRole = await db.moderatorRole.findFirst({
      where: {
        userId,
        isActive: true,
      },
    });

    if (!moderatorRole) return false;

    const permissions = moderatorRole.permissions as any;

    // Check if user has specific permission
    const hasAccess = permissions[permission.resource]?.includes(permission.action) || false;

    return hasAccess;
  } catch (error) {
    logger.error('Permission check error:', error);
    return false;
  }
}

export async function withPermission<T>(
  permission: Permission,
  handler: (userId: string, requestId: string) => Promise<NextResponse | AuthResponse<T>>,
) {
  return async (_request: NextRequest): Promise<NextResponse> => {
    const requestId = generateRequestId();

    try {
      const { userId } = await auth();

      if (!userId) {
        return createAuthError('Authentication required', 'NO_TOKEN', requestId);
      }

      const hasAccess = await hasPermission(userId, permission);

      if (!hasAccess) {
        return createForbiddenError(
          `Permission required: ${permission.action} on ${permission.resource}`,
          'INSUFFICIENT_PERMISSIONS',
          requestId,
        );
      }

      const result = await handler(userId, requestId);

      if (result instanceof NextResponse) {
        return result;
      }

      if (result.ok) {
        return NextResponse.json(result);
      } else {
        return NextResponse.json(result, { status: 400 });
      }
    } catch (error) {
      logger.error('Permission middleware error:', error);
      return NextResponse.json(
        {
          ok: false,
          error: 'Internal server error',
          requestId,
        },
        { status: 500 },
      );
    }
  };
}

// Rate limiting aware auth checks
export interface GatedAction {
  type: 'soapstone_place' | 'praise_send' | 'wishlist_toggle' | 'trade_offer' | 'comment_post';
  requireAuth: boolean;
  requireRole?: UserRole;
  permission?: Permission;
}

export async function checkGatedAction(
  userId: string | null,
  action: GatedAction,
): Promise<{
  allowed: boolean;
  reason?: string;
  requiresAuth?: boolean;
}> {
  // Check if authentication is required
  if (action.requireAuth && !userId) {
    return {
      allowed: false,
      reason: 'Authentication required',
      requiresAuth: true,
    };
  }

  // If user is authenticated, check role requirements
  if (userId && action.requireRole) {
    const userRole = await getUserRole(userId);

    if (action.requireRole === 'admin' && userRole !== 'admin') {
      return {
        allowed: false,
        reason: 'Admin access required',
      };
    }

    if (action.requireRole === 'moderator' && userRole !== 'admin' && userRole !== 'moderator') {
      return {
        allowed: false,
        reason: 'Moderator access required',
      };
    }
  }

  // Check specific permissions
  if (userId && action.permission) {
    const hasAccess = await hasPermission(userId, action.permission);
    if (!hasAccess) {
      return {
        allowed: false,
        reason: `Missing permission: ${action.permission.action} on ${action.permission.resource}`,
      };
    }
  }

  return { allowed: true };
}

// Helper to create standardized auth responses for gated actions
export function createGatedActionResponse(
  check: { allowed: boolean; reason?: string; requiresAuth?: boolean },
  requestId: string,
): NextResponse | null {
  if (check.allowed) return null;

  if (check.requiresAuth) {
    return createAuthError(check.reason || 'Authentication required', 'GATED_ACTION', requestId);
  }

  return createForbiddenError(check.reason || 'Access denied', 'GATED_ACTION', requestId);
}
