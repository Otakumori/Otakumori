import { auth } from '@clerk/nextjs/server';
import { db } from './db';

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
  } catch (error) {
    return 'user';
  }
}

export async function requireAdmin() {
  const { userId } = await auth();
  if (!userId) throw new Error('UNAUTHORIZED');

  const role = await getUserRole(userId);
  if (role !== 'admin') throw new Error('FORBIDDEN');

  return { id: userId, role };
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
  const targetUserId = userId || authUserId;

  if (!targetUserId) return false;

  const role = await getUserRole(targetUserId);
  return role === 'admin';
}

export async function isModerator(userId?: string): Promise<boolean> {
  const { userId: authUserId } = await auth();
  const targetUserId = userId || authUserId;

  if (!targetUserId) return false;

  const role = await getUserRole(targetUserId);
  return role === 'admin' || role === 'moderator';
}
