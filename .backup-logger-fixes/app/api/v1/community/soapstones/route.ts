import { logger } from '@/app/lib/logger';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');

    // Demo soapstone data
    const demoSoapstones = [
      {
        id: '1',
        message: 'The cherry blossoms fall like digital snow. Beautiful.',
        author: 'Wanderer42',
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        glowLevel: 8,
        replies: 3,
      },
      {
        id: '2',
        message: 'Found a hidden achievement! Keep exploring, travelers.',
        author: 'AchievementHunter',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        glowLevel: 12,
        replies: 7,
      },
      {
        id: '3',
        message: 'This place reminds me of the old arcade days. Nostalgic.',
        author: 'RetroGamer',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
        glowLevel: 5,
        replies: 2,
      },
      {
        id: '4',
        message: 'The petal collection game is surprisingly addictive!',
        author: 'PetalCollector',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
        glowLevel: 15,
        replies: 9,
      },
      {
        id: '5',
        message: 'Anyone else getting Dark Souls vibes from this UI?',
        author: 'SoulsFan',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
        glowLevel: 6,
        replies: 4,
      },
    ];

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedSoapstones = demoSoapstones.slice(startIndex, endIndex);

    return NextResponse.json(paginatedSoapstones);
  } catch (error) {
    logger.error('Error fetching soapstones:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { getToken } = await auth();
    const token = await getToken({ template: 'otakumori-jwt' });

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { message } = body;

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (message.length > 280) {
      return NextResponse.json({ error: 'Message too long' }, { status: 400 });
    }

    // Create new soapstone
    const newSoapstone = {
      id: Date.now().toString(),
      message: message.trim(),
      author: 'Anonymous Traveler', // In production, get from user profile
      createdAt: new Date().toISOString(),
      glowLevel: 1,
      replies: 0,
    };

    return NextResponse.json(newSoapstone);
  } catch (error) {
    logger.error('Error creating soapstone:', error);
    return NextResponse.json({ error: 'Failed to create soapstone' }, { status: 500 });
  }
}
