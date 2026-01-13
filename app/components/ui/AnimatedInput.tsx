'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from './input';

interface AnimatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
}

export function AnimatedInput({ label, error, success, ...props }: AnimatedInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHasValue(!!inputRef.current?.value);
  }, [props.value]);

  return (
    <div className="relative w-full">
      {label && (
        <motion.label
          htmlFor={props.id}
          className="absolute left-4 text-sm text-pink-300/60 pointer-events-none z-10"
          animate={{
            y: isFocused || hasValue ? -24 : 0,
            scale: isFocused || hasValue ? 0.85 : 1,
            color: error ? 'rgb(239 68 68)' : success ? 'rgb(34 197 94)' : 'rgb(244 114 182 / 0.6)',
          }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {label}
        </motion.label>
      )}
      
      <motion.div
        animate={{
          borderColor: error 
            ? 'rgba(239, 68, 68, 0.5)' 
            : success 
            ? 'rgba(34, 197, 94, 0.5)' 
            : isFocused 
            ? 'rgba(236, 72, 153, 0.5)' 
            : 'rgba(255, 255, 255, 0.1)',
          boxShadow: isFocused 
            ? '0 0 0 3px rgba(236, 72, 153, 0.1)' 
            : 'none',
        }}
        transition={{ duration: 0.2 }}
        className="relative rounded-xl overflow-hidden"
      >
        <Input
          ref={inputRef}
          {...props}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          onChange={(e) => {
            setHasValue(!!e.target.value);
            props.onChange?.(e);
          }}
          className={`${props.className} transition-all duration-200`}
        />
        
        {/* Animated border glow */}
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          animate={{
            opacity: isFocused ? 0.3 : 0,
          }}
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(236, 72, 153, 0.3), transparent)',
            backgroundSize: '200% 100%',
          }}
          transition={{
            backgroundPosition: {
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
            },
          }}
        />
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-red-400 text-xs mt-1"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

