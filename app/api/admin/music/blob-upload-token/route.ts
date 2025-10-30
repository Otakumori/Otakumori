import { NextResponse } from 'next/server';
import { requireAdmin } from '@/app/lib/authz';
import { put } from '@vercel/blob';
import { env } from '@/env';

export const runtime = 'nodejs';

function ensureBlobToken(): string {
  const token = env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error('Missing BLOB_READ_WRITE_TOKEN');
  }
  return token;
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch (error) {
    console.error('Admin auth failed for blob upload token:', error);
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const { filename, contentType } = await req.json();
  if (!filename || !contentType) {
    return NextResponse.json({ ok: false, error: 'Missing fields' }, { status: 400 });
  }

  const token = ensureBlobToken();
  const res = await put(filename, new Blob([], { type: contentType }), {
    access: 'public',
    addRandomSuffix: true,
    token,
  });

  return NextResponse.json({ ok: true, url: res.url });
}
