/**
 * Sprite Generation API
 * Generates 2D sprite sheets from 3D avatar configurations
 * Note: Full server-side generation requires headless browser or Node.js-compatible Three.js
 * For now, this API validates requests and can trigger client-side generation
 */

import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { put } from '@vercel/blob';
import { logger } from '@/app/lib/logger';
import { generateRequestId } from '@/app/lib/request-id';
import type { AvatarConfiguration } from '@/app/lib/3d/avatar-parts';
import type {
  SpriteGenerationOptions,
  SpriteSheet,
} from '@om/avatar-engine/gameIntegration/spriteGenerator';
import { createSpriteAtlas } from '@om/avatar-engine/gameIntegration/spriteAtlas';

export const runtime = 'nodejs';

interface GenerateSpritesRequest {
  avatarConfig: AvatarConfiguration;
  options?: SpriteGenerationOptions;
}

/**
 * Generate cache key from avatar config
 */
function generateCacheKey(
  avatarConfig: AvatarConfiguration,
  options: SpriteGenerationOptions,
): string {
  const configStr = JSON.stringify(avatarConfig);
  const optionsStr = JSON.stringify(options);
  // Simple hash - in production, use crypto.createHash
  const combined = configStr + optionsStr;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `sprite_${Math.abs(hash).toString(36)}`;
}

/**
 * Check if sprite sheet exists in cache
 */
async function getCachedSpriteSheet(
  cacheKey: string,
): Promise<{ url: string; frameMetadata: any } | null> {
  // In full implementation, would check database for cached sprite sheet
  // For now, return null (no caching)
  return null;
}

/**
 * Upload sprite sheet to Vercel Blob
 */
async function uploadSpriteSheet(
  spriteSheet: SpriteSheet,
  userId: string,
  cacheKey: string,
): Promise<string> {
  // Create sprite atlas from frames
  const atlas = await createSpriteAtlas(
    spriteSheet.frames,
    spriteSheet.frameWidth,
    spriteSheet.frameHeight,
  );

  // Convert base64 to buffer
  const base64Data = atlas.imageData.split(',')[1]; // Remove data:image/png;base64, prefix
  const buffer = Buffer.from(base64Data, 'base64');

  // Upload to Vercel Blob
  const key = `sprites/${userId}/${cacheKey}.png`;
  const { url } = await put(key, buffer, {
    access: 'public',
    contentType: 'image/png',
    addRandomSuffix: false,
  });

  return url;
}

/**
 * POST /api/v1/avatar/generate-sprites
 * Generate sprite sheet from avatar configuration
 */
export async function POST(req: NextRequest) {
  const requestId = generateRequestId();

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: 'AUTH_REQUIRED', requestId },
        { status: 401, headers: { 'x-otm-reason': 'AUTH_REQUIRED' } },
      );
    }

    const body = (await req.json()) as GenerateSpritesRequest;
    const { avatarConfig, options = {} } = body;

    if (!avatarConfig || !avatarConfig.id) {
      return NextResponse.json(
        { ok: false, error: 'VALIDATION_ERROR', requestId, details: 'Invalid avatar configuration' },
        { status: 400 },
      );
    }

    // Generate cache key
    const cacheKey = generateCacheKey(avatarConfig, options);

    // Check cache
    const cached = await getCachedSpriteSheet(cacheKey);
    if (cached) {
      return NextResponse.json({
        ok: true,
        data: {
          spriteSheetUrl: cached.url,
          frameMetadata: cached.frameMetadata,
          cached: true,
        },
        requestId,
      });
    }

    // Note: Full server-side sprite generation requires:
    // 1. Headless browser (Puppeteer/Playwright) with WebGL support, OR
    // 2. Node.js-compatible Three.js renderer (complex setup)
    // For now, return an error indicating client-side generation is required
    // In production, implement server-side generation here

    return NextResponse.json(
      {
        ok: false,
        error: 'NOT_IMPLEMENTED',
        requestId,
        details:
          'Server-side sprite generation not yet implemented. Please use client-side generation.',
      },
      { status: 501 },
    );

    // Future implementation would:
    // 1. Generate sprite sheet using Three.js (headless browser or Node.js renderer)
    // 2. Create sprite atlas
    // 3. Upload to Vercel Blob
    // 4. Cache in database
    // 5. Return sprite sheet URL and frame metadata
  } catch (error) {
    logger.error(
      'Sprite generation error',
      undefined,
      { requestId },
      error instanceof Error ? error : new Error(String(error)),
    );

    return NextResponse.json(
      {
        ok: false,
        error: 'INTERNAL_ERROR',
        requestId,
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

