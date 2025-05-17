import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  username: string;
  level: number;
  statusMessage?: string;
  avatar?: string;
  birthDate?: Date;
  isVerified?: boolean;
}

interface UserState {
  user: User | null;
  setUser: (user: User) => void;
  updateStatus: (message: string) => void;
  updateAvatar: (avatar: string) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    set => ({
      user: null,
      setUser: user => set({ user }),
      updateStatus: message =>
        set(state => ({
          user: state.user ? { ...state.user, statusMessage: message } : null,
        })),
      updateAvatar: avatar =>
        set(state => ({
          user: state.user ? { ...state.user, avatar } : null,
        })),
      clearUser: () => set({ user: null }),
    }),
    {
      name: 'user',
    }
  )
);
