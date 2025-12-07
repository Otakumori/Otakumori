import { logger } from '@/app/lib/logger';
import { type NextRequest, NextResponse } from 'next/server';
import { getGameDef, getGameThumbnailAsset } from '@/app/lib/games';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    // Extract query params
    const { searchParams } = new URL(request.url);
    const includeStats = searchParams.get('includeStats') === 'true';
    const includeLeaderboard = searchParams.get('includeLeaderboard') === 'true';
    
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

    // Use includeStats and includeLeaderboard if requested
    const responseData: any = { game: gameData };
    if (includeStats) {
      // TODO: Add game stats when stats system is implemented
      responseData.stats = { plays: 0, averageScore: 0 };
    }
    if (includeLeaderboard) {
      // TODO: Add leaderboard data when leaderboard system is implemented
      responseData.leaderboard = { topScores: [] };
    }
    
    return NextResponse.json({
      ok: true,
      data: responseData,
      source: 'games-registry',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Game detail API error:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));

    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to fetch game',
      },
      { status: 500 },
    );
  }
}
