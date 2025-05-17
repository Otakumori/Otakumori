import { useFriendSystemStore, Friend } from '@/lib/store/friendSystemStore';
import { motion } from 'framer-motion';
import { AsciiArt } from './AsciiArt';

export const FriendList = () => {
  const friends = useFriendSystemStore(state => state.friends);
  const removeFriend = useFriendSystemStore(state => state.removeFriend);

  return (
    <div className="rounded-lg bg-white/10 p-6 shadow-lg backdrop-blur-lg">
      <div className="mb-6 flex items-center gap-4">
        <AsciiArt type="friend" className="text-2xl" />
        <h2 className="text-2xl font-bold text-pink-400">Friends</h2>
      </div>
      <div className="space-y-4">
        {friends.map((friend: Friend) => (
          <motion.div
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
          </motion.div>
        ))}
        {friends.length === 0 && <p className="text-center text-gray-400">No friends yet</p>}
      </div>
    </div>
  );
};
