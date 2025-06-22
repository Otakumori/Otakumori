import { create } from 'zustand';

interface Friend {
  id: string;
  name: string;
}

interface FriendStoreState {
  friends: Friend[];
  setFriends: (friends: Friend[]) => void;
}

export const useFriendStore = create<FriendStoreState>(set => ({
  friends: [],
  setFriends: friends => set({ friends }),
}));
