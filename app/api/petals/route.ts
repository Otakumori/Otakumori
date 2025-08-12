import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createSupabaseWithToken } from '@/app/lib/supabaseClient';

// Rate limiting: max 5 petals per second per user
const RATE_LIMIT_PER_SECOND = 5;

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { petals_to_add = 1 } = body;

    if (typeof petals_to_add !== 'number' || petals_to_add <= 0 || petals_to_add > 10) {
      return NextResponse.json(
        { error: 'Invalid petal count (1-10 allowed)' },
        { status: 400 }
      );
    }

    // Get Clerk session token for Supabase
    const { getToken } = auth();
    const token = await getToken({
      template: 'supabase',
    });
    
    if (!token) {
      return NextResponse.json(
        { error: 'Failed to get authentication token' },
        { status: 500 }
      );
    }

    // Create Supabase client with token
    const supabase = createSupabaseWithToken(token);

    // Check rate limiting
    const { data: recentCollections } = await supabase
      .from('petal_collections')
      .select('last_collection')
      .eq('clerk_id', userId)
      .single();

    if (recentCollections?.last_collection) {
      const timeSinceLastCollection = Date.now() - new Date(recentCollections.last_collection).getTime();
      if (timeSinceLastCollection < 1000) { // Less than 1 second
        return NextResponse.json(
          { error: 'Rate limited. Please wait before collecting more petals.' },
          { status: 429 }
        );
      }
    }

    // Update petal collection using the database function
    const { data: result, error } = await supabase.rpc('update_petal_collection', {
      user_clerk_id: userId,
      petals_to_add: petals_to_add
    });

    if (error) {
      console.error('Failed to update petal collection:', error);
      return NextResponse.json(
        { error: 'Failed to collect petals' },
        { status: 500 }
      );
    }

    if (!result) {
      return NextResponse.json(
        { error: 'Rate limited. Please wait before collecting more petals.' },
        { status: 429 }
      );
    }

    // Get updated collection data
    const { data: collection } = await supabase
      .from('petal_collections')
      .select('petals_collected, total_clicks')
      .eq('clerk_id', userId)
      .single();

    // Get achievement data
    const { data: achievement } = await supabase
      .from('user_achievements')
      .select('achievement_value')
      .eq('clerk_id', userId)
      .eq('achievement_type', 'petal_collection')
      .single();

    return NextResponse.json({
      success: true,
      petals_collected: collection?.petals_collected || 0,
      total_clicks: collection?.total_clicks || 0,
      achievement_value: achievement?.achievement_value || 0,
      message: `Collected ${petals_to_add} petal(s)!`
    });

  } catch (error) {
    console.error('Petal collection API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const includeLeaderboard = searchParams.get('leaderboard') === 'true';

    // Get Clerk session token for Supabase
    const { getToken } = auth();
    const token = await getToken({ template: 'supabase' });

    if (!token) {
      return NextResponse.json(
        { error: 'Failed to get authentication token' },
        { status: 500 }
      );
    }

    // Create Supabase client with token
    const supabase = createSupabaseWithToken(token);

    // Get user's collection data
    const { data: collection, error: collectionError } = await supabase
      .from('petal_collections')
      .select('petals_collected, total_clicks, last_collection')
      .eq('clerk_id', userId)
      .single();

    if (collectionError && collectionError.code !== 'PGRST116') {
      console.error('Failed to fetch collection:', collectionError);
      return NextResponse.json(
        { error: 'Failed to fetch collection data' },
        { status: 500 }
      );
    }

    // Get user's achievements
    const { data: achievements, error: achievementsError } = await supabase
      .from('user_achievements')
      .select('achievement_type, achievement_value, last_updated')
      .eq('clerk_id', userId);

    if (achievementsError) {
      console.error('Failed to fetch achievements:', achievementsError);
    }

    let leaderboardData = null;
    if (includeLeaderboard) {
      // Get global petal collection leaderboard
      const { data: leaderboard, error: leaderboardError } = await supabase.rpc('get_game_leaderboard', {
        game_type_param: 'petal_collection',
        limit_count: 10
      });

      if (!leaderboardError) {
        leaderboardData = leaderboard;
      }
    }

    return NextResponse.json({
      collection: collection || {
        petals_collected: 0,
        total_clicks: 0,
        last_collection: null
      },
      achievements: achievements || [],
      leaderboard: leaderboardData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Petal collection GET API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
