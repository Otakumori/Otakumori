import { retiredMutationRoute } from '@/app/lib/security/retiredMutationRoute';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST() {
  return retiredMutationRoute('INNGEST_WEBHOOK_BRIDGE_RETIRED', '/api/inngest');
}

export async function GET() {
  return retiredMutationRoute('INNGEST_WEBHOOK_BRIDGE_RETIRED', '/api/inngest');
}
