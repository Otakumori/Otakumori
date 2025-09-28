import { env } from '@/env';

function authHeader() {
  const key = (env as any).EASYPOST_API_KEY;
  if (!key) throw new Error('EASYPOST_API_KEY missing');
  return 'Basic ' + Buffer.from(key + ':').toString('base64');
}
export async function epCreateShipment(payload: any) {
  const r = await fetch('https://api.easypost.com/v2/shipments', {
    method: 'POST',
    headers: { Authorization: authHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error('EasyPost createShipment failed');
  return r.json();
}
export async function epBuyShipment(id: string, rateId: string) {
  const r = await fetch(`https://api.easypost.com/v2/shipments/${id}/buy`, {
    method: 'POST',
    headers: { Authorization: authHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ rate: { id: rateId } }),
  });
  if (!r.ok) throw new Error('EasyPost buyShipment failed');
  return r.json();
}
