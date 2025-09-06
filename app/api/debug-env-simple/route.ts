// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 10;

export async function GET() {
  return NextResponse.json({
    ok: true,
    data: {
      message: 'Debug environment endpoint - implementation pending',
    },
  });
}
