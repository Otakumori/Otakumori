import { retiredMutationRoute } from '@/app/lib/security/retiredMutationRoute';

export async function POST() {
  return retiredMutationRoute('SHIPPING_RATES_ROUTE_RETIRED');
}
