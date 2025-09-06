'use client';

import { motion } from 'framer-motion';
import GlassPanel from './GlassPanel';
import { t } from '@/lib/microcopy';

export default function HeroIntro() {
  return (
    <section className="relative z-10 mx-auto mt-6 max-w-7xl px-4 md:mt-10 md:px-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.7 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
      >
        <GlassPanel className="p-6 md:p-8">
          <h1 className="text-3xl font-bold leading-tight text-white md:text-5xl">
            Welcome Home, Traveler
          </h1>
          <p className="mt-3 text-zinc-200/90 md:text-lg">
            {t("home", "label")}. Star-lit skies. A living tree. Explore at your pace.
          </p>
        </GlassPanel>
      </motion.div>

      {/* Cinematic reveal space for the tree */}
      <div aria-hidden className="h-[40vh] md:h-[55vh]" />
    </section>
  );
}
