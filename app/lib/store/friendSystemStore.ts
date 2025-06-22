import { create } from 'zustand';

export interface Friend {
  id: string;
  username: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
  lastSeen?: string;
  level?: number;
}

interface FriendSystemState {
  friends: Friend[];
  addFriend: (friend: Friend) => void;
  removeFriend: (friendId: string) => void;
  updateFriendStatus: (friendId: string, status: Friend['status']) => void;
}

export const useFriendSystemStore = create<FriendSystemState>(set => ({
  friends: [],
  addFriend: friend =>
    set(state => ({
      friends: [...state.friends, friend],
    })),
  removeFriend: friendId =>
    set(state => ({
      friends: state.friends.filter(f => f.id !== friendId),
    })),
  updateFriendStatus: (friendId, status) =>
    set(state => ({
      friends: state.friends.map(f => (f.id === friendId ? { ...f, status } : f)),
    })),
}));
