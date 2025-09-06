// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
import { NextResponse } from 'next/server';
import { list } from '@vercel/blob';
import { auth, currentUser } from '@clerk/nextjs/server';

export const runtime = 'nodejs';

async function requireAdmin() {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');
  const user = await currentUser();
  const isAdmin = user?.publicMetadata?.role === 'admin';
  if (!isAdmin) throw new Error('Forbidden');
}

export async function GET() {
  try {
    await requireAdmin();
    const result = await list({ prefix: 'media/', token: process.env.BLOB_READ_WRITE_TOKEN });
    // Sort newest first
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
