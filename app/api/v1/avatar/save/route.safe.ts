/**
 * Avatar Configuration Save API Route
 *
 * Handles secure saving of user avatar configurations with NSFW content validation,
 * adult verification checks, and comprehensive data validation.
 *
 * @fileoverview Avatar configuration persistence with security validation
 * @author Otaku-mori Team
 * @since 1.0.0
 */

import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { generateRequestId } from '../../../../lib/request-id';
import { createRateLimitMiddleware, RATE_LIMITS } from '../../../../lib/rate-limit';
import { checkIdempotency, storeIdempotencyResponse } from '../../../../lib/idempotency';
const AvatarSaveSchema = z.object({
  gender: z.enum(['male', 'female']),
  age: z.enum(['teen', 'young-adult', 'adult', 'mature']),
  body: z.object({
    height: z.number().min(0.7).max(1.3),
    weight: z.number().min(0.6).max(1.5),
    muscleMass: z.number().min(0.0).max(1.0),
    bodyFat: z.number().min(0.0).max(1.0),
    proportions: z.object({
      headSize: z.number().min(0.8).max(1.2),
      neckLength: z.number().min(0.7).max(1.3),
      shoulderWidth: z.number().min(0.7).max(1.4),
      chestSize: z.number().min(0.6).max(1.4),
      waistSize: z.number().min(0.6).max(1.3),
      hipWidth: z.number().min(0.7).max(1.4),
      armLength: z.number().min(0.8).max(1.2),
      legLength: z.number().min(0.8).max(1.3),
    }),
    genderFeatures: z.record(z.string(), z.number()).optional(),
  }),
  face: z.object({
    faceShape: z.object({
      overall: z.number().min(0.0).max(1.0),
      jawline: z.number().min(0.0).max(1.0),
      cheekbones: z.number().min(0.0).max(1.0),
      chinShape: z.number().min(0.0).max(1.0),
    }),
    eyes: z.object({
      size: z.number().min(0.7).max(1.3),
      spacing: z.number().min(0.8).max(1.2),
      height: z.number().min(0.8).max(1.2),
      angle: z.number().min(-0.3).max(0.3),
      eyelidShape: z.number().min(0.0).max(1.0),
      eyeColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
      eyebrowThickness: z.number().min(0.5).max(1.5),
      eyebrowAngle: z.number().min(-0.2).max(0.2),
    }),
    nose: z.object({
      size: z.number().min(0.7).max(1.3),
      width: z.number().min(0.7).max(1.3),
      height: z.number().min(0.8).max(1.2),
      bridgeWidth: z.number().min(0.5).max(1.3),
      nostrilSize: z.number().min(0.7).max(1.3),
      noseTip: z.number().min(0.0).max(1.0),
    }),
    mouth: z.object({
      size: z.number().min(0.7).max(1.3),
      width: z.number().min(0.8).max(1.2),
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
    }),
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
      gradient: z.boolean().optional(),
    }),
    highlights: z.object({
      enabled: z.boolean(),
      color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
      intensity: z.number().min(0.0).max(1.0),
      pattern: z.enum(['streaks', 'tips', 'roots', 'random']),
    }),
    accessories: z.array(z.string()),
  }),
  outfit: z.object({
    primary: z.object({
      type: z.enum([
        'school-uniform',
        'casual',
        'formal',
        'athletic',
        'fantasy',
        'cyberpunk',
        'gothic',
        'kawaii',
      ]),
      color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
      pattern: z.string().optional(),
      accessories: z.array(z.string()),
    }),
    secondary: z
      .object({
        type: z.string().optional(),
        color: z
          .string()
          .regex(/^#[0-9A-Fa-f]{6}$/)
          .optional(),
        opacity: z.number().min(0.0).max(1.0),
      })
      .optional(),
    fit: z.object({
      tightness: z.number().min(0.0).max(1.0),
      length: z.number().min(0.0).max(1.0),
      style: z.enum(['conservative', 'moderate', 'revealing', 'suggestive']),
    }),
  }),
  physics: z.object({
    softBody: z.object({
      enable: z.boolean(),
      mass: z.number().min(0.5).max(2.0),
      stiffness: z.number().min(0.1).max(1.0),
      damping: z.number().min(0.1).max(1.0),
      maxDisplacement: z.number().min(0.01).max(0.15),
      collision: z.object({
        pelvis: z.boolean(),
        chest: z.boolean(),
        spine: z.boolean(),
        thighs: z.boolean(),
      }),
    }),
    clothSim: z.object({
      enable: z.boolean(),
      bendStiffness: z.number().min(0.1).max(1.0),
      stretchStiffness: z.number().min(0.1).max(1.0),
      damping: z.number().min(0.1).max(1.0),
      wind: z.number().min(0.0).max(2.0),
      colliders: z.array(z.string()),
    }),
  }),
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
    textures: z
      .object({
        albedo: z.string().url().optional(),
        normal: z.string().url().optional(),
        orm: z.string().url().optional(),
        mask: z.string().url().optional(),
        decals: z.string().url().optional(),
      })
      .optional(),
  }),
  interactions: z.object({
    poses: z.array(z.string()),
    emotes: z.array(z.string()),
    cameraModes: z.array(z.string()),
    fx: z.array(z.string()),
  }),
  nsfw: z
    .object({
      enabled: z.boolean(),
      features: z.object({
        anatomyDetail: z.number().min(0.0).max(1.0),
        arousalIndicators: z.boolean(),
        interactionLevel: z.enum(['none', 'basic', 'advanced', 'explicit']),
      }),
      customization: z.record(z.string(), z.any()).optional(),
    })
    .optional(),
});

/**
 * Handles POST requests for avatar configuration saving
 *
 * Validates authentication, checks adult verification for NSFW content,
 * validates avatar data against comprehensive schema, and persists to database.
 *
 * @param {NextRequest} request - The incoming request with avatar configuration
 * @returns {Promise<NextResponse>} Save result or error response
 *
 * @example
 * // Save avatar configuration
 * const response = await fetch('/api/v1/avatar/save', {
 *   method: 'POST',
 *   headers: { 'x-idempotency-key': 'unique-key' },
 *   body: JSON.stringify(avatarData)
 * });
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
    if (cachedResponse) {
      return NextResponse.json(cachedResponse);
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

    // Parse and validate request body
    const body = await request.json();
    const validationResult = AvatarSaveSchema.safeParse(body);

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

    // Check if user has adult verification for NSFW content
    if (avatarConfig.nsfw?.enabled) {
      // Check adult verification from Clerk metadata
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

      // NSFW content enabled for verified adult user
    }

    // Save avatar configuration
    const updatedUser = await db.user.update({
      where: { clerkId: userId },
      data: {
        avatarConfig: avatarConfig,
        avatarRendering: '3d', // Default to 3D rendering
      },
      select: {
        id: true,
        username: true,
        avatarConfig: true,
        avatarRendering: true,
      },
    });

    // Generate avatar bundle for games
    const avatarBundle = {
      id: updatedUser.id,
      username: updatedUser.username,
      config: avatarConfig,
      rendering: updatedUser.avatarRendering,
      createdAt: new Date().toISOString(),
    };

    // Update avatar bundle
    await db.user.update({
      where: { clerkId: userId },
      data: {
        avatarBundle: avatarBundle,
      },
    });

    const response = {
      ok: true,
      data: {
        user: updatedUser,
        avatarBundle,
      },
      requestId,
    };

    // Store idempotency response
    await storeIdempotencyResponse(idempotencyKey, response);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Avatar save error:', error);

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
