// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export const runtime = 'nodejs';
export const maxDuration = 10;

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { itemId, slot } = await req.json();

    // TODO: Implement equipment logic
    return NextResponse.json({
      ok: true,
      data: {
        message: 'Profile equip endpoint - implementation pending',
        itemId,
        slot,
      },
    });
  } catch (error) {
    console.error('Error equipping item:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
