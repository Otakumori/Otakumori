import { requireAdmin } from '@/app/lib/auth/admin';
import { AdminLayout } from '@/components/admin/AdminNav';
import CosmeticsPageClient from './CosmeticsPageClient';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function AdminCosmeticsPage() {
  await requireAdmin();

  return (
    <AdminLayout>
      <CosmeticsPageClient />
    </AdminLayout>
  );
}

