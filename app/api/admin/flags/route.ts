
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
// import { createRateLimitMiddleware } from '@/app/api/rate-limit';
import { log } from '@/lib/logger';

export const runtime = 'nodejs';
export const maxDuration = 10;

// Rate limit: 10 requests per minute for flag operations
// const rateLimitMiddleware = createRateLimitMiddleware({
//   windowMs: 60 * 1000, // 1 minute
//   maxRequests: 10,
//   keyPrefix: 'admin_flags',
// });

export async function GET(req: NextRequest) {
  // Rate limiting - temporarily disabled
  // const rateLimitResult = await rateLimitMiddleware(req);
  // if (rateLimitResult) return rateLimitResult;

  // Log request for audit purposes
  console.warn('Feature flags requested from:', req.headers.get('user-agent'));

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Check admin role in database
    // For now, allow any authenticated user (replace with proper role check)
    const isAdmin = true; // await checkAdminRole(userId);
    if (!isAdmin) {
      return NextResponse.json({ ok: false, error: 'Admin access required' }, { status: 403 });
    }

    // TODO: Load flags from database/Redis
    // For now, return default flags
    const flags = [
      {
        id: 'event_hanami',
        name: 'Hanami Event',
        description: 'Enable cherry blossom festival content',
        enabled: true,
        category: 'events',
      },
      {
        id: 'crit_rate_boost',
        name: 'Critical Rate Boost',
        description: 'Increase crit chance by 15%',
        enabled: false,
        category: 'gameplay',
      },
      {
        id: 'daily_limit_removal',
        name: 'Remove Daily Limits',
        description: 'Allow unlimited petal earning',
        enabled: false,
        category: 'economy',
      },
      {
        id: 'admin_debug_mode',
        name: 'Admin Debug Mode',
        description: 'Show debug tools',
        enabled: false,
        category: 'admin',
      },
    ];

    log('flags_loaded', { userId, count: flags.length });
    return NextResponse.json({ ok: true, flags });
  } catch (error) {
    log('flags_error', { message: String(error) });
    return NextResponse.json({ ok: false, error: 'Failed to load flags' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // Rate limiting - temporarily disabled
  // const rateLimitResult = await rateLimitMiddleware(req);
  // if (rateLimitResult) return rateLimitResult;

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Check admin role in database
    const isAdmin = true; // await checkAdminRole(userId);
    if (!isAdmin) {
      return NextResponse.json({ ok: false, error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { action, flagId } = body;

    if (action === 'toggle' && flagId) {
      // TODO: Toggle flag in database/Redis
      log('flag_toggled', { userId, flagId, action: 'toggle' });
      return NextResponse.json({ ok: true, message: 'Flag toggled' });
    } else if (action === 'reset') {
      // TODO: Reset all flags to defaults in database/Redis
      log('flags_reset', { userId });
      return NextResponse.json({ ok: true, message: 'Flags reset to defaults' });
    } else {
      return NextResponse.json({ ok: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    log('flags_error', { message: String(error) });
    return NextResponse.json({ ok: false, error: 'Failed to update flags' }, { status: 500 });
  }
}
