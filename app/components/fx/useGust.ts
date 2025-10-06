'use client';
import { useEffect, useState } from 'react';

export function useGust({ base = 1, burst = 1.6, everyMs = 22000, lengthMs = 2200 } = {}) {
  const [gust, setGust] = useState(base);

  useEffect(() => {
    // Respect reduced motion
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    let t: any, r: any;
    const kick = () => {
      setGust(burst);
      t = setTimeout(() => setGust(base), lengthMs);
      r = setTimeout(kick, everyMs + Math.random() * 5000);
    };
    r = setTimeout(kick, 4000 + Math.random() * 4000);
    return () => {
      clearTimeout(t);
      clearTimeout(r);
    };
  }, [base, burst, everyMs, lengthMs]);

  return gust;
}
