'use strict';
'use client';
'use client';
Object.defineProperty(exports, '__esModule', { value: true });
const framer_motion_1 = require('framer-motion');
const BubbleText = ({ text, className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      {text.split('').map((char, index) => (
        <framer_motion_1.motion.span
          key={index}
          className="inline-block"
          initial={{ y: 0 }}
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: index * 0.1,
            ease: 'easeInOut',
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </framer_motion_1.motion.span>
      ))}
    </div>
  );
};
exports.default = BubbleText;
