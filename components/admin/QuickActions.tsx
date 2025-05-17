import React from 'react';
import { motion } from 'framer-motion';

const actions = [
  { id: 'users', label: 'Manage Users', icon: '👥' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
  { id: 'logs', label: 'View Logs', icon: '📜' },
];

export default function QuickActions() {
  return (
    <div className="rounded-lg border border-pink-900/40 bg-black/80 p-4 shadow-2xl">
      <h2 className="mb-4 text-xl font-bold text-pink-400">Quick Actions</h2>
      <div className="space-y-2">
        {actions.map(action => (
          <motion.button
            key={action.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex w-full items-center space-x-2 rounded bg-white/5 p-2 transition-colors hover:bg-white/10"
          >
            <span className="text-xl">{action.icon}</span>
            <span className="text-white">{action.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
