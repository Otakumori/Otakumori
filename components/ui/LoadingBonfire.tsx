/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
'use client';
import React from 'react';
import { motion } from 'framer-motion';

export default function LoadingBonfire() {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center rounded-lg border border-pink-900/40 bg-black/80 p-6 shadow-2xl">
      <motion.img
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        src="https://media.tenor.com/drxH1lO9cfEAAAAj/dark-souls-bonfire.gif"
        alt="Bonfire"
        className="mb-4 h-32 w-32 drop-shadow-lg"
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0.7, 1] }}
        transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
        className="mb-2 h-4 w-4 animate-pulse rounded-full bg-orange-500 shadow-lg"
      />
      <p className="mt-2 text-center italic text-pink-200">
        "Rest here, Chosen One. The embers of fate await your return..."
      </p>
      <p className="mt-1 text-xs text-white/40">Loading...</p>
    </div>
  );
}
