
import { logger } from '@/app/lib/logger';
import { type NextRequest, NextResponse } from 'next/server';
import { authorizeAdminApi } from '@/app/lib/auth/admin';
// import { redis } from '../../../lib/redis';
// TODO: Replace with HTTP-based Redis client if needed

const _MAINTENANCE_KEY = 'site:maintenance';

export async function GET(request: NextRequest) {
  const authorization = await authorizeAdminApi(request, 'internal_service');
  if (!authorization.ok) return authorization.response;

  try {
    // Get current maintenance status
    // TODO: Integrate HTTP-based Redis client to get maintenance mode
    const maintenance = null;
    const isMaintenance = maintenance === 'true';

    return NextResponse.json({
      maintenance: isMaintenance,
      message: isMaintenance ? 'Maintenance mode is active' : 'Site is operational',
    });
  } catch (error) {
    logger.error('Maintenance error', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authorization = await authorizeAdminApi(request, 'internal_service');
  if (!authorization.ok) return authorization.response;

  try {
    const { maintenance } = await request.json();

    if (typeof maintenance !== 'boolean') {
      return NextResponse.json({ error: 'Invalid maintenance status' }, { status: 400 });
    }

    // Set maintenance status
    if (maintenance) {
      // TODO: Integrate HTTP-based Redis client to set maintenance mode
    } else {
      // TODO: Integrate HTTP-based Redis client to delete maintenance mode
    }

    return NextResponse.json({
      maintenance,
      message: maintenance ? 'Maintenance mode enabled' : 'Maintenance mode disabled',
    });
  } catch (error) {
    logger.error('Maintenance error', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
