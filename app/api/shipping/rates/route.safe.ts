/** cURL smoke test:
 * curl -X POST http://localhost:3000/api/shipping/rates \
 *  -H "content-type: application/json" \
 *  -d '{"to":{"name":"Test","street1":"1 Main St","city":"New York","state":"NY","zip":"10001","country":"US"},"parcels":[{"length":8,"width":6,"height":2,"weight_oz":10}]}'
 */

import { env } from '@/env';

const enabled = (env as any).FEATURE_EASYPOST === 'true';
export async function POST(req: Request) {
  if (!enabled || !(env as any).EASYPOST_API_KEY) {
    return Response.json({ error: 'easypost_disabled' }, { status: 503 });
  }
  const { to, parcels } = await req.json();
  const from = {
    name: (env as any).DEFAULT_SHIP_FROM_NAME,
    street1: (env as any).DEFAULT_SHIP_FROM_STREET,
    city: (env as any).DEFAULT_SHIP_FROM_CITY,
    state: (env as any).DEFAULT_SHIP_FROM_STATE,
    zip: (env as any).DEFAULT_SHIP_FROM_ZIP,
    country: (env as any).DEFAULT_SHIP_FROM_COUNTRY,
  };
  const payload = {
    to_address: to,
    from_address: from,
    parcels: (parcels || []).map((p: any) => ({
      length: p.length,
      width: p.width,
      height: p.height,
      weight: p.weight_oz,
    })),
  };
  const data = await (await import('@/src/lib/easypost.safe')).epCreateShipment(payload);
  const rates = (data?.rates || [])
    .filter((x: any) => x.carrier === 'USPS')
    .map((x: any) => ({
      id: x.id,
      carrier: x.carrier,
      service: x.service,
      rate: x.rate,
      est_days: x.est_delivery_days,
    }));
  return Response.json({ shipment_id: data.id, rates });
}
