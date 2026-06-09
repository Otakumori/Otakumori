
import { type NextRequest, NextResponse } from 'next/server';
import { authorizeProviderWrite } from '@/app/lib/security/providerWriteGuard';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const guard = await authorizeProviderWrite(request, { developmentOnly: true });
  if (!guard.ok) return guard.response;

  // Minimal fake payload to test handler pipeline
  const example = { type: 'order:created', data: { id: 'test_order_id' } };
  return NextResponse.json({ ok: true, example });
}
