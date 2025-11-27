
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

const CollectPetalsSchema = z.object({
  count: z.number().min(1).max(10),
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
});

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    const body = await request.json();
    const { count, x, y } = CollectPetalsSchema.parse(body);

    // Debounce: Check if user has collected petals recently
    const recentCollection = await db.petalCollection.findFirst({
      where: {
        userId: userId || 'guest',
        createdAt: {
          gte: new Date(Date.now() - 1000), // 1 second debounce
        },
      },
    });

    if (recentCollection) {
      return NextResponse.json(
        { ok: false, error: 'Please wait before collecting more petals' },
        { status: 429 },
      );
    }

    // Create collection record
    const collection = await db.petalCollection.create({
      data: {
        userId: userId || 'guest',
        count,
        positionX: x,
        positionY: y,
        isAuthenticated: !!userId,
      },
    });

    // Update user's petal wallet if authenticated
    if (userId) {
      await db.user.upsert({
        where: { clerkId: userId },
        update: {
          petalBalance: {
            increment: count,
          },
        },
        create: {
          id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          clerkId: userId,
          email: `${userId}@temp.com`, // Required field
          username: `user_${userId.slice(0, 8)}`, // Required field
          petalBalance: count,
        },
      });
    }

    return NextResponse.json({
      ok: true,
      data: {
        collectionId: collection.id,
        count,
        totalPetals: userId
          ? await db.user
              .findUnique({
                where: { clerkId: userId },
                select: { petalBalance: true },
              })
              .then((u) => u?.petalBalance || 0)
          : null,
      },
    });
  } catch (error) {
    console.error('Petals collection failed:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: 'Invalid request data' }, { status: 400 });
    }

    return NextResponse.json({ ok: false, error: 'Failed to collect petals' }, { status: 500 });
  }
}
