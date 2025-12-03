import { requireAdmin } from '@/app/lib/auth/admin';
import { AdminLayout } from '@/components/admin/AdminNav';
import UsersPageClient from './UsersPageClient';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

);
}
export default async function AdminUsersPage() {
  await requireAdmin();

  return (
    <AdminLayout>
      <UsersPageClient />
    </AdminLayout>
  );
}
