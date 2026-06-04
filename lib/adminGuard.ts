// lib/adminGuard.ts (server utilities)
import { auth, currentUser } from '@clerk/nextjs/server';
import { isAdmin } from '@/app/lib/auth/admin';

export async function requireAdminOrThrow() {
  const { userId } = await auth();
  if (!userId) throw new Response('Unauthorized', { status: 401 });
  const user = await currentUser();
  if (!isAdmin(user)) throw new Response('Forbidden', { status: 403 });
  return { userId, user };
}
