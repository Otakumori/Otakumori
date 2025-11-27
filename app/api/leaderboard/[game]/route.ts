
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

type LeaderboardScore = {
  id: string;
  userId: string;
  game: string;
  diff: string | null;
  score: number;
  statsJson: any;
  createdAt: Date;
  updatedAt: Date;
};

export async function GET(req: Request, { params }: { params: { game: string } }) {
  const url = new URL(req.url);
  const diff = url.searchParams.get('diff');
  const n = Math.min(50, Math.max(5, Number(url.searchParams.get('n') ?? 25)));

  const rows = await prisma.leaderboardScore.findMany({
    where: { game: params.game, ...(diff ? { diff } : {}) },
    orderBy: [{ score: 'desc' }, { updatedAt: 'asc' }],
    take: n,
  });

  return NextResponse.json({
    ok: true,
    game: params.game,
    diff: diff || null,
    top: rows.map((r: LeaderboardScore) => ({
      userId: r.userId,
      score: r.score,
      diff: r.diff,
      when: r.updatedAt,
    })),
  });
}
