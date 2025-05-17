'use client';

import { FriendList } from '@/app/components/FriendList';
import { Leaderboard } from '@/app/components/Leaderboard';
import { FriendActivity } from '@/app/components/FriendActivity';
import { useLeaderboardStore } from '@/lib/store/leaderboardStore';
import { AsciiArt } from '@/app/components/AsciiArt';

export default function FriendsPage() {
  const entries = useLeaderboardStore(state => state.entries);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-center gap-4">
        <AsciiArt type="cherryBlossom" className="text-4xl" />
        <h1 className="text-4xl font-bold text-pink-400">Friends & Leaderboard</h1>
        <AsciiArt type="cherryBlossom" className="text-4xl" />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div>
          <FriendList />
        </div>
        <div>
          <FriendActivity />
        </div>
        <div>
          <Leaderboard />
        </div>
      </div>
    </div>
  );
}
