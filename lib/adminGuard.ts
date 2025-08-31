/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable-line @next/next/no-img-element */
// lib/adminGuard.ts (server utilities)
import { auth, currentUser } from '@clerk/nextjs/server';

export async function requireAdminOrThrow() {
  const { userId } = auth();
  if (!userId) throw new Response('Unauthorized', { status: 401 });
  const user = await currentUser();
  const role = (user?.publicMetadata as any)?.role;
  if (role !== 'admin') throw new Response('Forbidden', { status: 403 });
  return { userId, user };
}
