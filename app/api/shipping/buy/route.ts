import { EP } from '@/app/lib/easypost';

export async function POST(req: Request) {
  const { shipment_id, rate_id } = await req.json();
  const data = await EP.buyShipment(shipment_id, rate_id);
  return Response.json({
    label_url: data.postage_label?.label_url,
    tracking_code: data.tracking_code,
  });
}
