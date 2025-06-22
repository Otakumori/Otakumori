'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.useUserStore = void 0;
const zustand_1 = require('zustand');
const middleware_1 = require('zustand/middleware');
exports.useUserStore = (0, zustand_1.create)()(
  (0, middleware_1.persist)(
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
