import { requireAdmin } from '@/app/lib/auth/admin';
import OrdersPageClient from './OrdersPageClient';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function AdminOrdersPage() {
  await requireAdmin();
  return <OrdersPageClient />;
}

