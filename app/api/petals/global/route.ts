import { logger } from '@/app/lib/logger';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // TODO: GlobalPetals model doesn't exist in schema - add it or use different approach
    // For now, return inactive status
    return NextResponse.json({ active: false });
  } catch (error) {
    logger.error(
      'Error fetching global petals:',
      undefined,
      undefined,
      error instanceof Error ? error : new Error(String(error)),
    );
    return NextResponse.json({ active: false });
  }
}
