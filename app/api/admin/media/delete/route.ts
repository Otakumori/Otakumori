import { NextResponse } from 'next/server';
import { del } from '@vercel/blob';
import { env } from '@/env';
import { authorizeAdminApi } from '@/app/lib/auth/admin';

export const runtime = 'nodejs';

function ensureBlobToken(): string {
  const token = env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error('Missing BLOB_READ_WRITE_TOKEN');
  }
  return token;
}

export async function POST(req: Request) {
  const authorization = await authorizeAdminApi(req);
  if (!authorization.ok) return authorization.response;

  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ ok: false, error: 'Missing url' }, { status: 400 });

    const token = ensureBlobToken();
    await del(url, { token });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    const message = err?.message || 'Delete error';
    const code = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ ok: false, error: message }, { status: code });
  }
}
