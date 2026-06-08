import { EP } from '@/app/lib/easypost';
import type { NextRequest } from 'next/server';
import { authorizeProviderWrite } from '@/app/lib/security/providerWriteGuard';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const guard = await authorizeProviderWrite(req);
  if (!guard.ok) return guard.response;

  const { shipment_id, rate_id } = await req.json();
  const data = await EP.buyShipment(shipment_id, rate_id);
  return Response.json({
    label_url: data.postage_label?.label_url,
    tracking_code: data.tracking_code,
  });
}
