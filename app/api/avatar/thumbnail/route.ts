/**
 * Avatar Thumbnail API
 * Generates deterministic SVG thumbnails with NSFW policy enforcement
 */

import { type NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { resolvePolicy, validateAvatar } from '@om/avatar';
import type { AvatarSpecV15Type } from '@om/avatar';
import { assertRenderable } from '@/lib/avatar/validate';
import { db } from '@/lib/db';
import { generateRequestId } from '@/lib/request-id';

export const runtime = 'nodejs';

/**
 * Simple hash function for deterministic cache keys
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Generates a deterministic SVG thumbnail from resolved equipment
 */
function generateSVGThumbnail(spec: AvatarSpecV15Type, resolvedIds: string[]): string {
  const { primary, secondary, accent } = spec.palette;
  const hash = simpleHash(spec.baseMeshUrl + resolvedIds.join(',') + primary);

  // Simple geometric representation
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad-${hash}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${primary};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${secondary};stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="200" height="200" fill="url(#grad-${hash})" />
  
  <!-- Avatar silhouette -->
  <circle cx="100" cy="70" r="35" fill="${accent || secondary}" opacity="0.8" />
  <ellipse cx="100" cy="140" rx="50" ry="60" fill="${accent || secondary}" opacity="0.8" />
  
  <!-- Equipment indicators -->
  ${resolvedIds
    .slice(0, 3)
    .map(
      (id, i) => `
  <circle cx="${60 + i * 40}" cy="180" r="8" fill="${primary}" opacity="0.6">
    <title>${id}</title>
  </circle>`,
    )
    .join('')}
  
  <!-- Hash identifier (hidden but affects cache) -->
  <text x="100" y="195" font-size="8" text-anchor="middle" fill="${primary}" opacity="0.3">${hash}</text>
</svg>`;

  return svg;
}

/**
 * POST /api/avatar/thumbnail
 * Accepts avatar spec and generates thumbnail
 */
export async function POST(request: NextRequest) {
  const requestId = generateRequestId();

  try {
    const body = await request.json();

    // Validate spec
    if (!validateAvatar(body)) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Invalid avatar specification',
          requestId,
        },
        { status: 400 },
      );
    }

    const spec = body as AvatarSpecV15Type;

    // Get NSFW policy
    const { userId } = await auth();
    const user = userId ? await currentUser() : null;
    const adultVerified = user?.publicMetadata?.adultVerified === true;
    const nsfwCookie = request.cookies.get('nsfw-preference')?.value;

    const policy = resolvePolicy({
      cookieValue: nsfwCookie,
      adultVerified,
    });

    // Resolve equipment
    const { resolved } = await assertRenderable(spec, policy);

    // Extract resolved IDs for hash
    const resolvedIds = Object.values(resolved)
      .filter((r) => r !== null)
      .map((r) => r!.id);

    // Generate SVG
    const svg = generateSVGThumbnail(spec, resolvedIds);

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'x-otm-request-id': requestId,
      },
    });
  } catch (error) {
    console.error('Thumbnail generation error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to generate thumbnail',
        requestId,
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/avatar/thumbnail?avatarId=xxx
 * Generates thumbnail from stored avatar config
 */
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();

  try {
    const { searchParams } = new URL(request.url);
    const avatarId = searchParams.get('avatarId');

    if (!avatarId) {
      return NextResponse.json(
        {
          ok: false,
          error: 'avatarId parameter required',
          requestId,
        },
        { status: 400 },
      );
    }

    // Fetch user's avatar config
    const user = await db.user.findUnique({
      where: { id: avatarId },
      select: {
        avatarConfig: true,
      },
    });

    if (!user || !user.avatarConfig) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Avatar not found',
          requestId,
        },
        { status: 404 },
      );
    }

    // Validate stored config
    if (!validateAvatar(user.avatarConfig)) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Stored avatar configuration is invalid',
          requestId,
        },
        { status: 500 },
      );
    }

    const spec = user.avatarConfig as AvatarSpecV15Type;

    // Get NSFW policy
    const { userId } = await auth();
    const currentUserData = userId ? await currentUser() : null;
    const adultVerified = currentUserData?.publicMetadata?.adultVerified === true;
    const nsfwCookie = request.cookies.get('nsfw-preference')?.value;

    const policy = resolvePolicy({
      cookieValue: nsfwCookie,
      adultVerified,
    });

    // Resolve equipment
    const { resolved } = await assertRenderable(spec, policy);

    // Extract resolved IDs for hash
    const resolvedIds = Object.values(resolved)
      .filter((r) => r !== null)
      .map((r) => r!.id);

    // Generate SVG
    const svg = generateSVGThumbnail(spec, resolvedIds);

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'x-otm-request-id': requestId,
      },
    });
  } catch (error) {
    console.error('Thumbnail generation error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to generate thumbnail',
        requestId,
      },
      { status: 500 },
    );
  }
}
