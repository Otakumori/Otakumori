
// Disabled during Supabase to Prisma migration
import { logger } from '@/app/lib/logger';
import { NextResponse } from 'next/server';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  // Log deprecated endpoint access
  logger.warn('Deprecated shop orders endpoint accessed for order:', undefined, {
    orderId: params.id,
  });

  return NextResponse.json(
    {
      error: 'Shop orders API temporarily unavailable during migration',
    },
    { status: 503 },
  );
}
