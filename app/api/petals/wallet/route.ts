import { NextResponse, type NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ensureUserByClerkId } from '@/lib/petals';
import { problem } from '@/lib/http/problem';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json(problem(401, 'Unauthorized'));
  const user = await ensureUserByClerkId(userId);
  return NextResponse.json({ balance: user.petalBalance });
}

