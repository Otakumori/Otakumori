import React, { useEffect, useRef, useState } from 'react';
import { usePetalContext, eventBus } from '@/providers';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const MAX_LOG = 10;

const PetalWallet: React.FC = () => {
  const petalStore = usePetalContext()();
  const [showLog, setShowLog] = useState(false);
  const [log, setLog] = useState<{ amount: number; timestamp: number }[]>([]);
  const prevPetals = useRef(petalStore.petals);
  const [animate, setAnimate] = useState(false);

  // Listen for petal earning events
  useEffect(() => {
    const handler = (amount: any) => {
      setLog(prev => [{ amount, timestamp: Date.now() }, ...prev].slice(0, MAX_LOG));
      setAnimate(true);
      setTimeout(() => setAnimate(false), 600);
    };
    eventBus.on('petalEarned', handler);
    return () => {
      eventBus.off('petalEarned', handler);
    };
  }, []);

  // Animate on direct petal count change (e.g., sync)
  useEffect(() => {
    if (petalStore.petals !== prevPetals.current) {
      setAnimate(true);
      setTimeout(() => setAnimate(false), 600);
      prevPetals.current = petalStore.petals;
    }
  }, [petalStore.petals]);

  return (
    <div className="relative flex items-center">
      <motion.button
        className={`group flex items-center gap-1 rounded-full bg-pink-900/80 px-3 py-1 text-lg font-bold text-white shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-400 ${animate ? 'ring-2 ring-pink-400 scale-105' : ''}`}
        aria-label="Petal Wallet"
        onMouseEnter={() => setShowLog(true)}
        onMouseLeave={() => setShowLog(false)}
        onFocus={() => setShowLog(true)}
        onBlur={() => setShowLog(false)}
        tabIndex={0}
      >
        <Image src="/assets/petal.svg" alt="Petal" width={24} height={24} className="mr-1" />
        <span className="tabular-nums">{petalStore.petals}</span>
      </motion.button>
      <AnimatePresence>
        {showLog && log.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl bg-black/90 p-4 text-sm text-white shadow-2xl backdrop-blur-lg"
            role="log"
            aria-live="polite"
          >
            <div className="mb-2 text-pink-300 font-semibold">Petal History</div>
            <ul className="max-h-48 overflow-y-auto pr-1">
              {log.map((entry, idx) => (
                <li key={entry.timestamp} className="flex justify-between py-1 border-b border-pink-800/40 last:border-0">
                  <span>{entry.amount > 0 ? `+${entry.amount}` : entry.amount} petals</span>
                  <span className="text-xs text-gray-400">{new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PetalWallet; 