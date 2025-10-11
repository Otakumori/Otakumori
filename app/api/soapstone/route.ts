import { NextResponse, type NextRequest } from 'next/server';
import { requireUserId } from '@/app/lib/auth';
import { rateLimit } from '@/app/api/rate-limit';
import { sanitizeSoapstone } from '@/lib/sanitize';
import { problem } from '@/lib/http/problem';

async function getDb() {
  const { PrismaClient } = await import('@prisma/client');
  return new PrismaClient();
}

async function getLogger() {
  const { logger } = await import('@/app/lib/logger');
  return logger;
}

export async function GET(req: Request) {
  const logger = await getLogger();
  logger.request(req, 'GET /api/soapstone');
  const { searchParams } = new URL(req.url);
  const take = Math.min(20, Number(searchParams.get('take') ?? 10));
  const skip = Math.max(0, Number(searchParams.get('skip') ?? 0));
  const db = await getDb();
  const items = await db.soapstone.findMany({
    orderBy: [{ score: 'desc' }, { createdAt: 'desc' }],
    take,
    skip,
  });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const logger = await getLogger();
  logger.request(req, 'POST /api/soapstone');

  // Allow anonymous soapstone posting - get userId if available, otherwise use 'anonymous'
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    // Anonymous user - use IP-based identifier for rate limiting
    userId =
      'anonymous_' +
      (req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown');
  }

  const rl = await rateLimit(
    req,
    { windowMs: 30_000, maxRequests: 6, keyPrefix: 'soapstone:post' },
    userId,
  );
  if (rl.limited) return NextResponse.json(problem(429, 'Rate limit exceeded'), { status: 429 });

  try {
    const body = (await req.json().catch(() => null)) as any;
    const raw = typeof body?.text === 'string' ? body.text : '';
    let text = sanitizeSoapstone(raw);
    if (!text || text.length > 140) return NextResponse.json(problem(400, 'Invalid text'));

    const db = await getDb();
    const created = await db.soapstone.create({ data: { userId, text, score: 0 } });
    return NextResponse.json({ ok: true, id: created.id });
  } catch (e: any) {
    const logger = await getLogger();
    logger.error(
      'soapstone_post_error',
      { route: '/api/soapstone', userId },
      { error: String(e?.message || e) },
    );
    return NextResponse.json(problem(500, 'Failed to create message'), { status: 500 });
  }
}
