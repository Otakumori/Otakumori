import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireAdmin } from '@/app/lib/authz';
import { logger, type LogCtx } from '@/app/lib/logger';
import { reqId } from '@/lib/log';
import { problem } from '@/lib/http/problem';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const rid = reqId(req.headers);
  logger.request(req, 'GET /api/admin/site-config');
  await requireAdmin();
  const cfg = await prisma.siteConfig.findUnique({ where: { id: 'singleton' } });
  return NextResponse.json({ ok: true, data: cfg, requestId: rid });
}

export async function POST(req: NextRequest) {
  const rid = reqId(req.headers);
  logger.request(req, 'POST /api/admin/site-config');
  const admin = await requireAdmin();
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body || typeof body !== 'object') {
    return NextResponse.json(problem(400, 'Bad input'));
  }

  try {
    const updates: Record<string, unknown> = {};
    if (body.theme) updates.theme = body.theme;
    if (body.seasonal) updates.seasonal = body.seasonal;

    const cfg = await prisma.siteConfig.upsert({
      where: { id: 'singleton' },
      create: { id: 'singleton', updatedBy: admin.id, ...updates },
      update: { updatedBy: admin.id, ...updates },
    });

    return NextResponse.json({ ok: true, data: cfg, requestId: rid });
  } catch (error) {
    const ctx: LogCtx = rid ? { requestId: rid } : {};
    logger.error('site_config_update_error', ctx, {
      error: String(error instanceof Error ? error.message : error),
    });
    return NextResponse.json(
      problem(500, 'update_failed', error instanceof Error ? error.message : undefined),
      {
        status: 500,
      },
    );
  }
}
