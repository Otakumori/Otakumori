/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable-line @next/next/no-img-element */
'use client';

import { useEffect, useRef } from 'react';
import { gaEvent } from '@/lib/ga';

export default function BootSequence({ onDone }: { onDone: () => void }) {
  const hasSeenBoot = useRef(false);

  useEffect(() => {
    if (hasSeenBoot.current) {
      onDone();
      return;
    }

    hasSeenBoot.current = true;
    gaEvent('boot_show');

    const timer = setTimeout(() => {
      onDone();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onDone]);

  const handleSkip = () => {
    gaEvent('boot_skip');
    onDone();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleSkip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="text-center">
        <LogoOtakumoriSVG className="mx-auto mb-8 h-32 w-32 animate-pulse" />
        <div className="text-2xl font-bold text-white mb-4">Otaku-mori</div>
        <div className="text-gray-400 mb-8">Press ESC to skip</div>
        <div className="text-sm text-gray-500">Loading your adventure...</div>
      </div>
    </div>
  );
}

function LogoOtakumoriSVG({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="#FF69B4" opacity="0.8" />
      <path d="M30 40 Q50 20 70 40 Q50 60 30 40" fill="#FF1493" stroke="#FF1493" strokeWidth="2" />
      <circle cx="40" cy="35" r="3" fill="white" />
      <circle cx="60" cy="35" r="3" fill="white" />
    </svg>
  );
}
