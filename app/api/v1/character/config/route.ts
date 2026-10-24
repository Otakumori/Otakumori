import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { GET as loadCanonicalAvatar } from '@/app/api/v1/creator/load/route';

export const runtime = 'nodejs';

/** Compatibility read adapter. New callers use /api/v1/creator/load. */
export async function GET(request: NextRequest) {
  return loadCanonicalAvatar(request);
}

/** The creator save endpoint is the sole persisted avatar write authority. */
export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      error: 'ENDPOINT_RETIRED',
      message: 'Save avatars through the canonical creator endpoint.',
      canonical: '/api/v1/creator/save',
    },
    { status: 410 },
  );
}
