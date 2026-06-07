import { type NextRequest } from 'next/server';
import { EP } from '@/app/lib/easypost';
import { authorizeProviderWrite } from '@/app/lib/security/providerWriteGuard';

export async function POST(req: NextRequest) {
  const blocked = await authorizeProviderWrite(req, 'shipping_label_purchase');
  if (blocked) return blocked;

  const { shipment_id, rate_id } = await req.json();

  if (!shipment_id || !rate_id) {
    return Response.json({ ok: false, error: 'INVALID_REQUEST' }, { status: 400 });
  }

  const data = await EP.buyShipment(shipment_id, rate_id);

  return Response.json({
    ok: true,
    label_url: data.postage_label?.label_url,
    tracking_code: data.tracking_code,
  });
}
