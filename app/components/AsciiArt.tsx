/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
'use client';
import React from 'react';
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
  type?: string;
  className?: string;
}

export const AsciiArt: React.FC<AsciiArtProps> = ({ type = 'friend', className }) => {
  let art = '';
  switch (type) {
    case 'friend':
      art = `
      (•‿•)
      /|\
      / \\
      `;
      break;
    case 'star':
      art = `
      ★
      `;
      break;
    default:
      art = 'ASCII';
  }
  return <pre className={className}>{art}</pre>;
};
