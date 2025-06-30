import { NextRequest, NextResponse } from 'next/server';
// import { redis } from '../../../lib/redis';
// TODO: Replace with HTTP-based Redis client if needed

const MAINTENANCE_KEY = 'site:maintenance';

export async function GET(request: NextRequest) {
  try {
    // Verify API key
    const apiKey = request.headers.get('x-api-key');
    if (apiKey !== process.env.API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current maintenance status
    // TODO: Integrate HTTP-based Redis client to get maintenance mode
    const maintenance = null;
    const isMaintenance = maintenance === 'true';

    return NextResponse.json({
      maintenance: isMaintenance,
      message: isMaintenance ? 'Maintenance mode is active' : 'Site is operational',
    });
  } catch (error) {
    console.error('Maintenance status check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify API key
    const apiKey = request.headers.get('x-api-key');
    if (apiKey !== process.env.API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
    console.error('Maintenance toggle error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
