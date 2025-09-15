import { NextResponse, type NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ensureUserByClerkId } from '@/lib/petals';
import { problem } from '@/lib/http/problem';
import { logger } from '@/app/lib/logger';
import { reqId } from '@/lib/log';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const rid = reqId(req.headers);
  logger.request(req, 'GET /api/petals/wallet');
  const { userId } = await auth();
  if (!userId) return NextResponse.json(problem(401, 'Unauthorized'));
  const user = await ensureUserByClerkId(userId);
  return NextResponse.json({ balance: user.petalBalance, requestId: rid });
}
