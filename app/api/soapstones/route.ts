/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const createMessageSchema = z.object({
  content: z.string().min(1).max(200),
  rotation: z.number().min(0).max(360).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { content, rotation = 0 } = createMessageSchema.parse(body);

    const message = await db.soapstoneMessage.create({
      data: {
        content,
        rotation,
        userId,
      },
    });

    return NextResponse.json({ data: message });
  } catch (error) {
    console.error('Error creating soapstone message:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const userId = searchParams.get('userId');

    const where: any = {
      isHidden: false,
      isFlagged: false,
    };

    if (userId) {
      where.userId = userId;
    }

    const messages = await db.soapstoneMessage.findMany({
      where,
      include: {
        user: {
          select: {
            username: true,
            display_name: true,
          },
        },
        likes: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });

    const total = await db.soapstoneMessage.count({ where });

    return NextResponse.json({
      data: messages,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Error fetching soapstone messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
