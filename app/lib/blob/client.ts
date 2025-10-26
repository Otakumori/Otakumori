/**
 * Vercel Blob Storage Client (Server-Only)
 *
 * Handles uploading and managing assets in Vercel Blob storage.
 * Safe assets use public access (direct CDN URLs).
 * NSFW assets use private access (served through policy-checked proxy).
 */

import 'server-only';
import { env } from '@/env';

type Access = 'public' | 'private';

const RW = env.BLOB_READ_WRITE_TOKEN ?? '';
const BASE = env.BLOB_PUBLIC_BASE_URL ?? '';
const PREFIX = (env.BLOB_BUCKET_PREFIX ?? 'om').replace(/\/+$/, ''); // trim trailing /

/**
 * Normalize blob key with prefix and access level
 */
function normKey(key: string, access: Access): string {
  const k = key.replace(/^\/+/, ''); // strip leading slashes
  return `${PREFIX}/${access}/${k}`;
}

/**
 * Ensure required environment variables are set
 * @throws {Error} If required env vars are missing
 */
async function ensureEnv(): Promise<void> {
  if (!RW || !BASE) {
    const missing = [!RW && 'BLOB_READ_WRITE_TOKEN', !BASE && 'BLOB_PUBLIC_BASE_URL']
      .filter(Boolean)
      .join(', ');
    const msg =
      `Missing required env: ${missing}. ` +
      `Set them in .env.local. In Vercel: Storage → Blob → Create Token (Read-Write).`;
    throw new Error(msg);
  }
}

/**
 * Upload a file to Vercel Blob storage
 *
 * @param opts.key - Blob key (without prefix, e.g., "avatars/head_001-abc123.glb")
 * @param opts.data - File data as Buffer or Uint8Array
 * @param opts.contentType - MIME type (e.g., "model/gltf-binary")
 * @param opts.access - Access level: "public" (CDN) or "private" (proxy-only)
 * @returns Object with the blob URL (public CDN URL or internal key)
 */
export async function putBlobFile(opts: {
  key: string;
  data: Buffer | Uint8Array;
  contentType: string;
  access: Access;
}): Promise<{ url: string }> {
  await ensureEnv();
  const fullKey = normKey(opts.key, opts.access);

  // Use REST API for portability (works even if @vercel/blob not installed)
  const uploadUrl = `${BASE}`;
  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RW}`,
      'Content-Type': opts.contentType,
      'x-content-type': opts.contentType,
      'x-api-version': '7',
    },
    body: JSON.stringify({
      pathname: fullKey,
      type: opts.contentType,
      access: opts.access,
      payload: Buffer.from(opts.data).toString('base64'),
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Blob upload failed (${res.status}): ${text || res.statusText}`);
  }

  // Public objects are immediately readable via CDN; private ones are not,
  // but we still return a canonical URL (we won't expose it for private).
  const json = (await res.json()) as { url: string };
  return { url: json.url };
}

/**
 * Check if a blob exists and get its size
 *
 * @param opts.key - Blob key (without prefix)
 * @param opts.access - Access level (defaults to "public")
 * @returns Object with exists flag and size in bytes
 */
export async function headBlob(opts: {
  key: string;
  access?: Access;
}): Promise<{ exists: boolean; size: number }> {
  await ensureEnv();
  const fullKey = normKey(opts.key, opts.access ?? 'public');

  const res = await fetch(`${BASE}/${encodeURIComponent(fullKey)}`, {
    method: 'HEAD',
    headers: { Authorization: `Bearer ${RW}` },
  });

  if (res.status === 404) return { exists: false, size: 0 };
  if (!res.ok) {
    throw new Error(`Blob HEAD failed (${res.status}): ${res.statusText}`);
  }
  const size = Number(res.headers.get('content-length') ?? '0');
  return { exists: true, size: isNaN(size) ? 0 : size };
}
