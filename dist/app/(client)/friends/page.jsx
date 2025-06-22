'use strict';
'use client';
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = FriendsPage;
const FriendList_1 = require('@/app/components/FriendList');
const Leaderboard_1 = require('@/app/components/Leaderboard');
const FriendActivity_1 = require('@/app/components/FriendActivity');
const leaderboardStore_1 = require('@/lib/store/leaderboardStore');
const AsciiArt_1 = require('@/app/components/AsciiArt');
function FriendsPage() {
  const entries = (0, leaderboardStore_1.useLeaderboardStore)(state => state.entries);
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-center gap-4">
        <AsciiArt_1.AsciiArt type="cherryBlossom" className="text-4xl" />
        <h1 className="text-4xl font-bold text-pink-400">Friends & Leaderboard</h1>
        <AsciiArt_1.AsciiArt type="cherryBlossom" className="text-4xl" />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div>
          <FriendList_1.FriendList />
        </div>
        <div>
          <FriendActivity_1.FriendActivity />
        </div>
        <div>
          <Leaderboard_1.Leaderboard />
        </div>
      </div>
    </div>
  );
}
