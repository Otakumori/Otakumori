'use strict';
'use client';
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = AuthLayout;
const framer_motion_1 = require('framer-motion');
function AuthLayout({ children }) {
  return (
    <framer_motion_1.AnimatePresence mode="wait">
      <framer_motion_1.motion.div
        key="auth"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        className="flex min-h-screen items-center justify-center bg-black bg-gradient-to-br from-gray-900 to-gray-950"
      >
        {children}
      </framer_motion_1.motion.div>
    </framer_motion_1.AnimatePresence>
  );
}
