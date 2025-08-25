import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { BurstConfig } from '@/types/runes';

export const runtime = 'nodejs';

// GET: Fetch burst configuration
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    // TODO: Add admin role check
    // const user = await db.user.findUnique({ where: { clerkId: userId } });
    // if (!user?.isAdmin) { return NextResponse.json({ ok: false, error: 'Admin access required' }, { status: 403 }); }

    const siteConfig = await db.siteConfig.findUnique({
      where: { id: 'singleton' },
    });

    const burstConfig = (siteConfig?.burst as any) || {
      enabled: true,
      minCooldownSec: 15,
      maxPerMinute: 3,
      particleCount: {
        small: 20,
        medium: 40,
        large: 80,
      },
      rarityWeights: {
        small: 0.6,
        medium: 0.3,
        large: 0.1,
      },
    };

    return NextResponse.json({
      ok: true,
      data: { config: burstConfig },
    });
  } catch (error) {
    console.error('Burst config fetch error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// POST: Update burst configuration
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    // TODO: Add admin role check
    // const user = await db.user.findUnique({ where: { clerkId: userId } });
    // if (!user?.isAdmin) { return NextResponse.json({ ok: false, error: 'Admin access required' }, { status: 403 }); }

    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      'enabled',
      'minCooldownSec',
      'maxPerMinute',
      'particleCount',
      'rarityWeights',
    ];
    for (const field of requiredFields) {
      if (!(field in body)) {
        return NextResponse.json(
          {
            ok: false,
            error: `Missing required field: ${field}`,
          },
          { status: 400 }
        );
      }
    }

    // Validate basic fields
    if (typeof body.enabled !== 'boolean') {
      return NextResponse.json(
        {
          ok: false,
          error: 'Enabled must be a boolean',
        },
        { status: 400 }
      );
    }

    if (
      typeof body.minCooldownSec !== 'number' ||
      body.minCooldownSec < 5 ||
      body.minCooldownSec > 60
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Min cooldown must be between 5 and 60 seconds',
        },
        { status: 400 }
      );
    }

    if (typeof body.maxPerMinute !== 'number' || body.maxPerMinute < 1 || body.maxPerMinute > 10) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Max per minute must be between 1 and 10',
        },
        { status: 400 }
      );
    }

    // Validate particle counts
    const particleFields = ['small', 'medium', 'large'];
    for (const size of particleFields) {
      if (typeof body.particleCount[size] !== 'number' || body.particleCount[size] < 0) {
        return NextResponse.json(
          {
            ok: false,
            error: `Invalid particle count for ${size} burst`,
          },
          { status: 400 }
        );
      }
    }

    // Validate rarity weights
    const weightFields = ['small', 'medium', 'large'];
    let totalWeight = 0;
    for (const size of weightFields) {
      if (
        typeof body.rarityWeights[size] !== 'number' ||
        body.rarityWeights[size] < 0 ||
        body.rarityWeights[size] > 1
      ) {
        return NextResponse.json(
          {
            ok: false,
            error: `Invalid rarity weight for ${size} burst`,
          },
          { status: 400 }
        );
      }
      totalWeight += body.rarityWeights[size];
    }

    // Check if weights total approximately 1.0
    if (Math.abs(totalWeight - 1.0) > 0.01) {
      return NextResponse.json(
        {
          ok: false,
          error: `Rarity weights must total 100% (currently ${(totalWeight * 100).toFixed(1)}%)`,
        },
        { status: 400 }
      );
    }

    // Update or create site config
    const updatedConfig = await db.siteConfig.upsert({
      where: { id: 'singleton' },
      update: {
        burst: body,
        updatedAt: new Date(),
        updatedBy: userId,
      },
      create: {
        id: 'singleton',
        guestCap: 50,
        burst: body,
        tree: {
          sway: 0.5,
          spawnRate: 2000,
          snapPx: 4,
          dither: 0.3,
        },
        theme: {
          pinkIntensity: 1.0,
          grayIntensity: 1.0,
          motionIntensity: 2,
        },
        seasonal: {
          sakuraBoost: false,
          springMode: false,
          autumnMode: false,
        },
        rewards: {
          baseRateCents: 300,
          minPerOrder: 5,
          maxPerOrder: 120,
          streak: { enabled: true, dailyBonusPct: 0.05, maxPct: 0.25 },
          seasonal: { multiplier: 1.0 },
          daily: { softCap: 200, postSoftRatePct: 0.5, hardCap: 400 },
          firstPurchaseBonus: 20,
        },
        runes: {
          defs: [],
          combos: [],
          gacha: { enabled: true },
        },
        updatedAt: new Date(),
        updatedBy: userId,
      },
    });

    return NextResponse.json({
      ok: true,
      data: {
        config: updatedConfig.burst,
        message: 'Burst configuration updated successfully',
      },
    });
  } catch (error) {
    console.error('Burst config save error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
