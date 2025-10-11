import { NextResponse, type NextRequest } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { z } from 'zod';

import { db } from '@/lib/db';
import type { BurstConfig } from '@/types/runes';

export const runtime = 'nodejs';

const ParticleCountSchema = z.object({
  small: z.number().int().min(0).max(500),
  medium: z.number().int().min(0).max(500),
  large: z.number().int().min(0).max(500),
});

const RarityWeightsSchema = z
  .object({
    small: z.number().min(0).max(1),
    medium: z.number().min(0).max(1),
    large: z.number().min(0).max(1),
  })
  .superRefine((weights, ctx) => {
    const total = weights.small + weights.medium + weights.large;
    if (Math.abs(total - 1) > 0.01) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Rarity weights must total 100% (currently ${(total * 100).toFixed(1)}%)`,
      });
    }
  });

const BurstConfigSchema = z.object({
  enabled: z.boolean(),
  minCooldownSec: z.number().int().min(5).max(60),
  maxPerMinute: z.number().int().min(1).max(10),
  particleCount: ParticleCountSchema,
  rarityWeights: RarityWeightsSchema,
});

type BurstConfigPayload = z.infer<typeof BurstConfigSchema>;

const DEFAULT_BURST_CONFIG: BurstConfig = {
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

async function requireAdmin() {
  const { userId } = await auth();
  if (!userId) {
    throw new ResponseError('Unauthorized', 401);
  }

  const user = await currentUser();
  if (user?.publicMetadata?.role !== 'admin') {
    throw new ResponseError('Forbidden', 403);
  }

  return userId;
}

class ResponseError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

async function getBurstConfig(): Promise<BurstConfig> {
  const siteConfig = await db.siteConfig.findUnique({
    where: { id: 'singleton' },
  });

  const parsed = BurstConfigSchema.safeParse(siteConfig?.burst ?? DEFAULT_BURST_CONFIG);
  if (parsed.success) {
    return parsed.data;
  }

  return DEFAULT_BURST_CONFIG;
}

export async function GET() {
  try {
    await requireAdmin();
    const config = await getBurstConfig();

    return NextResponse.json({ ok: true, data: { config } });
  } catch (error) {
    if (error instanceof ResponseError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: error.status });
    }

    console.error('Burst config fetch error', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireAdmin();
    const body = (await request.json()) as unknown;
    const config: BurstConfigPayload = BurstConfigSchema.parse(body);

    const siteConfig = await db.siteConfig.upsert({
      where: { id: 'singleton' },
      update: {
        burst: config,
        updatedAt: new Date(),
        updatedBy: userId,
      },
      create: {
        id: 'singleton',
        guestCap: 50,
        burst: config,
        tree: {
          sway: 0.5,
          spawnRate: 2000,
          snapPx: 4,
          dither: 0.3,
        },
        theme: {
          pinkIntensity: 1,
          grayIntensity: 1,
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
          seasonal: { multiplier: 1 },
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

    const updated = BurstConfigSchema.parse(siteConfig.burst ?? config);

    return NextResponse.json({
      ok: true,
      data: {
        config: updated,
        message: 'Burst configuration updated successfully',
      },
    });
  } catch (error) {
    if (error instanceof ResponseError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: error.status });
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: error.issues.map((issue) => issue.message).join(', ') },
        { status: 400 },
      );
    }

    console.error('Burst config save error', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
