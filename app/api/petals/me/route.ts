import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';

const db = new PrismaClient();

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ total: 0 });

  try {
    const row = await db.petalWallet.findUnique({ where: { userId } });
    return NextResponse.json({ total: row?.balance ?? 0 });
  } catch (error) {
    console.error('Error fetching user petals:', error);
    return NextResponse.json({ total: 0 });
  }
}

export async function POST() {
  const { userId } = await auth();
  if (!userId) return new NextResponse('Unauthorized', { status: 401 });

  try {
    const row = await db.petalWallet.upsert({
      where: { userId },
      update: { balance: { increment: 1 } },
      create: { User: { connect: { id: userId } }, balance: 1 },
    });

    // Note: globalPetals model doesn't exist in schema, commenting out
    // const global = await db.globalPetals.findUnique({ where: { id: 'current' } });
    // if (global?.active) {
    //   await db.globalPetals.update({
    //     where: { id: 'current' },
    //     data: { total: { increment: 1 } },
    //   });
    // }

    return NextResponse.json({ total: row.balance });
  } catch (error) {
    console.error('Error incrementing user petals:', error);
    return NextResponse.json({ error: 'Failed to increment petals' }, { status: 500 });
  }
}
