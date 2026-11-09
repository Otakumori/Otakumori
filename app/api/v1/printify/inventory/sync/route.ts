/**
 * Real-Time Inventory Synchronization API
 *
 * Provides:
 * - Manual inventory sync for specific products or all products
 * - Real-time inventory status checking
 * - Inventory alerts and notifications
 * - Performance optimized batch processing
 */

import { retiredMutationRoute } from '@/app/lib/security/retiredMutationRoute';

export const runtime = 'nodejs';

export async function POST() {
  return retiredMutationRoute('PRINTIFY_INVENTORY_ROUTE_RETIRED', '/api/admin/printify-sync');
}

export async function GET() {
  return retiredMutationRoute('PRINTIFY_INVENTORY_ROUTE_RETIRED', '/api/v1/printify/sync-status');
}
