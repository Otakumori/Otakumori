'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.useFriendStore = void 0;
const zustand_1 = require('zustand');
const middleware_1 = require('zustand/middleware');
exports.useFriendStore = (0, zustand_1.create)()(
  (0, middleware_1.persist)(
    (set, get) => ({
      friends: [],
      friendRequests: [],
      addFriend: friend => {
        set(state => ({
          friends: [...state.friends, friend],
        }));
      },
      removeFriend: friendId => {
        set(state => ({
          friends: state.friends.filter(f => f.id !== friendId),
        }));
      },
      updateFriendStatus: (friendId, status) => {
        set(state => ({
          friends: state.friends.map(f =>
            f.id === friendId
              ? { ...f, status, lastSeen: status === 'offline' ? Date.now() : f.lastSeen }
              : f
          ),
        }));
      },
      sendFriendRequest: (from, to) => {
        const request = {
          id: Math.random().toString(36).substr(2, 9),
          from,
          to,
          status: 'pending',
          timestamp: Date.now(),
        };
        set(state => ({
          friendRequests: [...state.friendRequests, request],
        }));
      },
      acceptFriendRequest: requestId => {
        set(state => {
          const request = state.friendRequests.find(r => r.id === requestId);
          if (!request) return state;
          return {
            friendRequests: state.friendRequests.map(r =>
              r.id === requestId ? { ...r, status: 'accepted' } : r
            ),
            friends: [
              ...state.friends,
              {
                id: request.from,
                username: request.from, // In a real app, you'd fetch the username
                status: 'offline',
              },
            ],
          };
        });
      },
      rejectFriendRequest: requestId => {
        set(state => ({
          friendRequests: state.friendRequests.map(r =>
            r.id === requestId ? { ...r, status: 'rejected' } : r
          ),
        }));
      },
      toggleFavorite: friendId => {
        set(state => ({
          friends: state.friends.map(f =>
            f.id === friendId ? { ...f, isFavorite: !f.isFavorite } : f
          ),
        }));
      },
      getOnlineFriends: () => {
        return get().friends.filter(f => f.status === 'online');
      },
      getFavoriteFriends: () => {
        return get().friends.filter(f => f.isFavorite);
      },
    }),
    {
      name: 'friend-storage',
      partialize: state => ({
        friends: state.friends,
        friendRequests: state.friendRequests,
      }),
    }
  )
);
