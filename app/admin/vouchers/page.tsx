import { requireAdmin } from '@/app/lib/auth/admin';
import { AdminLayout } from '@/components/admin/AdminNav';
import VouchersPageClient from './VouchersPageClient';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function AdminVouchersPage() {
  await requireAdmin();

  return (
    <AdminLayout>
      <VouchersPageClient />
    </AdminLayout>
  );
}
