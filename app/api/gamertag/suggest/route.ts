import { NextResponse } from 'next/server';
import { generateMany } from '@/app/lib/gamertag/grammar';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const maxLen = Math.min(24, Math.max(6, Number(searchParams.get('maxLen') ?? 16)));
  const sep = (searchParams.get('sep') ?? '-') as '-' | '_' | '' | ' ';
  const numbers = (searchParams.get('numbers') ?? 'suffix') as 'none' | 'suffix' | 'random';
  const count = Math.min(6, Math.max(1, Number(searchParams.get('count') ?? 4)));
  const seedParam = searchParams.get('seed');
  const seed = seedParam ? Number(seedParam) : undefined;

  const suggestions = generateMany({ maxLen, separator: sep, numbers, seed }, count);

  return NextResponse.json({
    name: suggestions[0] ?? 'MoriWanderer',
    suggestions,
  });
}
