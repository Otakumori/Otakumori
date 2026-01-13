'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface AnimatedToggleProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function AnimatedToggle({ checked: controlledChecked, onChange, label, disabled }: AnimatedToggleProps) {
  const [internalChecked, setInternalChecked] = useState(false);
  const checked = controlledChecked ?? internalChecked;

  const handleToggle = () => {
    if (disabled) return;
    const newValue = !checked;
    if (controlledChecked === undefined) {
      setInternalChecked(newValue);
    }
    onChange?.(newValue);
  };

  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <motion.div
        className={`relative w-12 h-6 rounded-full ${
          checked ? 'bg-pink-500' : 'bg-white/20'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={handleToggle}
        whileTap={disabled ? {} : { scale: 0.95 }}
      >
        <motion.div
          className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-lg"
          animate={{
            x: checked ? 24 : 0,
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30,
          }}
        />
        
        {/* Glow effect when checked */}
        {checked && (
          <motion.div
            className="absolute inset-0 rounded-full bg-pink-500"
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: [0, 0.5, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 0.6 }}
          />
        )}
      </motion.div>
      
      {label && (
        <span className="text-white text-sm">{label}</span>
      )}
    </label>
  );
}

