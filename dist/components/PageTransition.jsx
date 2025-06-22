'use strict';
'use client';
Object.defineProperty(exports, '__esModule', { value: true });
exports.PageTransition = void 0;
const framer_motion_1 = require('framer-motion');
const animations_1 = require('@/lib/animations');
const PageTransition = ({ children }) => {
  return (
    <framer_motion_1.motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={animations_1.pageTransition}
      className="min-h-screen"
    >
      {children}
    </framer_motion_1.motion.div>
  );
};
exports.PageTransition = PageTransition;
