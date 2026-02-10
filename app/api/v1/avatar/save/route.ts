import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { generateRequestId } from '@/app/lib/request-id';
import { createRateLimitMiddleware, RATE_LIMITS } from '@/app/lib/rate-limit';
import { checkIdempotency, storeIdempotencyResponse } from '@/app/lib/idempotency';
import { AvatarConfigSchema, filterNSFWParts } from '@/app/lib/avatar/schema';

/**
 * POST /api/v1/avatar/save
 * 
 * Saves the user's canonical avatar configuration.
 * Validates against schema, enforces versioning, and applies NSFW filtering.
 * Requires idempotency key header.
 */
export async function POST(request: NextRequest) {
  const requestId = generateRequestId();

  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: 'Authentication required', requestId },
        { status: 401, headers: { 'x-otm-reason': 'AUTH_REQUIRED' } },
      );
    }

    // Check idempotency
    const idempotencyKey = request.headers.get('x-idempotency-key');
    if (!idempotencyKey) {
      return NextResponse.json(
        { ok: false, error: 'Idempotency key required', requestId },
        { status: 400 },
      );
    }

    const cachedResponse = await checkIdempotency(idempotencyKey);
    if (cachedResponse && !cachedResponse.isNew) {
      return NextResponse.json(cachedResponse.response);
    }

    // Rate limiting
    const rateLimitMiddleware = createRateLimitMiddleware({
      ...RATE_LIMITS.AVATAR_SAVE,
      keyGenerator: () => `avatar_save:${userId}`,
    });

    const rateLimitResponse = await rateLimitMiddleware(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Get user from database
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        username: true,
        nsfwEnabled: true,
      },
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: 'User not found', requestId }, { status: 404 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = AvatarConfigSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Validation failed',
          details: validationResult.error.issues,
          requestId,
        },
        { status: 400 },
      );
    }

    const avatarConfig = validationResult.data;

    // Check NSFW content if enabled
    if (avatarConfig.nsfwEnabled && !user.nsfwEnabled) {
      return NextResponse.json(
        {
          ok: false,
          error: 'NSFW content requires adult verification',
          requestId,
        },
        { status: 403 },
      );
    }

    // Apply NSFW filtering if user doesn't have NSFW enabled
    const filteredConfig = user.nsfwEnabled 
      ? avatarConfig 
      : filterNSFWParts({ ...avatarConfig, nsfwEnabled: false });

    // Get existing avatar config to determine version
    const existingConfig = await db.avatarConfiguration.findFirst({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        configurationData: true,
      },
    });

    // Extract version from existing config or start at 1
    let newVersion = 1;
    if (existingConfig?.configurationData) {
      const existing = existingConfig.configurationData as any;
      newVersion = (existing.version || 1) + 1;
    }

    // Store version in the config data itself (since Prisma schema doesn't have version field)
    const configWithVersion = {
      ...filteredConfig,
      version: newVersion,
    };

    // Upsert avatar configuration
    const savedConfig = existingConfig
      ? await db.avatarConfiguration.update({
          where: { id: existingConfig.id },
          data: {
            configurationData: configWithVersion as any,
            updatedAt: new Date(),
          },
          select: {
            id: true,
            configurationData: true,
            glbUrl: true,
            updatedAt: true,
          },
        })
      : await db.avatarConfiguration.create({
          data: {
            userId: user.id,
            configurationData: configWithVersion as any,
          },
          select: {
            id: true,
            configurationData: true,
            glbUrl: true,
            updatedAt: true,
          },
        });

    // Extract version from saved config
    const savedConfigData = savedConfig.configurationData as any;
    const savedVersion = savedConfigData?.version || newVersion;

    const response = {
      ok: true,
      data: {
        config: filteredConfig,
        version: savedVersion,
        model3dUrl: savedConfig.glbUrl || null,
        spritesheetUrl: savedConfig.glbUrl 
          ? `/api/v1/avatar/generate-sprites?configId=${savedConfig.id}` 
          : null,
      },
      requestId,
    };

    // Store idempotency response
    await storeIdempotencyResponse(idempotencyKey, response);

    return NextResponse.json(response);
  } catch (error) {
    const { logger } = await import('@/app/lib/logger');
    logger.error(
      'Avatar save error',
      undefined,
      undefined,
      error instanceof Error ? error : new Error(String(error)),
    );

    return NextResponse.json(
      {
        ok: false,
        error: 'Internal server error',
        requestId,
      },
      { status: 500 },
    );
  }
}

