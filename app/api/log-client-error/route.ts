// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Log to console with structured format for easy parsing
    // Client error logged

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[CLIENT-ERROR-API]', error);
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
