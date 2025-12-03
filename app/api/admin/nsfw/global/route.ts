import { logger } from '@/app/lib/logger';
import { NextResponse } from 'next/server';
import { withAdminAuth } from '@/app/lib/auth/admin';
import { db } from '@/app/lib/db';
import { z } from 'zod';

export const runtime = 'nodejs';

const ToggleRequestSchema = z.object({
  enabled: z.boolean(),
});

async function handler(req: Request) {
  try {
    const body = await req.json();
    const { enabled } = ToggleRequestSchema.parse(body);

    // Upsert global NSFW setting
    await db.siteSetting.upsert({
      where: { key: 'nsfw_global_enabled' },
      create: {
        key: 'nsfw_global_enabled',
        boolValue: enabled,
      },
      update: {
        boolValue: enabled,
      },
    });

    return NextResponse.json({
      ok: true,
      data: {
        globalNSFWEnabled: enabled,
      },
    });
  } catch (error) {
    logger.error('NSFW global error', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: 'Invalid request data' }, { status: 400 });
    }
    return NextResponse.json(
      { ok: false, error: 'Failed to update global NSFW setting' },
      { status: 500 },
    );
  }
}

export const POST = withAdminAuth(handler);
