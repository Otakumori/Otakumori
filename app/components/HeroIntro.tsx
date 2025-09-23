'use client';

import { motion } from 'framer-motion';
import GlassPanel from './GlassPanel';
import { t } from '../lib/microcopy';

export default function HeroIntro() {
  return (
    <section className="relative z-20 mx-auto mt-6 max-w-7xl px-4 md:mt-10 md:px-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.7 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
      >
        <div className="relative">
          {/* Clean pink text without excessive effects */}
          <motion.h1
            className="text-6xl md:text-8xl font-display leading-tight text-pink-400 text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            Welcome home, wanderer
          </motion.h1>
        </div>
      </motion.div>
      {/* Spacing for content */}
      <div aria-hidden className="h-[20vh] md:h-[30vh]" />
    </section>
  );
}
