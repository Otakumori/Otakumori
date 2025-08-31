/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable-line @next/next/no-img-element */
import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { auth } from '@clerk/nextjs/server';

export const runtime = 'nodejs';

const MAX_BYTES = 3 * 1024 * 1024; // 3MB
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp']);

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get('file') as File | null;
  if (!file) return NextResponse.json({ ok: false, error: 'No file' }, { status: 400 });

  // Validate
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ ok: false, error: 'Invalid file type' }, { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ ok: false, error: 'File too large' }, { status: 413 });
  }

  const safeName = file.name.replace(/[^\w.\-]+/g, '_');
  const key = `reviews/${userId}/${Date.now()}-${safeName}`;

  const { url } = await put(key, file, {
    access: 'public',
    contentType: file.type,
    addRandomSuffix: true,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  return NextResponse.json({ ok: true, url });
}
