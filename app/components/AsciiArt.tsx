import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

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

interface AsciiArtProps {
  type: keyof typeof ASCII_ART;
  className?: string;
  animate?: boolean;
}

export const AsciiArt = ({ type, className = '', animate = false }: AsciiArtProps) => {
  const [displayedArt, setDisplayedArt] = useState('');
  const art = ASCII_ART[type];

  useEffect(() => {
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
    <motion.pre
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`whitespace-pre font-mono text-pink-400 ${className}`}
    >
      {displayedArt}
    </motion.pre>
  );
};
