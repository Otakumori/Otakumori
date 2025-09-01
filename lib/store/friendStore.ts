 
 
import { create } from 'zustand';

interface Friend {
  id: string;
  username: string;
  name: string; // Keep for backward compatibility, but prefer username
  status: 'online' | 'offline' | 'away';
  favorite?: boolean;
  lastSeen?: number;
}

interface FriendRequest {
  id: string;
  fromUser: Friend;
  status: 'pending' | 'accepted' | 'declined';
  timestamp: number;
}

interface FriendStoreState {
  friends: Friend[];
  setFriends: (friends: Friend[]) => void;
  friendRequests: FriendRequest[];
  acceptFriendRequest: (requestId: string) => void;
  rejectFriendRequest: (requestId: string) => void;
  toggleFavorite: (friendId: string) => void;
}

export const useFriendStore = create<FriendStoreState>((set) => ({
  friends: [],
  setFriends: (friends) => set({ friends }),
  friendRequests: [],
  acceptFriendRequest: (requestId) =>
    set((state) => {
      const request = state.friendRequests.find((r) => r.id === requestId);
      if (!request) return state;
      return {
        friendRequests: state.friendRequests.map((r) =>
          r.id === requestId ? { ...r, status: 'accepted' } : r,
        ),
        friends: [...state.friends, request.fromUser],
      };
    }),
  rejectFriendRequest: (requestId) =>
    set((state) => ({
      friendRequests: state.friendRequests.map((r) =>
        r.id === requestId ? { ...r, status: 'declined' } : r,
      ),
    })),
  toggleFavorite: (friendId) =>
    set((state) => ({
      friends: state.friends.map((f) => (f.id === friendId ? { ...f, favorite: !f.favorite } : f)),
    })),
}));
