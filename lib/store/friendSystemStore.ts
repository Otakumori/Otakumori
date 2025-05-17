import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Friend {
  id: string;
  username: string;
  level: number;
  lastActive?: Date;
}

interface FriendSystemState {
  friends: Friend[];
  friendRequests: Friend[];
  addFriend: (friend: Friend) => void;
  removeFriend: (id: string) => void;
  addFriendRequest: (friend: Friend) => void;
  removeFriendRequest: (id: string) => void;
  acceptFriendRequest: (id: string) => void;
  rejectFriendRequest: (id: string) => void;
}

export const useFriendSystemStore = create<FriendSystemState>()(
  persist(
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
