
import { logger } from '@/app/lib/logger';
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';

async function getDb() {
  const { db } = await import('@/lib/db');
  return db;
}

const contactSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  message: z.string().min(1).max(1000),
  imageUrl: z.string().url().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const body = await request.json();
    const { name, email, message, imageUrl } = contactSchema.parse(body);

    // Store contact message in database
    const db = await getDb();
    const contactMessage = await db.contactMessage.create({
      data: {
        name,
        email,
        message,
        imageUrl: imageUrl ?? null,
        userId: userId || null,
      },
    });

    return NextResponse.json({
      data: {
        message: 'Contact message sent successfully',
        id: contactMessage.id,
      },
    });
  } catch (error) {
    logger.error(
      'Error sending contact message:',
      undefined,
      undefined,
      error instanceof Error ? error : new Error(String(error)),
    );
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin (you can implement your own admin check)
    const db = await getDb();
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get contact messages from database
    const [messages, total] = await Promise.all([
      db.contactMessage.findMany({
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: {
          User: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
      }),
      db.contactMessage.count(),
    ]);

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
    logger.error(
      'Error fetching contact messages:',
      undefined,
      undefined,
      error instanceof Error ? error : new Error(String(error)),
    );
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
