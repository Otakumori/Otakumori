/**
 * CREATOR Save API Route
 * Handles saving avatar configurations from the CREATOR system
 */

import { logger } from '@/app/lib/logger';
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { generateRequestId } from '@/lib/request-id';
import { checkIdempotency, storeIdempotencyResponse } from '@/lib/idempotency';
import { createRateLimitMiddleware, RATE_LIMITS } from '@/lib/rate-limit';
import type { CreatorAvatarConfig } from '@/app/lib/creator/types';

// Simplified schema for CREATOR config (full validation in types)
const CreatorSaveSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  name: z.string(),
  version: z.string(),
  baseModel: z.enum(['male', 'female', 'custom']),
  body: z.object({
    height: z.number().min(0.7).max(1.3),
    weight: z.number().min(0.4).max(1.6),
    muscleMass: z.number().min(0.0).max(1.0),
    bodyFat: z.number().min(0.0).max(1.0),
    shoulderWidth: z.number().min(0.7).max(1.4),
    chestSize: z.number().min(0.6).max(1.4),
    waistSize: z.number().min(0.6).max(1.3),
    hipWidth: z.number().min(0.7).max(1.4),
    armLength: z.number().min(0.8).max(1.2),
    legLength: z.number().min(0.8).max(1.3),
    thighSize: z.number().min(0.7).max(1.3),
    calfSize: z.number().min(0.7).max(1.2),
    headSize: z.number().min(0.8).max(1.2),
    neckLength: z.number().min(0.7).max(1.3),
  }),
  face: z.object({
    faceShape: z.number().min(0.0).max(1.0),
    jawline: z.number().min(0.0).max(1.0),
    cheekbones: z.number().min(0.0).max(1.0),
    chinShape: z.number().min(0.0).max(1.0),
    eyeSize: z.number().min(0.7).max(1.3),
    eyeSpacing: z.number().min(0.8).max(1.2),
    eyeHeight: z.number().min(0.8).max(1.2),
    eyeAngle: z.number().min(-0.3).max(0.3),
    eyelidShape: z.number().min(0.0).max(1.0),
    eyeColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    eyebrowThickness: z.number().min(0.5).max(1.5),
    eyebrowAngle: z.number().min(-0.2).max(0.2),
    noseSize: z.number().min(0.7).max(1.3),
    noseWidth: z.number().min(0.7).max(1.3),
    noseHeight: z.number().min(0.8).max(1.2),
    bridgeWidth: z.number().min(0.5).max(1.3),
    nostrilSize: z.number().min(0.7).max(1.3),
    noseTip: z.number().min(0.0).max(1.0),
    mouthSize: z.number().min(0.7).max(1.3),
    mouthWidth: z.number().min(0.8).max(1.2),
    lipThickness: z.number().min(0.5).max(1.5),
    lipShape: z.number().min(0.0).max(1.0),
    cupidBow: z.number().min(0.0).max(1.0),
    mouthAngle: z.number().min(-0.2).max(0.2),
  }),
  skin: z.object({
    tone: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    texture: z.number().min(0.0).max(1.0),
    blemishes: z.number().min(0.0).max(1.0),
    freckles: z.number().min(0.0).max(1.0),
    ageSpots: z.number().min(0.0).max(1.0),
    wrinkles: z.number().min(0.0).max(1.0),
    glossiness: z.number().min(0.0).max(1.0),
  }),
  hair: z.object({
    style: z.string(),
    length: z.number().min(0.0).max(1.0),
    volume: z.number().min(0.5).max(1.5),
    texture: z.number().min(0.0).max(1.0),
    color: z.object({
      primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
      secondary: z
        .string()
        .regex(/^#[0-9A-Fa-f]{6}$/)
        .optional(),
      gradient: z.boolean(),
    }),
    highlights: z.object({
      enabled: z.boolean(),
      color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
      intensity: z.number().min(0.0).max(1.0),
      pattern: z.enum(['streaks', 'tips', 'roots', 'random']),
    }),
  }),
  parts: z.record(z.string(), z.string().optional()),
  materials: z.object({
    shader: z.enum(['AnimeToon', 'Realistic', 'CelShaded', 'Stylized']),
    parameters: z.object({
      glossStrength: z.number().min(0.0).max(1.0),
      rimStrength: z.number().min(0.0).max(1.0),
      colorA: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
      colorB: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
      rimColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
      metallic: z.number().min(0.0).max(1.0),
      roughness: z.number().min(0.0).max(1.0),
    }),
  }),
  physics: z.object({
    softBody: z.object({
      enable: z.boolean(),
      mass: z.number().min(0.5).max(2.0),
      stiffness: z.number().min(0.1).max(1.0),
      damping: z.number().min(0.1).max(1.0),
      maxDisplacement: z.number().min(0.01).max(0.15),
    }),
    clothSim: z.object({
      enable: z.boolean(),
      bendStiffness: z.number().min(0.1).max(1.0),
      stretchStiffness: z.number().min(0.1).max(1.0),
      damping: z.number().min(0.1).max(1.0),
      wind: z.number().min(0.0).max(2.0),
    }),
  }),
  nsfw: z
    .object({
      enabled: z.boolean(),
      features: z.object({
        anatomyDetail: z.number().min(0.0).max(1.0),
        arousalIndicators: z.boolean(),
        interactionLevel: z.enum(['none', 'basic', 'advanced', 'explicit']),
      }),
    })
    .optional(),
});

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
    if (cachedResponse) {
      return NextResponse.json(cachedResponse);
    }

    // Rate limiting
    const rateLimitMiddleware = createRateLimitMiddleware({
      ...RATE_LIMITS.AVATAR_SAVE,
      keyGenerator: () => `creator_save:${userId}`,
    });

    const rateLimitResponse = await rateLimitMiddleware(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = CreatorSaveSchema.safeParse(body);

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

    const creatorConfig = validationResult.data as CreatorAvatarConfig;

    // Check NSFW content
    if (creatorConfig.nsfw?.enabled) {
      const { currentUser } = await import('@clerk/nextjs/server');
      const user = await currentUser();

      if (!user?.publicMetadata?.adultVerified) {
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: 'ADULT_VERIFICATION_REQUIRED',
              message: 'Adult verification required for NSFW content',
            },
            requestId,
          },
          { status: 403 },
        );
      }
    }

    // Convert to avatar config format for database
    const avatarConfig = {
      gender: creatorConfig.baseModel === 'male' ? 'male' : 'female',
      age: 'young-adult',
      body: {
        height: creatorConfig.body.height,
        weight: creatorConfig.body.weight,
        muscleMass: creatorConfig.body.muscleMass,
        bodyFat: creatorConfig.body.bodyFat,
        proportions: {
          headSize: creatorConfig.body.headSize,
          neckLength: creatorConfig.body.neckLength,
          shoulderWidth: creatorConfig.body.shoulderWidth,
          chestSize: creatorConfig.body.chestSize,
          waistSize: creatorConfig.body.waistSize,
          hipWidth: creatorConfig.body.hipWidth,
          armLength: creatorConfig.body.armLength,
          legLength: creatorConfig.body.legLength,
        },
      },
      face: {
        faceShape: {
          overall: creatorConfig.face.faceShape,
          jawline: creatorConfig.face.jawline,
          cheekbones: creatorConfig.face.cheekbones,
          chinShape: creatorConfig.face.chinShape,
        },
        eyes: {
          size: creatorConfig.face.eyeSize,
          spacing: creatorConfig.face.eyeSpacing,
          height: creatorConfig.face.eyeHeight,
          angle: creatorConfig.face.eyeAngle,
          eyelidShape: creatorConfig.face.eyelidShape,
          eyeColor: creatorConfig.face.eyeColor,
          eyebrowThickness: creatorConfig.face.eyebrowThickness,
          eyebrowAngle: creatorConfig.face.eyebrowAngle,
        },
        nose: {
          size: creatorConfig.face.noseSize,
          width: creatorConfig.face.noseWidth,
          height: creatorConfig.face.noseHeight,
          bridgeWidth: creatorConfig.face.bridgeWidth,
          nostrilSize: creatorConfig.face.nostrilSize,
          noseTip: creatorConfig.face.noseTip,
        },
        mouth: {
          size: creatorConfig.face.mouthSize,
          width: creatorConfig.face.mouthWidth,
          lipThickness: creatorConfig.face.lipThickness,
          lipShape: creatorConfig.face.lipShape,
          cupidBow: creatorConfig.face.cupidBow,
          mouthAngle: creatorConfig.face.mouthAngle,
        },
        skin: {
          tone: creatorConfig.skin.tone,
          texture: creatorConfig.skin.texture,
          blemishes: creatorConfig.skin.blemishes,
          freckles: creatorConfig.skin.freckles,
          ageSpots: creatorConfig.skin.ageSpots,
          wrinkles: creatorConfig.skin.wrinkles,
        },
      },
      hair: {
        style: creatorConfig.hair.style,
        length: creatorConfig.hair.length,
        volume: creatorConfig.hair.volume,
        texture: creatorConfig.hair.texture,
        color: {
          primary: creatorConfig.hair.color.primary,
          secondary: creatorConfig.hair.color.secondary,
          gradient: creatorConfig.hair.color.gradient,
        },
        highlights: creatorConfig.hair.highlights,
        accessories: [],
      },
      outfit: {
        primary: {
          type: 'casual',
          color: '#ffffff',
          accessories: [],
        },
      },
      physics: creatorConfig.physics,
      materials: creatorConfig.materials,
      interactions: {
        poses: [],
        emotes: [],
        cameraModes: [],
        fx: [],
      },
      nsfw: creatorConfig.nsfw,
    };

    // Save to database
    const updatedUser = await db.user.update({
      where: { clerkId: userId },
      data: {
        avatarConfig: avatarConfig,
        avatarRendering: '3d',
        avatarBundle: JSON.parse(
          JSON.stringify({
            id: creatorConfig.id || `avatar-${Date.now()}`,
            userId: creatorConfig.userId,
            name: creatorConfig.name,
            config: creatorConfig,
            rendering: '3d',
            createdAt: new Date().toISOString(),
          }),
        ),
      },
      select: {
        id: true,
        username: true,
        avatarConfig: true,
        avatarBundle: true,
      },
    });

    const response = {
      ok: true,
      data: {
        avatarId: creatorConfig.id || `avatar-${Date.now()}`,
        savedAt: new Date().toISOString(),
        user: updatedUser,
      },
      requestId,
    };

    // Store idempotency response
    await storeIdempotencyResponse(idempotencyKey, response);

    return NextResponse.json(response);
  } catch (error) {
    logger.error('CREATOR save error:', error);

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
