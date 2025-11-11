import { type NextRequest, NextResponse } from 'next/server';
import { getGameDef, getGameThumbnailAsset } from '@/app/lib/games';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const game = getGameDef(slug);

    if (!game) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Game not found',
        },
        { status: 404 },
      );
    }

    // Transform game to API format
    const gameData = {
      id: game.key,
      slug: game.key,
      title: game.name,
      description: game.howToPlay,
      image: getGameThumbnailAsset(game.thumbKey),
      category: game.difficulty,
      enabled: true,
      maxReward: game.maxRewardPerRun,
      difficulty: game.difficulty,
      tagline: game.tagline,
      controls: game.inputMap,
      sfx: game.sfx,
      textures: game.textures,
    };

    return NextResponse.json({
      ok: true,
      data: { game: gameData },
      source: 'games-registry',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Game detail API error:', error);

    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to fetch game',
      },
      { status: 500 },
    );
  }
}
