import { rateLimit } from '@/app/api/rate-limit';
import { logger } from '@/app/lib/logger';
import { prisma } from '@/app/lib/prisma';
import { normalizeCode } from '@/lib/coupons/engine';
import { problem } from '@/lib/http/problem';
import { auth } from '@clerk/nextjs/server';
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';

export const runtime = 'nodejs';

const Body = z.object({
  codes: z.array(z.string()).min(1),
  clientReferenceId: z.string().min(3), // e.g., cartId or idempotency key
});

export async function POST(req: NextRequest) {
  const rl = await rateLimit(req, {
    windowMs: 60_000,
    maxRequests: 20,
    keyPrefix: 'coupons:attach',
  });
  if (rl.limited) return NextResponse.json({ ok: false, error: 'Rate limited' }, { status: 429 });

  logger.request(req, 'POST /api/coupons/attach');
  try {
    const { userId } = await auth();
    logger.warn(`Attaching coupon to user: ${userId}`);
    const body = await req.json().catch(() => null);
    const parsed = Body.safeParse(body);
    if (!parsed.success) return NextResponse.json(problem(400, 'Bad input'), { status: 400 });
    const { codes, clientReferenceId } = parsed.data;

    const norm = codes.map(normalizeCode);
    const coupons = await prisma.coupon.findMany({
      where: { code: { in: norm } },
      select: { id: true, code: true },
    });
    const map = new Map(coupons.map((c) => [c.code, c.id] as const));

    const results: { code: string; attached: boolean }[] = [];
    for (const code of norm) {
      const cid = map.get(code);
      if (!cid) {
        results.push({ code, attached: false });
        continue;
      }
      try {
        await prisma.couponRedemption.upsert({
          where: { couponId_clientReferenceId: { couponId: cid, clientReferenceId } },
          update: { status: 'PENDING' },
          create: { couponId: cid, clientReferenceId, status: 'PENDING' },
        });
        results.push({ code, attached: true });
      } catch {
        results.push({ code, attached: false });
      }
    }

    return NextResponse.json({ ok: true, data: { results } });
  } catch (e: any) {
    logger.error(
      'coupons_attach_error',
      { route: '/api/coupons/attach' },
      { error: String(e?.message || e) },
    );
    return NextResponse.json(problem(500, 'attach_failed', e?.message), { status: 500 });
  }
}
