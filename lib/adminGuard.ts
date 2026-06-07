// lib/adminGuard.ts (server utilities)
import { requireAdminApi } from '@/app/lib/auth/admin';

export async function requireAdminOrThrow() {
  const admin = await requireAdminApi();
  return { userId: admin.id, user: admin };
}
