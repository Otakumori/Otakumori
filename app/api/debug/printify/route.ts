import { type NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/app/lib/auth/admin';
import { env } from '@/env.mjs';

export const runtime = 'nodejs';

export const GET = withAdminAuth(async (_request: NextRequest) => {
  if (env.NODE_ENV !== 'development') {
    return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    message: 'Printify diagnostics are available only through server-side development tooling.',
  });
});
