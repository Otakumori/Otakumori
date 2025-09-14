import { NextResponse, type NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { startSessionReq } from '@/lib/schemas/minigames';
import { problem } from '@/lib/http/problem';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json(problem(401, 'Unauthorized'));

  const body = await req.json().catch(() => null);
  const parsed = startSessionReq.safeParse(body);
  if (!parsed.success) return NextResponse.json(problem(400, 'Invalid request'));

  // For now, return a generated run id; persistence can be added via GameRun if needed
  const runId = `run_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  const startedAt = new Date().toISOString();
  return NextResponse.json({ runId, startedAt });
}

