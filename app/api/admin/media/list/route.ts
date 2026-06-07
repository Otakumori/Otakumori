import { NextResponse } from 'next/server';
import { list } from '@vercel/blob';
import { env } from '@/env';
import { authorizeAdminApi } from '@/app/lib/auth/admin';

export const runtime = 'nodejs';

function getListOptions() {
  const token = env.BLOB_READ_WRITE_TOKEN;
  if (token) {
    return { prefix: 'media/', token } as const;
  }
  return { prefix: 'media/' } as const;
}

export async function GET() {
  const authorization = await authorizeAdminApi();
  if (!authorization.ok) return authorization.response;

  try {
    const result = await list(getListOptions());
    result.blobs.sort((a, b) => {
      const aTime = a.uploadedAt ? new Date(a.uploadedAt).getTime() : 0;
      const bTime = b.uploadedAt ? new Date(b.uploadedAt).getTime() : 0;
      return bTime - aTime;
    });
    return NextResponse.json({ ok: true, blobs: result.blobs });
  } catch (err: any) {
    const message = err?.message || 'List error';
    const code = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ ok: false, error: message }, { status: code });
  }
}
