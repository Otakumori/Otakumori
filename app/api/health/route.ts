import { NextResponse } from 'next/server';
import { env } from '@/env.mjs';

export async function GET() {
  const out: any = { time: new Date().toISOString() };

  try {
    const r = await fetch(`${env.NEXT_PUBLIC_SITE_URL || ''}/api/printify/products`, {
      cache: 'no-store',
    });
    out.printify = r.ok ? 'up' : 'down';
  } catch {
    out.printify = 'down';
  }

  out.clerk = !!env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? 'configured' : 'missing';
  out.db = !!env.DATABASE_URL ? 'configured' : 'missing';

  return NextResponse.json(out);
}
