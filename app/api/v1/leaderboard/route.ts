import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || 'weekly';

    // Demo leaderboard data
    const weeklyData = [
      { rank: 1, username: 'PetalMaster', score: 15420, isCurrentUser: false },
      { rank: 2, username: 'CherryBlossom', score: 12850, isCurrentUser: false },
      { rank: 3, username: 'DigitalWanderer', score: 11200, isCurrentUser: false },
      { rank: 4, username: 'AbyssExplorer', score: 9850, isCurrentUser: false },
      { rank: 5, username: 'NightOwl', score: 9200, isCurrentUser: false },
      { rank: 6, username: 'SoapstoneSage', score: 8750, isCurrentUser: false },
      { rank: 7, username: 'AchievementHunter', score: 8200, isCurrentUser: false },
      { rank: 8, username: 'RetroGamer', score: 7850, isCurrentUser: false },
      { rank: 9, username: 'MysticTraveler', score: 7400, isCurrentUser: false },
      { rank: 10, username: 'You', score: 6800, isCurrentUser: true },
    ];

    const seasonalData = [
      { rank: 1, username: 'PetalMaster', score: 125000, isCurrentUser: false },
      { rank: 2, username: 'CherryBlossom', score: 108500, isCurrentUser: false },
      { rank: 3, username: 'DigitalWanderer', score: 95000, isCurrentUser: false },
      { rank: 4, username: 'AbyssExplorer', score: 87500, isCurrentUser: false },
      { rank: 5, username: 'NightOwl', score: 82000, isCurrentUser: false },
      { rank: 6, username: 'SoapstoneSage', score: 78500, isCurrentUser: false },
      { rank: 7, username: 'AchievementHunter', score: 74000, isCurrentUser: false },
      { rank: 8, username: 'RetroGamer', score: 69500, isCurrentUser: false },
      { rank: 9, username: 'MysticTraveler', score: 65000, isCurrentUser: false },
      { rank: 10, username: 'You', score: 58000, isCurrentUser: true },
    ];

    const userRank = {
      weekly: 10,
      seasonal: 10,
      weeklyScore: 6800,
      seasonalScore: 58000,
    };

    return NextResponse.json({
      weekly: weeklyData,
      seasonal: seasonalData,
      userRank,
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
