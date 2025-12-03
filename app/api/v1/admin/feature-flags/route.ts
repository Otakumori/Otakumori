/**
 * Admin Feature Flags API
 *
 * GET: Returns effective feature flags and DB settings
 * POST: Updates a feature flag setting
 */

import { logger } from '@/app/lib/logger';
import { auth, currentUser } from '@clerk/nextjs/server';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { isAdminEmail } from '@/app/lib/config/admin';
import { getEffectiveFeatureFlags } from '@/app/lib/config/featureFlags.server';
import { getSiteSettingsMap, upsertSiteSetting } from '@/app/lib/config/siteSettings.server';
import { env } from '@/env';

export const runtime = 'nodejs';

const UpdateSettingSchema = z.object({
  key: z.enum(['AVATARS_ENABLED', 'REQUIRE_AUTH_FOR_MINI_GAMES', 'NSFW_AVATARS_ENABLED']),
  boolValue: z.boolean(),
  updatedBy: z.string().min(1),
});

/**
 * Check if user is admin
 */
async function requireAdmin() {
  const { userId } = await auth();
  if (!userId) {
    return { error: 'Unauthorized', status: 401 };
  }

  const user = await currentUser();
  const email =
    user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses?.[0]?.emailAddress ?? null;

  if (!isAdminEmail(email)) {
    return { error: 'Forbidden', status: 403 };
  }

  return { userId, email };
}

/**
 * Get system status (which env vars are configured)
 */
function getSystemStatus() {
  return [
    {
      name: 'Clerk',
      configured: Boolean(env.CLERK_SECRET_KEY && env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY),
    },
    { name: 'Stripe', configured: Boolean(env.STRIPE_SECRET_KEY) },
    { name: 'Printify', configured: Boolean(env.PRINTIFY_API_KEY) },
    { name: 'Inngest', configured: Boolean(env.INNGEST_EVENT_KEY) },
    { name: 'Database', configured: Boolean(env.DATABASE_URL) },
  ];
}

export async function GET() {
  try {
    const adminCheck = await requireAdmin();
    if ('error' in adminCheck) {
      return NextResponse.json(
        { ok: false, error: adminCheck.error },
        { status: adminCheck.status },
      );
    }

    // Get effective flags and DB settings
    const effectiveFlags = await getEffectiveFeatureFlags();
    const dbSettings = await getSiteSettingsMap();
    const systemStatus = getSystemStatus();

    return NextResponse.json({
      ok: true,
      data: {
        effectiveFlags,
        dbSettings,
        systemStatus,
      },
    });
  } catch (error) {
    logger.error(
      'Error fetching admin feature flags:',
      undefined,
      undefined,
      error instanceof Error ? error : new Error(String(error)),
    );
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminCheck = await requireAdmin();
    if ('error' in adminCheck) {
      return NextResponse.json(
        { ok: false, error: adminCheck.error },
        { status: adminCheck.status },
      );
    }

    const body = await req.json();
    const validation = UpdateSettingSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { ok: false, error: 'Invalid request data', details: validation.error.errors },
        { status: 400 },
      );
    }

    const { key, boolValue, updatedBy } = validation.data;

    // Update setting
    await upsertSiteSetting(key, { boolValue }, updatedBy);

    // Return updated effective flags
    const effectiveFlags = await getEffectiveFeatureFlags();

    return NextResponse.json({
      ok: true,
      data: {
        effectiveFlags,
        dbSettings: { [key]: { boolValue } },
      },
    });
  } catch (error) {
    logger.error(
      'Error updating feature flag:',
      undefined,
      undefined,
      error instanceof Error ? error : new Error(String(error)),
    );
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
