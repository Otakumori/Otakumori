'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

interface AnimatedToastProps {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  onClose: (id: string) => void;
}

export function AnimatedToast({ id, message, type = 'info', duration = 5000, onClose }: AnimatedToastProps) {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle,
  };

  const colors = {
    success: 'from-green-500/20 to-emerald-500/20 border-green-500/40',
    error: 'from-red-500/20 to-rose-500/20 border-red-500/40',
    info: 'from-blue-500/20 to-cyan-500/20 border-blue-500/40',
    warning: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/40',
  };

  const Icon = icons[type];

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`
        flex items-start gap-3 p-4 rounded-xl backdrop-blur-lg border
        bg-gradient-to-r ${colors[type]}
        shadow-lg min-w-[300px] max-w-[400px]
      `}
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
      >
        <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
          type === 'success' ? 'text-green-400' :
          type === 'error' ? 'text-red-400' :
          type === 'warning' ? 'text-yellow-400' :
          'text-blue-400'
        }`} />
      </motion.div>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex-1 text-sm text-white font-medium leading-relaxed"
      >
        {message}
      </motion.p>
      
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => onClose(id)}
        className="flex-shrink-0 text-white/60 hover:text-white transition-colors"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </motion.button>
    </motion.div>
  );
}

