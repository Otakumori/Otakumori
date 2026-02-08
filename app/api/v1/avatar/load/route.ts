import { logger } from '@/app/lib/logger';
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { generateRequestId } from '@/app/lib/request-id';
import { createRateLimitMiddleware, RATE_LIMITS } from '@/app/lib/rate-limit';
import { AvatarConfigSchema, validateAvatarConfig, filterNSFWParts, DEFAULT_AVATAR_CONFIG } from '@/app/lib/avatar/schema';

/**
 * GET /api/v1/avatar/load
 * 
 * Loads the user's canonical avatar configuration.
 * Returns config with model3dUrl and spritesheetUrl if available.
 * Enforces NSFW filtering based on nsfwEnabled flag.
 */
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();

  try {
    // Check authentication first (needed for rate limit key)
    const { userId } = await auth();

    // Rate limiting
    const rateLimitMiddleware = createRateLimitMiddleware({
      ...RATE_LIMITS.AVATAR_LOAD,
      keyGenerator: () => `avatar_load:${userId || 'anonymous'}`,
    });

    const rateLimitResponse = await rateLimitMiddleware(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: 'Authentication required', requestId },
        { status: 401, headers: { 'x-otm-reason': 'AUTH_REQUIRED' } },
      );
    }

    // Get user from database
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        username: true,
        displayName: true,
        nsfwEnabled: true,
      },
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: 'User not found', requestId }, { status: 404 });
    }

    // Get user's avatar configuration from AvatarConfiguration table
    const avatarConfig = await db.avatarConfiguration.findFirst({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        configurationData: true,
        glbUrl: true,
        updatedAt: true,
      },
    });

    // If no avatar config exists, return default
    if (!avatarConfig || !avatarConfig.configurationData) {
      const defaultConfig = filterNSFWParts(DEFAULT_AVATAR_CONFIG);
      
      return NextResponse.json({
        ok: true,
        data: {
          config: defaultConfig,
          model3dUrl: null,
          spritesheetUrl: null,
          version: 1,
        },
        requestId,
      });
    }

    // Validate and normalize the configuration
    const validatedConfig = validateAvatarConfig(avatarConfig.configurationData);
    
    // Extract version from config (stored in configurationData)
    const version = validatedConfig.version || 1;
    
    // Apply NSFW filtering based on user's nsfwEnabled setting
    const userNsfwEnabled = user.nsfwEnabled ?? false;
    const filteredConfig = userNsfwEnabled 
      ? validatedConfig 
      : filterNSFWParts({ ...validatedConfig, nsfwEnabled: false });

    // Get GLB URL if available
    const model3dUrl = avatarConfig.glbUrl || null;

    // Generate spritesheet URL (cached/generated)
    // For now, we'll return a placeholder that can be generated on-demand
    // In production, this would check for cached spritesheet or trigger generation
    const spritesheetUrl = model3dUrl 
      ? `/api/v1/avatar/generate-sprites?configId=${avatarConfig.id}` 
      : null;

    return NextResponse.json({
      ok: true,
      data: {
        config: filteredConfig,
        model3dUrl,
        spritesheetUrl,
        version,
      },
      requestId,
    });
  } catch (error) {
    logger.error(
      'Avatar load error',
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

