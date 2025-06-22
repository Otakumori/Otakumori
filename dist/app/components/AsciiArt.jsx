'use strict';
'use client';
Object.defineProperty(exports, '__esModule', { value: true });
exports.AsciiArt = void 0;
const react_1 = require('react');
const framer_motion_1 = require('framer-motion');
const CHERRY_BLOSSOM = `
    🌸
   🌸🌸
  🌸🌸🌸
 🌸🌸🌸🌸
🌸🌸🌸🌸🌸
`;
const GAMECUBE = `
  ╭─────────╮
  │  🎮    │
  │  GAME  │
  │  CUBE  │
  ╰─────────╯
`;
const FRIEND = `
  ╭─────────╮
  │  👥    │
  │ FRIEND │
  │ SYSTEM │
  ╰─────────╯
`;
const LEADERBOARD = `
  ╭─────────╮
  │  🏆    │
  │  TOP   │
  │ SCORES │
  ╰─────────╯
`;
const CHAT = `
  ╭─────────╮
  │  💬    │
  │  CHAT  │
  │ SYSTEM │
  ╰─────────╯
`;
const ASCII_ART = {
  cherryBlossom: CHERRY_BLOSSOM,
  gamecube: GAMECUBE,
  friend: FRIEND,
  leaderboard: LEADERBOARD,
  chat: CHAT,
};
const AsciiArt = ({ type, className = '', animate = false }) => {
  const [displayedArt, setDisplayedArt] = (0, react_1.useState)('');
  const art = ASCII_ART[type];
  (0, react_1.useEffect)(() => {
    if (animate) {
      let currentIndex = 0;
      const interval = setInterval(() => {
        setDisplayedArt(art.slice(0, currentIndex));
        currentIndex++;
        if (currentIndex > art.length) {
          clearInterval(interval);
        }
      }, 50);
      return () => clearInterval(interval);
    } else {
      setDisplayedArt(art);
    }
  }, [art, animate]);
  return (
    <framer_motion_1.motion.pre
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`whitespace-pre font-mono text-pink-400 ${className}`}
    >
      {displayedArt}
    </framer_motion_1.motion.pre>
  );
};
exports.AsciiArt = AsciiArt;
