'use strict';
'use client';
'use client';
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = LoadingBonfire;
const framer_motion_1 = require('framer-motion');
function LoadingBonfire() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900">
      <framer_motion_1.motion.div
        className="relative"
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Bonfire Base */}
        <div className="h-24 w-24 rounded-full bg-gradient-to-b from-orange-500 to-red-800 shadow-lg shadow-orange-500/50" />

        {/* Flames */}
        {[...Array(5)].map((_, i) => (
          <framer_motion_1.motion.div
            key={i}
            className="absolute h-8 w-4 rounded-full bg-gradient-to-t from-pink-500 to-yellow-300"
            style={{
              left: `${20 + i * 16}px`,
              bottom: '40px',
            }}
            animate={{
              height: [8, 16, 8],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}

        {/* Sword */}
        <framer_motion_1.motion.div
          className="absolute h-16 w-2 rounded-full bg-gray-300"
          style={{
            left: '50%',
            bottom: '60px',
            transform: 'translateX(-50%)',
          }}
          animate={{
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </framer_motion_1.motion.div>

      <framer_motion_1.motion.p
        className="mt-8 font-medium text-pink-400"
        animate={{
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      >
        Kindling the bonfire...
      </framer_motion_1.motion.p>
    </div>
  );
}
