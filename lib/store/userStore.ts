 
 
import { create } from 'zustand';

interface User {
  id: string;
  username: string;
  avatar?: string;
  email?: string;
  level?: number;
  statusMessage?: string;
}

interface UserStoreState {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
  updateAvatar: (avatar: string) => void;
}

export const useUserStore = create<UserStoreState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
  updateAvatar: (avatar) =>
    set((state) => ({
      user: state.user ? { ...state.user, avatar } : null,
    })),
}));
