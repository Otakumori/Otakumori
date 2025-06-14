'use client';

import { motion } from 'framer-motion';

interface BubbleTextProps {
  text: string;
  className?: string;
}

const BubbleText = ({ text, className = '' }: BubbleTextProps) => {
  return (
    <div className={`relative ${className}`}>
      {text.split('').map((char, index) => (
        <motion.span
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
            ease: "easeInOut",
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </div>
  );
};

export default BubbleText; 