'use strict';
'use client';
Object.defineProperty(exports, '__esModule', { value: true });
exports.useOverlordContext = exports.usePetalContext = void 0;
exports.PetalProvider = PetalProvider;
exports.OverlordProvider = OverlordProvider;
exports.Providers = Providers;
const nextjs_1 = require('@clerk/nextjs');
const react_query_1 = require('@tanstack/react-query');
const react_1 = require('next-auth/react');
const zustand_1 = require('zustand');
const react_2 = require('react');
// Create a store for the petal system
const usePetalStore = (0, zustand_1.create)(set => ({
  petals: 0,
  dailyLimit: 50,
  addPetals: amount => set(state => ({ petals: state.petals + amount })),
  resetDailyLimit: () => set({ petals: 0 }),
}));
// Create a store for the AI Overlord
const useOverlordStore = (0, zustand_1.create)(set => ({
  isActive: false,
  lastInteraction: null,
  quests: [],
  activate: () => set({ isActive: true }),
  deactivate: () => set({ isActive: false }),
  addQuest: quest => set(state => ({ quests: [...state.quests, quest] })),
}));
const queryClient = new react_query_1.QueryClient();
// Context providers for the stores
const PetalContext = (0, react_2.createContext)(null);
const OverlordContext = (0, react_2.createContext)(null);
function PetalProvider({ children }) {
  const store = (0, react_2.useRef)(usePetalStore);
  return <PetalContext.Provider value={store.current}>{children}</PetalContext.Provider>;
}
function OverlordProvider({ children }) {
  const store = (0, react_2.useRef)(useOverlordStore);
  return <OverlordContext.Provider value={store.current}>{children}</OverlordContext.Provider>;
}
const usePetalContext = () => {
  const context = (0, react_2.useContext)(PetalContext);
  if (!context) {
    throw new Error('usePetalContext must be used within a PetalProvider');
  }
  return context;
};
exports.usePetalContext = usePetalContext;
const useOverlordContext = () => {
  const context = (0, react_2.useContext)(OverlordContext);
  if (!context) {
    throw new Error('useOverlordContext must be used within an OverlordProvider');
  }
  return context;
};
exports.useOverlordContext = useOverlordContext;
function Providers({ children }) {
  return (
    <nextjs_1.ClerkProvider>
      <react_1.SessionProvider>
        <react_query_1.QueryClientProvider client={queryClient}>
          <PetalProvider>
            <OverlordProvider>{children}</OverlordProvider>
          </PetalProvider>
        </react_query_1.QueryClientProvider>
      </react_1.SessionProvider>
    </nextjs_1.ClerkProvider>
  );
}
