import { env } from '@/env';

const enabled = (env as any).FEATURE_EASYPOST === 'true';
export async function POST(req: Request) {
  if (!enabled || !(env as any).EASYPOST_API_KEY) {
    return Response.json({ error: 'easypost_disabled' }, { status: 503 });
  }
  const { shipment_id, rate_id } = await req.json();
  const data = await (await import('@/src/lib/easypost.safe')).epBuyShipment(shipment_id, rate_id);
  return Response.json({
    label_url: data.postage_label?.label_url,
    tracking_code: data.tracking_code,
  });
}
