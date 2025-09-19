"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BubbleTextProps {
  text: string;
  className?: string;
}

export function BubbleText({ text, className }: BubbleTextProps) {
  return (
    <div className={cn("relative", className)}>
      {text.split("").map((character, index) => (
        <motion.span
          key={`${character}-${index}`}
          className="inline-block"
          initial={{ y: 0 }}
          animate={{ y: [0, -10, 0] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: index * 0.1,
            ease: "easeInOut",
          }}
        >
          {character === " " ? "\u00A0" : character}
        </motion.span>
      ))}
    </div>
  );
}

export default BubbleText;
