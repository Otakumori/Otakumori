/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
// Disabled during Supabase to Prisma migration
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  return NextResponse.json(
    {
      error: 'Shop orders API temporarily unavailable during migration',
    },
    { status: 503 },
  );
}
