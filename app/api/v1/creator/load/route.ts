/**
 * CREATOR Load API Route
 * Handles loading avatar configurations for the CREATOR system
 */

import { logger } from '@/app/lib/logger';
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { generateRequestId } from '@/lib/request-id';
import type { CreatorAvatarConfig } from '@/app/lib/creator/types';

export async function GET(_request: NextRequest) {
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

    // Get user's avatar configuration
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarConfig: true,
        avatarBundle: true,
        avatarRendering: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: 'User not found', requestId }, { status: 404 });
    }

    // Convert avatar config to CREATOR format
    let creatorConfig: CreatorAvatarConfig | null = null;

    if (user.avatarBundle && typeof user.avatarBundle === 'object') {
      // Use avatarBundle if available (preferred)
      const bundle = user.avatarBundle as any;
      if (bundle.config) {
        creatorConfig = bundle.config as CreatorAvatarConfig;
      }
    } else if (user.avatarConfig && typeof user.avatarConfig === 'object') {
      // Convert legacy avatarConfig format
      const config = user.avatarConfig as any;
      creatorConfig = convertLegacyConfig(config, user.id);
    }

    // Return avatar data
    const response = {
      ok: true,
      data: creatorConfig,
      requestId,
    };

    return NextResponse.json(response);
  } catch (error) {
    logger.error('CREATOR load error:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));

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

// Convert legacy avatar config to CREATOR format
function convertLegacyConfig(config: any, userId: string): CreatorAvatarConfig {
  return {
    id: `avatar-${Date.now()}`,
    userId,
    name: 'My Avatar',
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    baseModel: config.gender === 'male' ? 'male' : 'female',
    body: {
      height: config.body?.height ?? 1.0,
      weight: config.body?.weight ?? 1.0,
      muscleMass: config.body?.muscleMass ?? 0.5,
      bodyFat: config.body?.bodyFat ?? 0.5,
      shoulderWidth: config.body?.proportions?.shoulderWidth ?? 1.0,
      chestSize: config.body?.proportions?.chestSize ?? 1.0,
      waistSize: config.body?.proportions?.waistSize ?? 1.0,
      hipWidth: config.body?.proportions?.hipWidth ?? 1.0,
      armLength: config.body?.proportions?.armLength ?? 1.0,
      legLength: config.body?.proportions?.legLength ?? 1.0,
      thighSize: 1.0,
      calfSize: 1.0,
      headSize: config.body?.proportions?.headSize ?? 1.0,
      neckLength: config.body?.proportions?.neckLength ?? 1.0,
    },
    face: {
      faceShape: config.face?.faceShape?.overall ?? 0.5,
      jawline: config.face?.faceShape?.jawline ?? 0.5,
      cheekbones: config.face?.faceShape?.cheekbones ?? 0.5,
      chinShape: config.face?.faceShape?.chinShape ?? 0.5,
      eyeSize: config.face?.eyes?.size ?? 1.0,
      eyeSpacing: config.face?.eyes?.spacing ?? 1.0,
      eyeHeight: config.face?.eyes?.height ?? 1.0,
      eyeAngle: config.face?.eyes?.angle ?? 0.0,
      eyelidShape: config.face?.eyes?.eyelidShape ?? 0.5,
      eyeColor: config.face?.eyes?.eyeColor ?? '#4a90e2',
      eyebrowThickness: config.face?.eyes?.eyebrowThickness ?? 1.0,
      eyebrowAngle: config.face?.eyes?.eyebrowAngle ?? 0.0,
      noseSize: config.face?.nose?.size ?? 1.0,
      noseWidth: config.face?.nose?.width ?? 1.0,
      noseHeight: config.face?.nose?.height ?? 1.0,
      bridgeWidth: config.face?.nose?.bridgeWidth ?? 1.0,
      nostrilSize: config.face?.nose?.nostrilSize ?? 1.0,
      noseTip: config.face?.nose?.noseTip ?? 0.5,
      mouthSize: config.face?.mouth?.size ?? 1.0,
      mouthWidth: config.face?.mouth?.width ?? 1.0,
      lipThickness: config.face?.mouth?.lipThickness ?? 1.0,
      lipShape: config.face?.mouth?.lipShape ?? 0.5,
      cupidBow: config.face?.mouth?.cupidBow ?? 0.5,
      mouthAngle: config.face?.mouth?.mouthAngle ?? 0.0,
    },
    skin: {
      tone: config.face?.skin?.tone ?? '#fdbcb4',
      texture: config.face?.skin?.texture ?? 0.5,
      blemishes: config.face?.skin?.blemishes ?? 0.0,
      freckles: config.face?.skin?.freckles ?? 0.0,
      ageSpots: config.face?.skin?.ageSpots ?? 0.0,
      wrinkles: config.face?.skin?.wrinkles ?? 0.0,
      glossiness: 0.5,
    },
    hair: {
      style: config.hair?.style ?? 'default',
      length: config.hair?.length ?? 0.5,
      volume: config.hair?.volume ?? 1.0,
      texture: config.hair?.texture ?? 0.5,
      color: {
        primary: config.hair?.color?.primary ?? '#8B4513',
        secondary: config.hair?.color?.secondary,
        gradient: config.hair?.color?.gradient ?? false,
      },
      highlights: config.hair?.highlights ?? {
        enabled: false,
        color: '#ffffff',
        intensity: 0.0,
        pattern: 'streaks',
      },
    },
    parts: {},
    materials: config.materials ?? {
      shader: 'AnimeToon',
      parameters: {
        glossStrength: 0.5,
        rimStrength: 0.3,
        colorA: '#ec4899',
        colorB: '#8b5cf6',
        rimColor: '#ffffff',
        metallic: 0.0,
        roughness: 0.5,
      },
    },
    physics: config.physics ?? {
      softBody: {
        enable: false,
        mass: 1.0,
        stiffness: 0.5,
        damping: 0.5,
        maxDisplacement: 0.1,
      },
      clothSim: {
        enable: false,
        bendStiffness: 0.5,
        stretchStiffness: 0.5,
        damping: 0.5,
        wind: 0.0,
      },
    },
    nsfw: config.nsfw,
  };
}
