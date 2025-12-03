import { generateSEO } from '@/app/lib/seo';
import { requireAdmin } from '@/app/lib/auth/admin';
import { AdminLayout } from '@/components/admin/AdminNav';
import UsersPageClient from './UsersPageClient';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export function generateMetadata() {
  return generateSEO({
    title: 'User Management',
    description: 'Manage users and permissions',
    url: '/admin/users',
  });
}
export default async function AdminUsersPage() {
  await requireAdmin();

  return (
    <AdminLayout>
      <UsersPageClient />
    </AdminLayout>
  );
}
