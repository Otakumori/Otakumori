
import { logger } from '@/app/lib/logger';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

const UnlockRuneSchema = z.object({
  slug: z.string().min(1).max(50),
});

// Rate limiting: 5 attempts per minute per user
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + 60000 }); // 1 minute
    return true;
  }

  if (userLimit.count >= 5) {
    return false;
  }

  userLimit.count++;
  return true;
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Authentication required' }, { status: 401 });
    }

    // Check rate limit
    if (!checkRateLimit(userId)) {
      return NextResponse.json(
        { ok: false, error: 'Too many attempts. Please wait before trying again.' },
        { status: 429 },
      );
    }

    const body = await request.json();
    const { slug } = UnlockRuneSchema.parse(body);

    // Check if rune exists
    const rune = await db.rune.findUnique({
      where: { slug },
    });

    if (!rune) {
      return NextResponse.json({ ok: false, error: 'Rune not found' }, { status: 404 });
    }

    // Check if user already unlocked this rune
    const existingUnlock = await db.runeUnlock.findUnique({
      where: {
        userId_slug: {
          userId,
          slug,
        },
      },
    });

    if (existingUnlock) {
      return NextResponse.json({
        ok: true,
        data: {
          unlocked: true,
          rune: {
            slug: rune.slug,
            name: rune.name,
            description: rune.description,
            power: rune.power,
          },
        },
      });
    }

    // Create unlock record
    const unlock = await db.runeUnlock.create({
      data: {
        userId,
        slug,
        unlockedAt: new Date(),
      },
    });

    logger.warn('Rune unlocked:', undefined, { userId, slug, unlockId: unlock.id });

    // Log the unlock for telemetry
    // Rune unlocked

    return NextResponse.json({
      ok: true,
      data: {
        unlocked: true,
        rune: {
          slug: rune.slug,
          name: rune.name,
          description: rune.description,
          power: rune.power,
        },
      },
    });
  } catch (error) {
    logger.error(
      'Rune unlock failed:',
      undefined,
      undefined,
      error instanceof Error ? error : new Error(String(error)),
    );

    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: 'Invalid request data' }, { status: 400 });
    }

    return NextResponse.json({ ok: false, error: 'Failed to unlock rune' }, { status: 500 });
  }
}
