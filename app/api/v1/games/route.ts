import { type NextRequest, NextResponse } from 'next/server';
import { getEnabledGames, getGameThumbnailAsset } from '@/app/lib/games';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.warn('Games list requested from:', request.headers.get('user-agent'));
    // Get enabled games from the games registry
    const enabledGames = getEnabledGames();

    // Transform games to API format
    const games = enabledGames.map((game) => ({
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
    }));

    return NextResponse.json({
      ok: true,
      data: { games },
      source: 'games-registry',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Games API error:', error);

    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to fetch games',
        data: { games: [] },
      },
      { status: 500 },
    );
  }
}
