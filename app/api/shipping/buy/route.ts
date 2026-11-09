import { retiredMutationRoute } from '@/app/lib/security/retiredMutationRoute';

export async function POST() {
  return retiredMutationRoute('SHIPPING_PURCHASE_ROUTE_RETIRED');
}
