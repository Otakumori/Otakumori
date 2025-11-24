'use client';

import { type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { prefersReducedMotion } from '@/app/lib/accessibility';

interface PageTransitionProps {
    children: ReactNode;
    className?: string;
}

export function PageTransition({
    children,
    className = '',
}: PageTransitionProps) {
    const pathname = usePathname();
    const shouldAnimate = !prefersReducedMotion();

    if (!shouldAnimate) {
        return <div className={ className }> { children } </div>;
    }

    return (
        <AnimatePresence mode= "wait" >
        <motion.div
        key={ pathname }
    initial = {{ opacity: 0, y: 20 }
}
animate = {{ opacity: 1, y: 0 }}
exit = {{ opacity: 0, y: -20 }}
transition = {{ duration: 0.3, ease: 'easeInOut' }}
className = { className }
    >
    { children }
    </motion.div>
    </AnimatePresence>
  );
}

