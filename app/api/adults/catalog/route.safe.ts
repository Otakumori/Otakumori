import { logger } from '@/app/lib/logger';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { env } from '@/env';
import { AdultPacks, type AdultPackType } from '@/app/adults/_schema/pack.safe';

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

// Get user region from request or profile
function getUserRegion(request: NextRequest): string {
  // Try to get from request headers first (Cloudflare/Vercel provide this)
  const cfCountry = request.headers.get('cf-ipcountry');
  if (cfCountry) return cfCountry.toLowerCase();

  // Fallback to US if no region detected
  return 'us';
}

// Filter packs by region and user preferences
function filterPacks(packs: AdultPackType[], userRegion: string, gatedPrefs: any): AdultPackType[] {
  return packs.filter((pack) => {
    // Region filtering
    if (pack.regionAllowlist && pack.regionAllowlist.length > 0) {
      if (!pack.regionAllowlist.includes(userRegion)) {
        return false;
      }
    }

    // User preference filtering
    if (pack.type === 'outfit' && !gatedPrefs.allowSuggestiveOutfits) {
      return false;
    }

    // Filter out packs with suggestive physics if user doesn't want them
    if (pack.physicsProfile.softBody.enable && !gatedPrefs.allowSuggestivePhysics) {
      return false;
    }

    // Filter out packs with suggestive interactions if user doesn't want them
    if (pack.interactions.some((i) => i.gated) && !gatedPrefs.allowSuggestiveInteractions) {
      return false;
    }

    return true;
  });
}

export async function GET(request: NextRequest) {
  try {
    // Check feature flags
    if (!checkFeatureFlags()) {
      return NextResponse.json({ error: 'Feature not available' }, { status: 503 });
    }

    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check adult verification (this would need to be implemented in Clerk)
    // For now, we'll assume it's in user metadata
    // const user = await currentUser();
    // if (!user?.publicMetadata?.adultVerified) {
    //   return NextResponse.json(
    //     { error: 'Adult verification required' },
    //     { status: 403 }
    //   );
    // }

    // Fetch packs from storage index
    if (!env.ADULTS_STORAGE_INDEX_URL) {
      return NextResponse.json({ error: 'Storage not configured' }, { status: 503 });
    }

    const response = await fetch(env.ADULTS_STORAGE_INDEX_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch packs: ${response.statusText}`);
    }

    const packsData = await response.json();
    const validatedPacks = AdultPacks.parse(packsData);

    // Get user region and preferences
    const userRegion = getUserRegion(request);
    const gatedPrefs = {
      allowSuggestiveOutfits: true, // Default for now - would come from Clerk metadata
      allowSuggestivePhysics: true,
      allowSuggestiveInteractions: true,
    };

    // Filter packs based on region and preferences
    const filteredPacks = filterPacks(validatedPacks, userRegion, gatedPrefs);

    return NextResponse.json({
      ok: true,
      data: {
        packs: filteredPacks,
        total: filteredPacks.length,
        region: userRegion,
      },
      requestId: `otm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });
  } catch (error) {
    logger.error('Catalog error', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch catalog',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        requestId: `otm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      },
      { status: 500 },
    );
  }
}
