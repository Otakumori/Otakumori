'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export default function SoapstoneMessageCard({
  children,
  className,
  emphasis = 0.9, // overlay intensity 0..1
}: {
  children: React.ReactNode;
  className?: string;
  emphasis?: number;
}) {
  return (
    <motion.article
      className={cn(
        'relative rounded-xl border border-white/10 p-4 md:p-5 overflow-hidden',
        'bg-neutral-900/70 backdrop-blur-[2px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)]',
        className,
      )}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      role="button"
      tabIndex={0}
    >
      {/* The DS-like overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 select-none"
        style={{ mixBlendMode: 'multiply', opacity: Math.max(0, Math.min(1, emphasis)) }}
      >
        <Image
          src="/assets/images/soapstonefilter.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
          priority={false}
        />
        {/* Vignette & film grain */}
        <div className="absolute inset-0 [mask-image:radial-gradient(70%_70%_at_50%_50%,black,transparent)] opacity-[.25] bg-black" />
        <div
          className="absolute inset-0 opacity-[.06] mix-blend-overlay"
          style={{
            backgroundImage:
              'url("data:image/svg+xml;utf8,\
<svg xmlns=%27http://www.w3.org/2000/svg%27 width=%27120%27 height=%27120%27 viewBox=%270 0 120 120%27><filter id=%27n%27 x=%270%27 y=%270%27 width=%27100%25%27 height=%27100%25%27><feTurbulence type=%27fractalNoise%27 baseFrequency=%270.9%27 numOctaves=%271%27 seed=%279%27/></filter><rect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27 opacity=%270.35%27/></svg>")',
          }}
        />
      </div>

      {/* Content sits under the overlay for that etched look */}
      <div className="relative z-0">{children}</div>

      {/* Focus ring (keyboard a11y) */}
      <span className="absolute inset-0 rounded-xl ring-2 ring-transparent focus-within:ring-pink-300/50" />
    </motion.article>
  );
}
