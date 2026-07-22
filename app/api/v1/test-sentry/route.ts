import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function disabledResponse() {
  return NextResponse.json(
    {
      ok: false,
      error: 'Sentry test endpoint is disabled.',
      message: 'Re-enable this route only during intentional monitoring tests.',
    },
    { status: 404 },
  );
}

export async function GET(_request: NextRequest) {
  return disabledResponse();
}

export async function POST(_request: NextRequest) {
  return disabledResponse();
}
