'use client';

import { logger } from '@/app/lib/logger';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAbyss } from '@/context/AbyssContext';
import CherryBlossomEffect from './CherryBlossomEffect';

export default function PetalCollectionGame() {
  const { collectedPetals, collectPetal } = useAbyss();
  const [isGameActive, setIsGameActive] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [clickFeedback, setClickFeedback] = useState({ x: 0, y: 0, show: false });
  const containerRef = useRef(null);

  const handlePetalClick = async (e) => {
    if (!isGameActive) return;

    // Get click coordinates relative to the container
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Show visual feedback at click position
    setClickFeedback({ x, y, show: true });
    setTimeout(() => setClickFeedback((prev) => ({ ...prev, show: false })), 500);

    try {
      await collectPetal();
      setNotificationMessage(` Petal collected! Total: ${collectedPetals + 1}`);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 2000);
    } catch (error) {
      logger.error('Error collecting petal:', error);
      setNotificationMessage('Failed to collect petal');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 2000);
    }
  };

  return (
    <div className="relative">
      {/* Cherry Blossom Tree Image Container */}
      <div
        ref={containerRef}
        className="relative h-[600px] w-full cursor-pointer"
        onClick={handlePetalClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handlePetalClick(e);
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Click to collect petals from the cherry blossom tree"
      >
        <img
          src="/images/cherry-blossom-tree.jpg"
          alt="Cherry Blossom Tree"
          className="h-full w-full object-cover"
        />

        {/* Cherry Blossom Effect */}
        <CherryBlossomEffect isActive={isGameActive} containerRef={containerRef} />

        {/* Click Feedback */}
        {clickFeedback.show && (
          <motion.div
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute pointer-events-none"
            style={{
              left: clickFeedback.x,
              top: clickFeedback.y,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="text-4xl">
              <span role="img" aria-label="Cherry blossom petal">
                🌸
              </span>
            </div>
          </motion.div>
        )}

        {/* Petal Counter */}
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg border border-pink-500/30">
          <p className="text-pink-300 font-bold">
            Petals: <span className="text-pink-400">{collectedPetals}</span>
          </p>
        </div>

        {/* Game Controls Overlay */}
        <div className="absolute bottom-4 right-4 flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsGameActive(!isGameActive)}
            className="rounded-full bg-pink-500 px-4 py-2 font-bold text-white hover:bg-pink-600"
          >
            {isGameActive ? 'Stop' : 'Start'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowLeaderboard(!showLeaderboard)}
            className="rounded-full bg-gray-800 px-4 py-2 font-bold text-white hover:bg-gray-700"
          >
            {
              <>
                ''
                <span role="img" aria-label="emoji">
                  L
                </span>
                <span role="img" aria-label="emoji">
                  e
                </span>
                <span role="img" aria-label="emoji">
                  a
                </span>
                <span role="img" aria-label="emoji">
                  d
                </span>
                <span role="img" aria-label="emoji">
                  e
                </span>
                <span role="img" aria-label="emoji">
                  r
                </span>
                <span role="img" aria-label="emoji">
                  b
                </span>
                <span role="img" aria-label="emoji">
                  o
                </span>
                <span role="img" aria-label="emoji">
                  a
                </span>
                <span role="img" aria-label="emoji">
                  r
                </span>
                <span role="img" aria-label="emoji">
                  d
                </span>
                ''
              </>
            }
          </motion.button>
        </div>
      </div>
      {/* Leaderboard Modal */}
      <AnimatePresence>
        {showLeaderboard && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            onClick={() => setShowLeaderboard(false)}
          >
            <motion.div
              className="w-96 rounded-lg bg-gray-800 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="mb-4 text-2xl font-bold text-pink-400">
                {
                  <>
                    <span role="img" aria-label="emoji">
                      L
                    </span>
                    <span role="img" aria-label="emoji">
                      e
                    </span>
                    <span role="img" aria-label="emoji">
                      a
                    </span>
                    <span role="img" aria-label="emoji">
                      d
                    </span>
                    <span role="img" aria-label="emoji">
                      e
                    </span>
                    <span role="img" aria-label="emoji">
                      r
                    </span>
                    <span role="img" aria-label="emoji">
                      b
                    </span>
                    <span role="img" aria-label="emoji">
                      o
                    </span>
                    <span role="img" aria-label="emoji">
                      a
                    </span>
                    <span role="img" aria-label="emoji">
                      r
                    </span>
                    <span role="img" aria-label="emoji">
                      d
                    </span>
                  </>
                }
              </h2>
              <div className="space-y-2">
                <p className="text-center text-gray-400">
                  {
                    <>
                      ''
                      <span role="img" aria-label="emoji">
                        S
                      </span>
                      <span role="img" aria-label="emoji">
                        i
                      </span>
                      <span role="img" aria-label="emoji">
                        g
                      </span>
                      <span role="img" aria-label="emoji">
                        n
                      </span>
                      ' '
                      <span role="img" aria-label="emoji">
                        i
                      </span>
                      <span role="img" aria-label="emoji">
                        n
                      </span>
                      ' '
                      <span role="img" aria-label="emoji">
                        t
                      </span>
                      <span role="img" aria-label="emoji">
                        o
                      </span>
                      ' '
                      <span role="img" aria-label="emoji">
                        v
                      </span>
                      <span role="img" aria-label="emoji">
                        i
                      </span>
                      <span role="img" aria-label="emoji">
                        e
                      </span>
                      <span role="img" aria-label="emoji">
                        w
                      </span>
                      ' '
                      <span role="img" aria-label="emoji">
                        a
                      </span>
                      <span role="img" aria-label="emoji">
                        n
                      </span>
                      <span role="img" aria-label="emoji">
                        d
                      </span>
                      ' '
                      <span role="img" aria-label="emoji">
                        c
                      </span>
                      <span role="img" aria-label="emoji">
                        o
                      </span>
                      <span role="img" aria-label="emoji">
                        m
                      </span>
                      <span role="img" aria-label="emoji">
                        p
                      </span>
                      <span role="img" aria-label="emoji">
                        e
                      </span>
                      <span role="img" aria-label="emoji">
                        t
                      </span>
                      <span role="img" aria-label="emoji">
                        e
                      </span>
                      ' '
                      <span role="img" aria-label="emoji">
                        o
                      </span>
                      <span role="img" aria-label="emoji">
                        n
                      </span>
                      ' '
                      <span role="img" aria-label="emoji">
                        t
                      </span>
                      <span role="img" aria-label="emoji">
                        h
                      </span>
                      <span role="img" aria-label="emoji">
                        e
                      </span>
                      ' '
                      <span role="img" aria-label="emoji">
                        l
                      </span>
                      <span role="img" aria-label="emoji">
                        e
                      </span>
                      <span role="img" aria-label="emoji">
                        a
                      </span>
                      <span role="img" aria-label="emoji">
                        d
                      </span>
                      <span role="img" aria-label="emoji">
                        e
                      </span>
                      <span role="img" aria-label="emoji">
                        r
                      </span>
                      <span role="img" aria-label="emoji">
                        b
                      </span>
                      <span role="img" aria-label="emoji">
                        o
                      </span>
                      <span role="img" aria-label="emoji">
                        a
                      </span>
                      <span role="img" aria-label="emoji">
                        r
                      </span>
                      <span role="img" aria-label="emoji">
                        d
                      </span>
                      ! ''
                    </>
                  }
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Notification */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 transform rounded-full bg-pink-500 px-6 py-3 text-white shadow-lg"
          >
            {notificationMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
