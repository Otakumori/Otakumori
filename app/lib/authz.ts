import { auth } from '@clerk/nextjs/server';
import { db } from './db';
import {
  authorizeAdminApi,
  requireAdminApi,
} from '@/app/lib/auth/admin';

export type UserRole = 'user' | 'moderator' | 'admin';

export async function requireUser() {
  const { userId } = await auth();
  if (!userId) throw new Error('UNAUTHORIZED');
  return { id: userId };
}

export async function getUserRole(userId: string): Promise<UserRole> {
  try {
    const moderatorRole = await db.moderatorRole.findFirst({
      where: {
        userId,
        isActive: true,
      },
    });

    if (moderatorRole) {
      return moderatorRole.role === 'admin' ? 'admin' : 'moderator';
    }

    return 'user';
  } catch {
    return 'user';
  }
}

export async function requireAdmin() {
  const admin = await requireAdminApi();
  return { id: admin.id, role: 'admin' as const };
}

export async function requireModerator() {
  const { userId } = await auth();
  if (!userId) throw new Error('UNAUTHORIZED');

  const role = await getUserRole(userId);
  if (role !== 'admin' && role !== 'moderator') throw new Error('FORBIDDEN');

  return { id: userId, role };
}

export async function isAdmin(userId?: string): Promise<boolean> {
  const { userId: authUserId } = await auth();
  if (userId && userId !== authUserId) return getUserRole(userId).then((role) => role === 'admin');
  const result = await authorizeAdminApi();
  return result.ok;
}

export async function isModerator(userId?: string): Promise<boolean> {
  const { userId: authUserId } = await auth();
  const targetUserId = userId || authUserId;

  if (!targetUserId) return false;

  const role = await getUserRole(targetUserId);
  return role === 'admin' || role === 'moderator';
}
