
import { NextResponse } from 'next/server';
import { requireUserId } from '@/app/lib/auth';
import { petalService } from '@/app/lib/petals';
import { z } from 'zod';

export const runtime = 'nodejs';
export const maxDuration = 10;

const Q = z.object({
  limit: z.string().optional(),
  cursor: z.string().nullable().optional(),
  type: z.enum(['ALL', 'EARN', 'SPEND', 'ADJUST']).optional(),
});

export async function GET(req: Request) {
  try {
    const userId = await requireUserId();
    const url = new URL(req.url);
    const parsed = Q.parse({
      limit: url.searchParams.get('limit') ?? undefined,
      cursor: url.searchParams.get('cursor'),
      type: url.searchParams.get('type') ?? 'ALL',
    });

    const page = parsed.cursor
      ? Math.floor(Number(parsed.cursor) / (parsed.limit ? Number(parsed.limit) : 25)) + 1
      : 1;
    const limit = parsed.limit ? Number(parsed.limit) : 25;

    const result = await petalService.getUserPetalHistory(userId, page, limit);

    if (!result.success) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      items: result.data?.transactions || [],
      nextCursor:
        result.data && result.data.transactions.length === limit ? (page * limit).toString() : null,
    });
  } catch (e: any) {
    const status = e?.status ?? 400;
    return NextResponse.json({ ok: false, error: String(e.message ?? e) }, { status });
  }
}
