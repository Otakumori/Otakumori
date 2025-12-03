import { logger } from '@/app/lib/logger';
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { setUserNSFWEnabled } from '@/app/lib/nsfw/user';
import { db } from '@/app/lib/db';
import { generateRequestId } from '@/lib/requestId';

export const runtime = 'nodejs';

const VerifyRequestSchema = z.object({
  age: z.number().int().min(18).max(120),
  consent: z.boolean().refine((val) => val === true, {
    message: 'Consent is required',
  }),
});

/**
 * POST /api/v1/nsfw/verify
 *
 * Age verification endpoint for enabling NSFW content access.
 * Requires user to be 18+ and provide consent.
 * Idempotent - can be called multiple times safely.
 */
export async function POST(req: NextRequest) {
  const requestId = generateRequestId();

  try {
    // Require authentication
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json(
        { ok: false, error: 'AUTH_REQUIRED', requestId },
        { status: 401, headers: { 'x-otm-reason': 'AUTH_REQUIRED' } },
      );
    }

    // Get user from database
    const user = await db.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: 'USER_NOT_FOUND', requestId }, { status: 404 });
    }

    // Parse and validate request body
    const body = await req.json();
    const validation = VerifyRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          ok: false,
          error: 'VALIDATION_ERROR',
          details: validation.error.errors,
          requestId,
        },
        { status: 400 },
      );
    }

    const { age, consent } = validation.data;

    // Validate age (must be 18+)
    if (age < 18) {
      return NextResponse.json(
        { ok: false, error: 'AGE_REQUIREMENT_NOT_MET', requestId },
        { status: 403 },
      );
    }

    // Validate consent
    if (!consent) {
      return NextResponse.json(
        { ok: false, error: 'CONSENT_REQUIRED', requestId },
        { status: 403 },
      );
    }

    // Set NSFW enabled (idempotent - safe to call multiple times)
    await setUserNSFWEnabled(user.id, true, new Date());

    return NextResponse.json({
      ok: true,
      data: {
        nsfwEnabled: true,
        verifiedAt: new Date().toISOString(),
      },
      requestId,
    });
  } catch (error) {
    logger.error('[NSFW Verify] Error:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      {
        ok: false,
        error: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        requestId,
      },
      { status: 500 },
    );
  }
}
