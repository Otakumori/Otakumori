 
 
'use client';
import React, { useState, useEffect } from 'react';
import { useFriendSystemStore, type Friend } from '@/lib/store/friendSystemStore';
import { motion, AnimatePresence } from 'framer-motion';


interface FriendRequest {
  id: string;
  fromUser: Friend;
  status: 'pending' | 'accepted' | 'declined';
  timestamp: string;
}

export const FriendList: React.FC = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading friends data
    const loadFriends = async () => {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockFriends: Friend[] = [
        { id: '1', username: 'AnimeFan123', status: 'online', lastSeen: new Date().toISOString() },
        {
          id: '2',
          username: 'OtakuMaster',
          status: 'away',
          lastSeen: new Date(Date.now() - 300000).toISOString(),
        },
        {
          id: '3',
          username: 'WeebLife',
          status: 'offline',
          lastSeen: new Date(Date.now() - 3600000).toISOString(),
        },
      ];

      const mockRequests: FriendRequest[] = [
        {
          id: '1',
          fromUser: { id: '4', username: 'NewFriend', status: 'online' },
          status: 'pending',
          timestamp: new Date().toISOString(),
        },
      ];

      setTimeout(() => {
        setFriends(mockFriends);
        setFriendRequests(mockRequests);
        setLoading(false);
      }, 1000);
    };

    loadFriends();
  }, []);

  const handleAcceptRequest = (requestId: string) => {
    setFriendRequests((prev) => prev.filter((req) => req.id !== requestId));
    // Add to friends list
    const request = friendRequests.find((req) => req.id === requestId);
    if (request) {
      setFriends((prev) => [...prev, request.fromUser]);
    }
  };

  const handleDeclineRequest = (requestId: string) => {
    setFriendRequests((prev) => prev.filter((req) => req.id !== requestId));
  };

  const filteredFriends = friends.filter((friend) =>
    friend.username.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="mb-4 h-4 w-1/4 rounded bg-gray-200"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 rounded bg-gray-200"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search friends..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Friend Requests */}
      {friendRequests.length > 0 && (
        <div className="mb-6">
          <h3 className="mb-3 text-lg font-semibold">Friend Requests ({friendRequests.length})</h3>
          <div className="space-y-2">
            {friendRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between rounded-lg border border-yellow-200 bg-yellow-50 p-3"
              >
                <div>
                  <p className="font-medium">{request.fromUser.username}</p>
                  <p className="text-sm text-gray-600">Wants to be your friend</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleAcceptRequest(request.id)}
                    className="rounded bg-green-500 px-3 py-1 text-sm text-white hover:bg-green-600"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleDeclineRequest(request.id)}
                    className="rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends List */}
      <div>
        <h3 className="mb-3 text-lg font-semibold">Friends ({filteredFriends.length})</h3>
        <div className="space-y-2">
          {filteredFriends.map((friend) => (
            <div
              key={friend.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 hover:bg-gray-50"
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`h-3 w-3 rounded-full ${
                    friend.status === 'online'
                      ? 'bg-green-500'
                      : friend.status === 'away'
                        ? 'bg-yellow-500'
                        : 'bg-gray-400'
                  }`}
                ></div>
                <div>
                  <p className="font-medium">{friend.username}</p>
                  <p className="text-sm text-gray-600">
                    {friend.status === 'online'
                      ? 'Online'
                      : friend.status === 'away'
                        ? 'Away'
                        : 'Offline'}
                  </p>
                </div>
              </div>
              <button className="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600">
                Message
              </button>
            </div>
          ))}
        </div>

        {filteredFriends.length === 0 && (
          <p className="py-4 text-center text-gray-500">No friends found</p>
        )}
      </div>
    </div>
  );
};
