import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '6');

    // Demo games data
    const games = [
      {
        id: '1',
        slug: 'petal-collection',
        title: 'Petal Collection',
        summary: 'Collect falling cherry blossom petals in this relaxing mini-game.',
      },
      {
        id: '2',
        slug: 'memory-match',
        title: 'Anime Memory Match',
        summary: 'Test your memory with beautiful anime character cards.',
      },
      {
        id: '3',
        slug: 'rhythm-beat',
        title: 'Rhythm Beat',
        summary: 'Feel the beat with our rhythm-based mini-game.',
      },
      {
        id: '4',
        slug: 'samurai-slice',
        title: 'Samurai Petal Slice',
        summary: 'Slice through falling petals with precision and speed.',
      },
      {
        id: '5',
        slug: 'bubble-pop',
        title: 'Bubble Pop Gacha',
        summary: 'Pop bubbles to reveal hidden treasures and rewards.',
      },
      {
        id: '6',
        slug: '404',
        title: '404 Adventure',
        summary: 'A special mini-game for when you get lost in the digital abyss.',
      },
    ];

    const limitedGames = games.slice(0, limit);

    return NextResponse.json(limitedGames);
  } catch (error) {
    console.error('Error fetching games:', error);
    return NextResponse.json([], { status: 500 });
  }
}
