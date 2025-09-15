// DEPRECATED: This component is a duplicate. Use app\components\components\admin\MessageManager.tsx instead.
'use client';
import React from 'react';
import { motion } from 'framer-motion';

const messages = [
  { id: 1, text: 'Welcome to the admin area, Chosen One.', timestamp: new Date().toLocaleString() },
  { id: 2, text: 'The bonfire awaits your guidance.', timestamp: new Date().toLocaleString() },
  { id: 3, text: 'Prepare for the challenges ahead.', timestamp: new Date().toLocaleString() },
];

export default function MessageManager() {
  return (
    <div className="rounded-lg border border-pink-900/40 bg-black/80 p-4 shadow-2xl">
      <h2 className="mb-4 text-xl font-bold text-pink-400">
        {
          <>
            <span role="img" aria-label="emoji">
              M
            </span>
            <span role="img" aria-label="emoji">
              e
            </span>
            <span role="img" aria-label="emoji">
              s
            </span>
            <span role="img" aria-label="emoji">
              s
            </span>
            <span role="img" aria-label="emoji">
              a
            </span>
            <span role="img" aria-label="emoji">
              g
            </span>
            <span role="img" aria-label="emoji">
              e
            </span>
            <span role="img" aria-label="emoji">
              s
            </span>
          </>
        }
      </h2>
      <div className="space-y-2">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded bg-white/5 p-2"
          >
            <p className="text-white">{message.text}</p>
            <p className="text-xs text-white/50">{message.timestamp}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
