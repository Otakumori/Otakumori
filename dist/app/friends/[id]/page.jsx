'use strict';
'use client';
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = FriendProfilePage;
const navigation_1 = require('next/navigation');
const framer_motion_1 = require('framer-motion');
const FriendChat_1 = require('@/components/FriendChat');
const friendStore_1 = require('@/lib/store/friendStore');
const leaderboardStore_1 = require('@/lib/store/leaderboardStore');
function FriendProfilePage() {
  const params = (0, navigation_1.useParams)();
  const friendId = params?.id;
  const { friends } = (0, friendStore_1.useFriendStore)();
  const { entries } = (0, leaderboardStore_1.useLeaderboardStore)();
  const friend = friends.find(f => f.id === friendId);
  const friendEntries = Object.entries(
    entries.reduce((acc, entry) => {
      if (!acc[entry.game]) {
        acc[entry.game] = [];
      }
      acc[entry.game].push(entry);
      return acc;
    }, {})
  )
    .flatMap(([game, gameEntries]) =>
      gameEntries.filter(entry => entry.id === friendId).map(entry => ({ ...entry, game }))
    )
    .sort((a, b) => b.timestamp - a.timestamp);
  if (!friend) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-center text-4xl font-bold text-white">Friend Not Found</h1>
      </div>
    );
  }
  return (
    <div className="container mx-auto px-4 py-8">
      <framer_motion_1.motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-4xl"
      >
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Friend Profile */}
          <div className="rounded-lg bg-white/10 p-6 shadow-lg backdrop-blur-lg">
            <div className="mb-6 flex items-center space-x-4">
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-pink-500 text-2xl text-white">
                  {friend.username[0].toUpperCase()}
                </div>
                <div
                  className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white ${
                    friend.status === 'online'
                      ? 'bg-green-500'
                      : friend.status === 'away'
                        ? 'bg-yellow-500'
                        : 'bg-gray-500'
                  }`}
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{friend.username}</h1>
                <p className="text-white/50">{friend.status}</p>
                {friend.lastSeen && (
                  <p className="text-sm text-white/50">
                    Last seen: {new Date(friend.lastSeen).toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            {/* Game Stats */}
            <div className="space-y-4">
              <h2 className="mb-4 text-xl font-semibold text-white">Game Stats</h2>
              {friendEntries.map(entry => (
                <framer_motion_1.motion.div
                  key={`${entry.game}-${entry.timestamp}`}
                  className="rounded-lg bg-white/5 p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-white">{entry.game}</span>
                    <span className="font-bold text-pink-400">{entry.score}</span>
                  </div>
                  <p className="text-sm text-white/50">
                    {new Date(entry.timestamp).toLocaleString()}
                  </p>
                </framer_motion_1.motion.div>
              ))}
            </div>
          </div>

          {/* Chat Section */}
          <div>
            <FriendChat_1.FriendChat friendId={friend.id} />
          </div>
        </div>
      </framer_motion_1.motion.div>
    </div>
  );
}
