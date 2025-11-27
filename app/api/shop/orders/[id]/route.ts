
// Disabled during Supabase to Prisma migration
import { NextResponse } from 'next/server';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  // Log deprecated endpoint access
  console.warn('Deprecated shop orders endpoint accessed for order:', params.id);

  return NextResponse.json(
    {
      error: 'Shop orders API temporarily unavailable during migration',
    },
    { status: 503 },
  );
}
