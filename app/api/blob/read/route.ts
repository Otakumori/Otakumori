/**
 * Private Blob Proxy Route
 *
 * Serves NSFW assets from Vercel Blob storage with policy enforcement.
 * Safe (public) assets should be accessed directly via CDN URLs.
 * NSFW (private) assets must go through this proxy for policy checks.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { getPolicyFromRequestSync } from '@/app/lib/policy/fromRequest';
import { env } from '@/env';

export const runtime = 'nodejs';

const RW = env.BLOB_READ_WRITE_TOKEN ?? '';
const BASE = env.BLOB_PUBLIC_BASE_URL ?? '';
const PREFIX = (env.BLOB_BUCKET_PREFIX ?? 'om').replace(/\/+$/, '');

/**
 * Normalize key from query parameter
 */
function normKeyFromQuery(rawKey: string): string {
  const k = rawKey.replace(/^\/+/, '');
  if (k.startsWith(`${PREFIX}/`)) return k; // already normalized

  // Accept raw keys like "private/slot/file.ext" or "slot/file.ext"
  const hasAccess = /^public\/|^private\//.test(k);
  return `${PREFIX}/${hasAccess ? '' : 'private/'}${k}`.replace('//', '/');
}

/**
 * Lookup asset metadata from registry
 * TODO: Replace with real registry/DB lookup when Agent C integration is complete
 */
async function lookupAssetMeta(key: string): Promise<{
  nsfw: boolean;
  contentType: string;
  hashed: boolean;
}> {
  // Heuristic: treat any path containing "/private/" as NSFW
  const nsfw = /(^|\/)private(\/|$)/.test(key);

  // Derive content type from extension
  const ct = key.endsWith('.glb')
    ? 'model/gltf-binary'
    : key.endsWith('.ktx2')
      ? 'image/ktx2'
      : key.endsWith('.png')
        ? 'image/png'
        : key.endsWith('.jpg') || key.endsWith('.jpeg')
          ? 'image/jpeg'
          : key.endsWith('.svg')
            ? 'image/svg+xml'
            : 'application/octet-stream';

  // Content-addressed names get long hashes in filename
  const hashed = /-[a-f0-9]{8,}\./i.test(key);

  return { nsfw, contentType: ct, hashed };
}

/**
 * GET /api/blob/read?key=<key>
 *
 * Serves private blobs with NSFW policy enforcement.
 * Returns 403 if NSFW content is requested without proper verification.
 */
export async function GET(req: NextRequest) {
  if (!RW || !BASE) {
    return NextResponse.json(
      {
        code: 'MISSING_ENV',
        message: 'Set BLOB_READ_WRITE_TOKEN and BLOB_PUBLIC_BASE_URL in .env.local.',
      },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(req.url);
  const keyParam = searchParams.get('key');

  if (!keyParam) {
    return NextResponse.json({ code: 'BAD_REQUEST', message: 'Missing key' }, { status: 400 });
  }

  // Check policy
  const policy = getPolicyFromRequestSync(req);

  // Lookup asset metadata to confirm NSFW status
  const { nsfw, contentType, hashed } = await lookupAssetMeta(keyParam);

  if (nsfw && !policy.nsfwAllowed) {
    return NextResponse.json({ code: 'NSFW_NOT_ALLOWED' }, { status: 403 });
  }

  // Fetch blob from Vercel Blob storage
  const fullKey = normKeyFromQuery(keyParam);
  const blobUrl = `${BASE}/${encodeURIComponent(fullKey)}`;

  const blobRes = await fetch(blobUrl, {
    method: 'GET',
    headers: { Authorization: `Bearer ${RW}` },
  });

  if (blobRes.status === 404) {
    return NextResponse.json({ code: 'NOT_FOUND' }, { status: 404 });
  }
  if (!blobRes.ok) {
    return NextResponse.json({ code: 'BLOB_ERROR', status: blobRes.status }, { status: 502 });
  }

  // Stream blob bytes to client
  const bytes = blobRes.body;
  if (!bytes) {
    return NextResponse.json({ code: 'NO_CONTENT' }, { status: 500 });
  }

  const res = new NextResponse(bytes, {
    status: 200,
    headers: {
      'Content-Type': contentType || 'application/octet-stream',
      'Cache-Control': hashed ? 'public, max-age=31536000, immutable' : 'public, max-age=300',
    },
  });

  return res;
}
