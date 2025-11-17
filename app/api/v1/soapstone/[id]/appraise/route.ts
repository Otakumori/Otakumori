import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { generateRequestId } from '@/lib/requestId';

export const runtime = 'nodejs';

/**
 * Appraise (rate) a soapstone message
 * Similar to Dark Souls message appraisal system
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = generateRequestId();

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: 'AUTH_REQUIRED', requestId },
        { status: 401, headers: { 'x-otm-reason': 'AUTH_REQUIRED' } },
      );
    }

    const messageId = params.id;

    // Check if message exists
    const message = await db.soapstoneMessage.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      return NextResponse.json(
        { ok: false, error: 'NOT_FOUND', requestId },
        { status: 404 },
      );
    }

    // Check if user already appraised this message
    // Note: This would require a SoapstoneAppraisal table if we want to prevent duplicates
    // For now, we'll allow multiple appraisals

    // Increment appraisals count
    const updated = await db.soapstoneMessage.update({
      where: { id: messageId },
      data: {
        appraises: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({
      ok: true,
      data: {
        messageId: updated.id,
        appraises: updated.appraises,
      },
      requestId,
    });
  } catch (error: any) {
    console.error('[Soapstone Appraise] Error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'INTERNAL_ERROR',
        message: error.message,
        requestId,
      },
      { status: 500 },
    );
  }
}

