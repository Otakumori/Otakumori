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
          <h1 className="text-3xl font-bold leading-tight text-white md:text-5xl">{<>''
            <span role='img' aria-label='emoji'>W</span><span role='img' aria-label='emoji'>e</span><span role='img' aria-label='emoji'>l</span><span role='img' aria-label='emoji'>c</span><span role='img' aria-label='emoji'>o</span><span role='img' aria-label='emoji'>m</span><span role='img' aria-label='emoji'>e</span>' '<span role='img' aria-label='emoji'>H</span><span role='img' aria-label='emoji'>o</span><span role='img' aria-label='emoji'>m</span><span role='img' aria-label='emoji'>e</span>,' '<span role='img' aria-label='emoji'>T</span><span role='img' aria-label='emoji'>r</span><span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>v</span><span role='img' aria-label='emoji'>e</span><span role='img' aria-label='emoji'>l</span><span role='img' aria-label='emoji'>e</span><span role='img' aria-label='emoji'>r</span>
            ''</>}</h1>
          <p className="mt-3 text-zinc-200/90 md:text-lg">
            {t("home", "label")}{<>.' '<span role='img' aria-label='emoji'>S</span><span role='img' aria-label='emoji'>t</span><span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>r</span>-<span role='img' aria-label='emoji'>l</span><span role='img' aria-label='emoji'>i</span><span role='img' aria-label='emoji'>t</span>' '<span role='img' aria-label='emoji'>s</span><span role='img' aria-label='emoji'>k</span><span role='img' aria-label='emoji'>i</span><span role='img' aria-label='emoji'>e</span><span role='img' aria-label='emoji'>s</span>.' '<span role='img' aria-label='emoji'>A</span>' '<span role='img' aria-label='emoji'>l</span><span role='img' aria-label='emoji'>i</span><span role='img' aria-label='emoji'>v</span><span role='img' aria-label='emoji'>i</span><span role='img' aria-label='emoji'>n</span><span role='img' aria-label='emoji'>g</span>' '<span role='img' aria-label='emoji'>t</span><span role='img' aria-label='emoji'>r</span><span role='img' aria-label='emoji'>e</span><span role='img' aria-label='emoji'>e</span>.' '<span role='img' aria-label='emoji'>E</span><span role='img' aria-label='emoji'>x</span><span role='img' aria-label='emoji'>p</span><span role='img' aria-label='emoji'>l</span><span role='img' aria-label='emoji'>o</span><span role='img' aria-label='emoji'>r</span><span role='img' aria-label='emoji'>e</span>' '<span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>t</span>' '<span role='img' aria-label='emoji'>y</span><span role='img' aria-label='emoji'>o</span><span role='img' aria-label='emoji'>u</span><span role='img' aria-label='emoji'>r</span>' '<span role='img' aria-label='emoji'>p</span><span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>c</span><span role='img' aria-label='emoji'>e</span>.
            ''</>}</p>
        </GlassPanel>
      </motion.div>
      {/* Cinematic reveal space for the tree */}
      <div aria-hidden className="h-[40vh] md:h-[55vh]" />
    </section>
  );
}
