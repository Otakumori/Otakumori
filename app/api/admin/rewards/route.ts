// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

// GET: Fetch rewards configuration
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Unauthorized',
        },
        { status: 401 },
      );
    }

    // TODO: Add admin role check
    // const user = await db.user.findUnique({ where: { clerkId: userId } });
    // if (!user?.isAdmin) { return NextResponse.json({ ok: false, error: 'Admin access required' }, { status: 403 }); }

    const siteConfig = await db.siteConfig.findUnique({
      where: { id: 'singleton' },
    });

    const rewardsConfig = (siteConfig?.rewards as any) || {
      baseRateCents: 300,
      minPerOrder: 5,
      maxPerOrder: 120,
      streak: {
        enabled: true,
        dailyBonusPct: 0.05,
        maxPct: 0.25,
      },
      seasonal: {
        multiplier: 1.0,
      },
      daily: {
        softCap: 200,
        postSoftRatePct: 0.5,
        hardCap: 400,
      },
      firstPurchaseBonus: 20,
    };

    return NextResponse.json({
      ok: true,
      data: { config: rewardsConfig },
    });
  } catch (error) {
    console.error('Rewards config fetch error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Internal server error',
      },
      { status: 500 },
    );
  }
}

// POST: Update rewards configuration
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Unauthorized',
        },
        { status: 401 },
      );
    }

    // TODO: Add admin role check
    // const user = await db.user.findUnique({ where: { clerkId: userId } });
    // if (!user?.isAdmin) { return NextResponse.json({ ok: false, error: 'Admin access required' }, { status: 403 }); }

    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      'baseRateCents',
      'minPerOrder',
      'maxPerOrder',
      'streak',
      'seasonal',
      'daily',
      'firstPurchaseBonus',
    ];
    for (const field of requiredFields) {
      if (!(field in body)) {
        return NextResponse.json(
          {
            ok: false,
            error: `Missing required field: ${field}`,
          },
          { status: 400 },
        );
      }
    }

    // Validate numeric fields
    const numericFields = ['baseRateCents', 'minPerOrder', 'maxPerOrder', 'firstPurchaseBonus'];
    for (const field of numericFields) {
      if (typeof body[field] !== 'number' || body[field] < 0) {
        return NextResponse.json(
          {
            ok: false,
            error: `Invalid value for ${field}: must be a positive number`,
          },
          { status: 400 },
        );
      }
    }

    // Validate order limits
    if (body.minPerOrder > body.maxPerOrder) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Min per order cannot be greater than max per order',
        },
        { status: 400 },
      );
    }

    // Validate streak configuration
    if (body.streak.enabled) {
      if (
        typeof body.streak.dailyBonusPct !== 'number' ||
        body.streak.dailyBonusPct < 0 ||
        body.streak.dailyBonusPct > 1
      ) {
        return NextResponse.json(
          {
            ok: false,
            error: 'Daily bonus percentage must be between 0 and 1',
          },
          { status: 400 },
        );
      }

      if (
        typeof body.streak.maxPct !== 'number' ||
        body.streak.maxPct < 0 ||
        body.streak.maxPct > 1
      ) {
        return NextResponse.json(
          {
            ok: false,
            error: 'Max streak percentage must be between 0 and 1',
          },
          { status: 400 },
        );
      }
    }

    // Validate seasonal multiplier
    if (
      typeof body.seasonal.multiplier !== 'number' ||
      body.seasonal.multiplier < 0.1 ||
      body.seasonal.multiplier > 5
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Seasonal multiplier must be between 0.1 and 5',
        },
        { status: 400 },
      );
    }

    // Validate daily caps
    if (body.daily.softCap > body.daily.hardCap) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Soft cap cannot be greater than hard cap',
        },
        { status: 400 },
      );
    }

    if (
      typeof body.daily.postSoftRatePct !== 'number' ||
      body.daily.postSoftRatePct < 0 ||
      body.daily.postSoftRatePct > 1
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Post-soft cap rate must be between 0 and 1',
        },
        { status: 400 },
      );
    }

    // Update or create site config
    const updatedConfig = await db.siteConfig.upsert({
      where: { id: 'singleton' },
      update: {
        rewards: body,
        updatedAt: new Date(),
        updatedBy: userId,
      },
      create: {
        id: 'singleton',
        guestCap: 50,
        burst: {
          enabled: true,
          minCooldownSec: 15,
          maxPerMinute: 3,
          particleCount: { small: 20, medium: 40, large: 80 },
          rarityWeights: { small: 0.6, medium: 0.3, large: 0.1 },
        },
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
        rewards: body,
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
        config: updatedConfig.rewards,
        message: 'Rewards configuration updated successfully',
      },
    });
  } catch (error) {
    console.error('Rewards config save error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Internal server error',
      },
      { status: 500 },
    );
  }
}
