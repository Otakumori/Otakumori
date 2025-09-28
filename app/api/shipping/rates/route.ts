import { EP } from '@/app/lib/easypost';
import { env } from '@/env.mjs';

export async function POST(req: Request) {
  const { to, parcels } = await req.json();
  const from = {
    name: env.DEFAULT_SHIP_FROM_NAME,
    street1: env.DEFAULT_SHIP_FROM_STREET,
    city: env.DEFAULT_SHIP_FROM_CITY,
    state: env.DEFAULT_SHIP_FROM_STATE,
    zip: env.DEFAULT_SHIP_FROM_ZIP,
    country: env.DEFAULT_SHIP_FROM_COUNTRY,
  };
  const shipment = {
    to_address: to,
    from_address: from,
    parcels: parcels.map((p: any) => ({
      length: p.length,
      width: p.width,
      height: p.height,
      weight: p.weight_oz,
    })),
  };
  const data = await EP.createShipment(shipment);
  const rates = (data?.rates || [])
    .filter((x: any) => ['USPS'].includes(x.carrier))
    .map((x: any) => ({
      id: x.id,
      carrier: x.carrier,
      service: x.service,
      rate: x.rate,
      est_days: x.est_delivery_days,
    }));
  return Response.json({ shipment_id: data.id, rates });
}
