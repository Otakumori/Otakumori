'use strict';
'use client';
Object.defineProperty(exports, '__esModule', { value: true });
exports.LoadingSkeleton = void 0;
const framer_motion_1 = require('framer-motion');
const LoadingSkeleton = ({ className = '', count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <framer_motion_1.motion.div
          key={index}
          className={`rounded-lg bg-gray-800/50 ${className}`}
          initial={{ opacity: 0.5 }}
          animate={{
            opacity: [0.5, 0.8, 0.5],
            transition: {
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: index * 0.2,
            },
          }}
        />
      ))}
    </>
  );
};
exports.LoadingSkeleton = LoadingSkeleton;
