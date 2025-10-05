// DEPRECATED: This component is a duplicate. Use app\sign-in\[[...sign-in]]\page.tsx instead.
'use client';

import { FriendList } from '../../components/FriendList';
import { Leaderboard } from '../../components/Leaderboard';
import { FriendActivity } from '../../components/FriendActivity';

import { useLeaderboardStore } from '@/lib/store/leaderboardStore';

export default function FriendsPage() {
  const _entries = useLeaderboardStore((state) => state.entries);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-center gap-4">
        <h1 className="text-4xl font-bold text-pink-400">
          {
            <>
              <span role="img" aria-label="emoji">
                F
              </span>
              <span role="img" aria-label="emoji">
                r
              </span>
              <span role="img" aria-label="emoji">
                i
              </span>
              <span role="img" aria-label="emoji">
                e
              </span>
              <span role="img" aria-label="emoji">
                n
              </span>
              <span role="img" aria-label="emoji">
                d
              </span>
              <span role="img" aria-label="emoji">
                s
              </span>
              ' '&' '
              <span role="img" aria-label="emoji">
                L
              </span>
              <span role="img" aria-label="emoji">
                e
              </span>
              <span role="img" aria-label="emoji">
                a
              </span>
              <span role="img" aria-label="emoji">
                d
              </span>
              <span role="img" aria-label="emoji">
                e
              </span>
              <span role="img" aria-label="emoji">
                r
              </span>
              <span role="img" aria-label="emoji">
                b
              </span>
              <span role="img" aria-label="emoji">
                o
              </span>
              <span role="img" aria-label="emoji">
                a
              </span>
              <span role="img" aria-label="emoji">
                r
              </span>
              <span role="img" aria-label="emoji">
                d
              </span>
            </>
          }
        </h1>
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
