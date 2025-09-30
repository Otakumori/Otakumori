import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { env } from '@/env';
import { z } from 'zod';
import { generateRequestId } from '@/app/lib/request-id';

// Feature flag checks
function checkFeatureFlags() {
  if (!env.FEATURE_ADULT_ZONE || env.FEATURE_ADULT_ZONE !== 'true') {
    return false;
  }
  if (!env.FEATURE_GATED_COSMETICS || env.FEATURE_GATED_COSMETICS !== 'true') {
    return false;
  }
  return true;
}

// Request validation schema
const PreviewRequest = z.object({
  packSlug: z.string().min(1),
  sliders: z.record(z.string(), z.number()).optional().default({}),
});

// Mock pack data - in production this would come from your storage
const mockPackData = {
  midnight_set_A: {
    slug: 'midnight_set_A',
    title: 'Midnight Set A',
    rarity: 'legendary',
    type: 'outfit',
    isAdultOnly: true,
    pricePetals: 2500,
    priceUsdCents: 1999,
    physicsProfile: {
      id: 'enhanced_physics',
      softBody: {
        enable: true,
        mass: 1.2,
        stiffness: 0.5,
        damping: 0.3,
        maxDisplacement: 0.08,
        collision: {
          pelvis: true,
          chest: true,
          spine: true,
          thighs: true,
        },
      },
      clothSim: {
        enable: true,
        bendStiffness: 0.6,
        stretchStiffness: 0.7,
        damping: 0.25,
        wind: 0.3,
        colliders: ['hips', 'chest', 'thighL', 'thighR'],
      },
    },
    interactions: [
      { id: 'pose:flair_A', kind: 'pose', intensity: 0.7, gated: true },
      { id: 'emote:wink_A', kind: 'emote', intensity: 0.5, gated: false },
      { id: 'camera:orbit_slow', kind: 'camera', intensity: 0.3, gated: false },
    ],
    materials: {
      shader: 'AnimeToon',
      params: {
        glossStrength: 0.8,
        rimStrength: 0.4,
        colorA: '#1a1a2e',
        colorB: '#16213e',
        rimColor: '#e94560',
      },
    },
    layers: ['outfit', 'accessories'],
    assets: {
      albedo: 'https://example.com/midnight_set_A_albedo.ktx2',
      normal: 'https://example.com/midnight_set_A_normal.ktx2',
      orm: 'https://example.com/midnight_set_A_orm.ktx2',
      mask: 'https://example.com/midnight_set_A_mask.ktx2',
    },
    sliders: [
      {
        id: 'outfit.tightness',
        label: 'Outfit Tightness',
        min: 0,
        max: 1,
        step: 0.01,
        default: 0.5,
        affects: ['outfit_morph'],
      },
      {
        id: 'outfit.hemLength',
        label: 'Hem Length',
        min: 0,
        max: 1,
        step: 0.01,
        default: 0.3,
        affects: ['hem_morph'],
      },
      {
        id: 'accessories.gloss',
        label: 'Accessory Gloss',
        min: 0,
        max: 1,
        step: 0.01,
        default: 0.7,
        affects: ['accessory_shader'],
      },
    ],
  },
  neo_street_fighter: {
    slug: 'neo_street_fighter',
    title: 'Neo Street Fighter',
    rarity: 'rare',
    type: 'outfit',
    isAdultOnly: true,
    pricePetals: 1500,
    priceUsdCents: 1299,
    physicsProfile: {
      id: 'standard_physics',
      softBody: {
        enable: false,
        mass: 1.0,
        stiffness: 0.4,
        damping: 0.2,
        maxDisplacement: 0.06,
        collision: {
          pelvis: true,
          chest: true,
          spine: false,
          thighs: true,
        },
      },
      clothSim: {
        enable: false,
        bendStiffness: 0.5,
        stretchStiffness: 0.6,
        damping: 0.2,
        wind: 0.0,
        colliders: [],
      },
    },
    interactions: [
      { id: 'pose:combat_ready', kind: 'pose', intensity: 0.8, gated: false },
      { id: 'emote:determined', kind: 'emote', intensity: 0.6, gated: false },
    ],
    materials: {
      shader: 'AnimeToon',
      params: {
        glossStrength: 0.4,
        rimStrength: 0.3,
        colorA: '#2c3e50',
        colorB: '#34495e',
        rimColor: '#3498db',
      },
    },
    layers: ['outfit'],
    assets: {
      albedo: 'https://example.com/neo_street_fighter_albedo.ktx2',
      normal: 'https://example.com/neo_street_fighter_normal.ktx2',
    },
    sliders: [
      {
        id: 'outfit.muscleDefinition',
        label: 'Muscle Definition',
        min: 0,
        max: 1,
        step: 0.01,
        default: 0.6,
        affects: ['muscle_morph'],
      },
      {
        id: 'outfit.athleticFit',
        label: 'Athletic Fit',
        min: 0,
        max: 1,
        step: 0.01,
        default: 0.8,
        affects: ['fit_morph'],
      },
    ],
  },
};

// Merge slider values with pack defaults
function mergeSliderDefaults(pack: any, userSliders: Record<string, number>) {
  const mergedSliders = { ...userSliders };

  // Apply pack-specific slider defaults
  pack.sliders.forEach((slider: any) => {
    if (!(slider.id in mergedSliders)) {
      mergedSliders[slider.id] = slider.default;
    }
  });

  return mergedSliders;
}

export async function GET(request: NextRequest) {
  const requestId = generateRequestId();

  try {
    // Check feature flags
    if (!checkFeatureFlags()) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'FEATURE_DISABLED',
            message: 'Adult zone feature not available',
          },
          requestId,
        },
        { status: 503 },
      );
    }

    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'AUTH_REQUIRED',
            message: 'Authentication required',
          },
          requestId,
        },
        { status: 401 },
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const packSlug = searchParams.get('packSlug');
    const slidersParam = searchParams.get('sliders');

    let userSliders = {};
    if (slidersParam) {
      try {
        userSliders = JSON.parse(slidersParam);
      } catch (error) {
        // Invalid JSON, use empty object
      }
    }

    const validatedRequest = PreviewRequest.parse({
      packSlug,
      sliders: userSliders,
    });

    // Get pack data
    const pack = mockPackData[validatedRequest.packSlug as keyof typeof mockPackData];
    if (!pack) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'PACK_NOT_FOUND',
            message: 'Pack not found',
          },
          requestId,
        },
        { status: 404 },
      );
    }

    // Merge slider defaults with user values
    const mergedSliders = mergeSliderDefaults(pack, validatedRequest.sliders);

    // Create physics preview config
    const physicsPreview = {
      ...pack.physicsProfile,
      // Override with user slider values if they affect physics
      softBody: {
        ...pack.physicsProfile.softBody,
        // Could be affected by sliders like body mass, etc.
      },
    };

    const response = {
      ok: true,
      data: {
        pack: {
          ...pack,
          // Don't expose sensitive data in preview
          pricePetals: undefined,
          priceUsdCents: undefined,
        },
        sliders: mergedSliders,
        physicsPreview,
        previewConfig: {
          // Additional preview-specific configuration
          enablePhysics: true,
          enableCloth: pack.physicsProfile.clothSim.enable,
          enableSoftBody: pack.physicsProfile.softBody.enable,
        },
      },
      requestId,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Preview API error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: error.issues,
          },
          requestId,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Preview failed',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        requestId,
      },
      { status: 500 },
    );
  }
}
