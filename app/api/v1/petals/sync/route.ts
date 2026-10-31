import { logger } from '@/app/lib/logger';
import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateRequestId } from '@/lib/requestId';
import {
  AuthenticationRequiredError,
  LocalUserUnavailableError,
  isMissingSchemaError,
  requireLocalViewer,
  schemaUnavailableResponse,
} from '@/app/lib/auth/viewer';
import { z } from 'zod';

export const runtime = 'nodejs';

const SyncPetalsSchema = z
  .object({
    localBalance: z.number().int().safe().nonnegative(),
    localTransactions: z
      .array(
        z
          .object({
            id: z.string().trim().min(1).max(128),
            amount: z.number().int().safe(),
            source: z.string().trim().min(1).max(128),
            timestamp: z.number().int().safe().nonnegative(),
          })
          .strict(),
      )
      .max(100)
      .optional(),
  })
  .strict();

/**
 * Sync petal balance across devices
 * Reports local/cloud differences without treating browser state as currency authority.
 * Guest progress remains available to the client for a future, separately approved
 * conversion flow, but this endpoint never turns it into spendable petals.
 */
export async function POST(req: NextRequest) {
  const requestId = generateRequestId();

  try {
    const { localUserId } = await requireLocalViewer();

    const parsed = SyncPetalsSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: 'VALIDATION_ERROR',
          message: 'Petal sync data is invalid.',
          requestId,
        },
        { status: 400 },
      );
    }

    const { localBalance, localTransactions } = parsed.data;

    // Upsert is the only mutation: concurrent first-time requests converge on a
    // zero-value authoritative wallet and can never promote browser claims.
    const cloudWallet = await db.petalWallet.upsert({
      where: { userId: localUserId },
      create: {
        userId: localUserId,
        balance: 0,
        lifetimeEarned: 0,
        currentStreak: 0,
      },
      update: {},
    });

    const cloudBalance = cloudWallet.balance;
    const conflict = cloudBalance !== localBalance;

    return NextResponse.json({
      ok: true,
      data: {
        syncedBalance: cloudBalance,
        cloudBalance,
        localBalance,
        conflict,
        resolution: 'SERVER_AUTHORITATIVE',
        requiresGuestProgressReview: conflict || Boolean(localTransactions?.length),
        importedTransactions: 0,
        lastSyncedAt: new Date().toISOString(),
      },
      requestId,
    });
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      return NextResponse.json(
        { ok: false, error: 'AUTH_REQUIRED', requestId },
        { status: 401, headers: { 'x-otm-reason': 'AUTH_REQUIRED' } },
      );
    }
    if (error instanceof LocalUserUnavailableError || isMissingSchemaError(error)) {
      return NextResponse.json(schemaUnavailableResponse(requestId), { status: 503 });
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          ok: false,
          error: 'VALIDATION_ERROR',
          message: 'Petal sync data is invalid.',
          requestId,
        },
        { status: 400 },
      );
    }
    logger.error(
      '[Petal Sync] Error:',
      undefined,
      undefined,
      error instanceof Error ? error : new Error(String(error)),
    );
    return NextResponse.json(
      {
        ok: false,
        error: 'INTERNAL_ERROR',
        message: 'Petal sync is temporarily unavailable.',
        requestId,
      },
      { status: 500 },
    );
  }
}
