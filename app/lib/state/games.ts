import { create } from 'zustand';

export type HubPanel = 'mini-games' | 'trade-hall' | 'achievements' | 'profile' | null;

interface GamesState {
  activePanel: HubPanel;
  isPanelOpen: boolean;
  setActivePanel: (panel: HubPanel) => void;
  openPanel: (panel: HubPanel) => void;
  closePanel: () => void;
  resetHub: () => void;
}

export const useGamesStore = create<GamesState>((set) => ({
  activePanel: null,
  isPanelOpen: false,

  setActivePanel: (panel) => set({ activePanel: panel }),

  openPanel: (panel) =>
    set({
      activePanel: panel,
      isPanelOpen: true,
    }),

  closePanel: () =>
    set({
      isPanelOpen: false,
      activePanel: null,
    }),

  resetHub: () =>
    set({
      activePanel: null,
      isPanelOpen: false,
    }),
}));
