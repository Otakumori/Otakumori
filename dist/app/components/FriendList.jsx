'use strict';
'use client';
Object.defineProperty(exports, '__esModule', { value: true });
exports.FriendList = void 0;
const friendSystemStore_1 = require('@/lib/store/friendSystemStore');
const framer_motion_1 = require('framer-motion');
const AsciiArt_1 = require('./AsciiArt');
const FriendList = () => {
  const friends = (0, friendSystemStore_1.useFriendSystemStore)(state => state.friends);
  const removeFriend = (0, friendSystemStore_1.useFriendSystemStore)(state => state.removeFriend);
  return (
    <div className="rounded-lg bg-white/10 p-6 shadow-lg backdrop-blur-lg">
      <div className="mb-6 flex items-center gap-4">
        <AsciiArt_1.AsciiArt type="friend" className="text-2xl" />
        <h2 className="text-2xl font-bold text-pink-400">Friends</h2>
      </div>
      <div className="space-y-4">
        {friends.map(friend => (
          <framer_motion_1.motion.div
            key={friend.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between rounded-lg bg-white/5 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-400">
                <span className="font-bold text-white">{friend.username[0]}</span>
              </div>
              <div>
                <h3 className="font-semibold text-pink-400">{friend.username}</h3>
                <p className="text-sm text-gray-400">Level {friend.level}</p>
              </div>
            </div>
            <button
              onClick={() => removeFriend(friend.id)}
              className="text-red-400 transition-colors hover:text-red-300"
            >
              Remove
            </button>
          </framer_motion_1.motion.div>
        ))}
        {friends.length === 0 && <p className="text-center text-gray-400">No friends yet</p>}
      </div>
    </div>
  );
};
exports.FriendList = FriendList;
