
import { NextResponse } from 'next/server';

// Public API liveness. Intentionally minimal — no environment, version, or
// feature-flag details are exposed to unauthenticated callers.
export async function GET() {
  return NextResponse.json({ ok: true, status: 'healthy' });
}
