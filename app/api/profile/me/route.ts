 
 
export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ ok: false, error: 'auth' }, { status: 401 });

  const u = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!u) return NextResponse.json({ ok: false, error: 'no_user' }, { status: 404 });

  // Your posts (Soapstones) + counts
  const posts = await prisma.soapstoneMessage.findMany({
    where: { userId: u.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: {
      id: true,
      content: true,
      createdAt: true,
      upvotes: true,
      isHidden: true,
      isFlagged: true,
    },
  });

  // Owned cosmetics (for badges/titles we infer from SKU)
  const inv = await prisma.inventoryItem.findMany({
    where: { userId: u.id },
    orderBy: { acquiredAt: 'desc' },
  });

  // Achievements
  const ach = await prisma.userAchievement.findMany({
    where: { userId: u.id },
    orderBy: { createdAt: 'desc' },
    include: { achievement: true },
  });

  // simple counts
  const balances = { petals: u.petalBalance, runes: u.runes, level: 1, xp: 0 };
  const daily = {
    used: u.dailyClicks,
    limit: Number(process.env.NEXT_PUBLIC_DAILY_PETAL_LIMIT ?? 500),
  };

  // Titles/badges derivation
  const titles = inv.filter((x) => x.sku.startsWith('title.')).map((x) => x.sku);
  const badges = inv.filter((x) => x.sku.startsWith('badge.')).map((x) => x.sku);

  return NextResponse.json({
    ok: true,
    profile: {
      displayName: u.display_name ?? 'You',
      activeCosmetic: u.activeCosmetic ?? null,
      activeOverlay: u.activeOverlay ?? null,
    },
    balances,
    daily,
    posts,
    badges,
    titles,
    achievements: ach.map((a) => ({
      code: a.achievement.code,
      name: a.achievement.name,
      desc: a.achievement.description,
      when: a.createdAt,
    })),
  });
}
