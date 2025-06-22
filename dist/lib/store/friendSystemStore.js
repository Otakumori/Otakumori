'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.useFriendSystemStore = void 0;
const zustand_1 = require('zustand');
const middleware_1 = require('zustand/middleware');
exports.useFriendSystemStore = (0, zustand_1.create)()(
  (0, middleware_1.persist)(
    set => ({
      friends: [],
      friendRequests: [],
      addFriend: friend =>
        set(state => ({
          friends: [...state.friends, friend],
        })),
      removeFriend: id =>
        set(state => ({
          friends: state.friends.filter(f => f.id !== id),
        })),
      addFriendRequest: friend =>
        set(state => ({
          friendRequests: [...state.friendRequests, friend],
        })),
      removeFriendRequest: id =>
        set(state => ({
          friendRequests: state.friendRequests.filter(f => f.id !== id),
        })),
      acceptFriendRequest: id =>
        set(state => {
          const request = state.friendRequests.find(f => f.id === id);
          if (!request) return state;
          return {
            friends: [...state.friends, request],
            friendRequests: state.friendRequests.filter(f => f.id !== id),
          };
        }),
      rejectFriendRequest: id =>
        set(state => ({
          friendRequests: state.friendRequests.filter(f => f.id !== id),
        })),
    }),
    {
      name: 'friend-system',
    }
  )
);
