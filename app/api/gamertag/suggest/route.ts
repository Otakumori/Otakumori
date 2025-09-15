import { NextResponse } from 'next/server';
import { generateBest } from '@/app/lib/gamertag/grammar';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const maxLen = Number(searchParams.get('maxLen') ?? 16);
  const sep = (searchParams.get('sep') ?? '-') as any;
  const numbers = (searchParams.get('numbers') ?? 'suffix') as any;

  const name = generateBest({ maxLen, separator: sep, numbers });

  return NextResponse.json({ name });
}
