// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/app/lib/authz';
import { put } from '@vercel/blob';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    // admin is { id: string } on success
  } catch (error) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const { filename, contentType } = await req.json();
  if (!filename || !contentType) {
    return NextResponse.json({ ok: false, error: 'Missing fields' }, { status: 400 });
  }

  // You can also use the Vercel Blob "browser upload" pattern.
  // Here we accept a raw file in a follow-up call; this route can also mint an upload URL.
  const res = await put(filename, new Blob([], { type: contentType }), {
    access: 'public',
    addRandomSuffix: true,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  return NextResponse.json({ ok: true, url: res.url });
}
