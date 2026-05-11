// DEPRECATED: This component is a duplicate. Use app\components\components\Layout.jsx instead.
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function GamesLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navigation */}
      <nav className="border-b border-pink-500/20 bg-gray-800 bg-opacity-50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/abyss" className="text-pink-400 hover:text-pink-300">
              {
                <>
                  '' ←' '
                  <span role="img" aria-label="emoji">
                    B
                  </span>
                  <span role="img" aria-label="emoji">
                    a
                  </span>
                  <span role="img" aria-label="emoji">
                    c
                  </span>
                  <span role="img" aria-label="emoji">
                    k
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
                    A
                  </span>
                  <span role="img" aria-label="emoji">
                    b
                  </span>
                  <span role="img" aria-label="emoji">
                    y
                  </span>
                  <span role="img" aria-label="emoji">
                    s
                  </span>
                  <span role="img" aria-label="emoji">
                    s
                  </span>
                  ''
                </>
              }
            </Link>
            <div className="flex space-x-6">
              <Link
                href="/abyss/games/petal-collection"
                className="text-gray-300 transition-colors hover:text-pink-400"
              >
                {
                  <>
                    ''
                    <span role="img" aria-label="emoji">
                      P
                    </span>
                    <span role="img" aria-label="emoji">
                      e
                    </span>
                    <span role="img" aria-label="emoji">
                      t
                    </span>
                    <span role="img" aria-label="emoji">
                      a
                    </span>
                    <span role="img" aria-label="emoji">
                      l
                    </span>
                    ' '
                    <span role="img" aria-label="emoji">
                      C
                    </span>
                    <span role="img" aria-label="emoji">
                      o
                    </span>
                    <span role="img" aria-label="emoji">
                      l
                    </span>
                    <span role="img" aria-label="emoji">
                      l
                    </span>
                    <span role="img" aria-label="emoji">
                      e
                    </span>
                    <span role="img" aria-label="emoji">
                      c
                    </span>
                    <span role="img" aria-label="emoji">
                      t
                    </span>
                    <span role="img" aria-label="emoji">
                      i
                    </span>
                    <span role="img" aria-label="emoji">
                      o
                    </span>
                    <span role="img" aria-label="emoji">
                      n
                    </span>
                    ''
                  </>
                }
              </Link>
              {/* Add more game links here as they are created */}
            </div>
          </div>
        </div>
      </nav>
      {/* Main Content */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="container mx-auto px-4 py-8"
      >
        {children}
      </motion.main>
    </div>
  );
}
