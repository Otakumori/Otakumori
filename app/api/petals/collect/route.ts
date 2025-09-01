 
 
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { generateFingerprint, extractClientIP, generateGuestSessionId } from '@/lib/fingerprint';
import { env } from '@/env.mjs';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';

// Rate limiting configuration
const RATE_LIMIT = {
  clicksPerSecond: 10,
  burstLimit: 20,
  windowMs: 3000, // 3 seconds
};

interface RateLimitRecord {
  count: number;
  resetTime: number;
  burstCount: number;
}

// In-memory rate limiter (replace with Redis in production)
const rateLimitMap = new Map<string, RateLimitRecord>();

function isRateLimited(identity: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identity);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identity, {
      count: 1,
      resetTime: now + RATE_LIMIT.windowMs,
      burstCount: 1,
    });
    return false;
  }

  // Check burst limit
  if (record.burstCount >= RATE_LIMIT.burstLimit) {
    return true;
  }

  // Check sustained rate
  if (record.count >= RATE_LIMIT.clicksPerSecond) {
    return true;
  }

  record.count++;
  record.burstCount++;
  return false;
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const ipAddress = extractClientIP(request);

    // Get or create guest session ID
    const cookieStore = await cookies();
    let guestSessionId = cookieStore.get('guest_session_id')?.value;

    if (!guestSessionId || !/^[a-f0-9]{24}$/.test(guestSessionId)) {
      guestSessionId = generateGuestSessionId();
      // Note: In a real app, you'd set this as an httpOnly cookie
      // For now, we'll return it in the response
    }

    // Generate fingerprint for rate limiting
    const fingerprint = generateFingerprint(userAgent, ipAddress, guestSessionId);
    const rateLimitKey = userId || `guest_${fingerprint.sessionId}`;

    // Rate limiting
    if (isRateLimited(rateLimitKey)) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Rate limited',
          retryAfter: Math.ceil(RATE_LIMIT.windowMs / 1000),
        },
        { status: 429 },
      );
    }

    // Get site configuration
    const siteConfig = (await db.siteConfig.findUnique({
      where: { id: 'singleton' },
    })) || {
      guestCap: 50,
      burst: { enabled: true, minCooldownSec: 15, maxPerMinute: 3 },
    };

    if (userId) {
      // Authenticated user - unlimited collection
      const user = await db.user.findUnique({
        where: { clerkId: userId },
        select: { id: true, petalBalance: true },
      });

      if (!user) {
        return NextResponse.json(
          {
            ok: false,
            error: 'User not found',
          },
          { status: 404 },
        );
      }

      // Award 1 petal
      const newBalance = user.petalBalance + 1;

      // Update user and create ledger entry
      await db.$transaction([
        db.user.update({
          where: { id: user.id },
          data: { petalBalance: newBalance },
        }),
        db.petalLedger.create({
          data: {
            userId: user.id,
            type: 'earn',
            amount: 1,
            reason: 'tree_petal_click',
          },
        }),
      ]);

      return NextResponse.json({
        ok: true,
        data: {
          petalsAwarded: 1,
          newBalance,
          isGuest: false,
          guestSessionId: null,
        },
      });
    } else {
      // Guest user - check cap
      const guestPetalCount = await db.petalLedger.aggregate({
        where: {
          guestSessionId,
          type: 'earn',
        },
        _sum: { amount: true },
      });

      const currentGuestPetals = guestPetalCount._sum.amount || 0;

      if (currentGuestPetals >= siteConfig.guestCap) {
        return NextResponse.json(
          {
            ok: false,
            error: 'Guest petal cap reached',
            data: {
              currentGuestPetals,
              guestCap: siteConfig.guestCap,
              guestSessionId,
              message: 'Sign in to bank your petals forever',
            },
          },
          { status: 403 },
        );
      }

      // Award 1 petal to guest
      await db.petalLedger.create({
        data: {
          guestSessionId,
          type: 'earn',
          amount: 1,
          reason: 'tree_petal_click_guest',
        },
      });

      // Update guest session last seen
      await db.guestSession.upsert({
        where: { id: guestSessionId },
        create: {
          id: guestSessionId,
          lastSeenAt: new Date(),
        },
        update: { lastSeenAt: new Date() },
      });

      return NextResponse.json({
        ok: true,
        data: {
          petalsAwarded: 1,
          currentGuestPetals: currentGuestPetals + 1,
          guestCap: siteConfig.guestCap,
          isGuest: true,
          guestSessionId,
          message:
            currentGuestPetals + 1 >= siteConfig.guestCap
              ? 'Sign in to bank your petals forever'
              : null,
        },
      });
    }
  } catch (error) {
    console.error('Petal collection error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Internal server error',
      },
      { status: 500 },
    );
  }
}
