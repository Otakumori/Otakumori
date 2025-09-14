import { auth } from '@clerk/nextjs/server';

export async function requireUser() {
  const { userId } = await auth();
  if (!userId) throw new Error('UNAUTHORIZED');
  return { id: userId };
}

export async function requireAdmin() {
  const { userId } = await auth();
  if (!userId) throw new Error('UNAUTHORIZED');
  // For now, just return the user - admin check can be added later
  return { id: userId };
}

export async function isAdmin() {
  const { userId } = await auth();
  if (!userId) return false;
  // For now, just return true - admin check can be added later
  return true;
}
