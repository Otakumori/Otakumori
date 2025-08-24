import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { z } from 'zod';

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

    // TODO: Store contact message in database when model is added
    // TODO: Send email notification to admin
    // await sendContactNotification({ name, email, message, imageUrl });

    return NextResponse.json({
      data: {
        message: 'Contact message sent successfully',
        id: 'temp-' + Date.now(),
      },
    });
  } catch (error) {
    console.error('Error sending contact message:', error);
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
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // TODO: Get contact messages when model is added
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    return NextResponse.json({
      data: [],
      pagination: {
        total: 0,
        limit,
        offset,
        hasMore: false,
      },
    });
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
