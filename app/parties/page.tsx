
'use client';

import { Suspense } from 'react';
import { motion } from 'framer-motion';
import PartyHub from '../components/PartyHub';
import GlassCard from '../components/ui/GlassCard';

// Metadata is handled by layout.tsx for client components

export default function PartiesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold text-white mb-4">
              {
                <>
                  <span role="img" aria-label="emoji">
                    P
                  </span>
                  <span role="img" aria-label="emoji">
                    a
                  </span>
                  <span role="img" aria-label="emoji">
                    r
                  </span>
                  <span role="img" aria-label="emoji">
                    t
                  </span>
                  <span role="img" aria-label="emoji">
                    y
                  </span>
                  ' '
                  <span role="img" aria-label="emoji">
                    H
                  </span>
                  <span role="img" aria-label="emoji">
                    u
                  </span>
                  <span role="img" aria-label="emoji">
                    b
                  </span>
                </>
              }
            </h1>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              {
                <>
                  ''
                  <span role="img" aria-label="emoji">
                    C
                  </span>
                  <span role="img" aria-label="emoji">
                    r
                  </span>
                  <span role="img" aria-label="emoji">
                    e
                  </span>
                  <span role="img" aria-label="emoji">
                    a
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
                    r
                  </span>
                  ' '
                  <span role="img" aria-label="emoji">
                    j
                  </span>
                  <span role="img" aria-label="emoji">
                    o
                  </span>
                  <span role="img" aria-label="emoji">
                    i
                  </span>
                  <span role="img" aria-label="emoji">
                    n
                  </span>
                  ' '
                  <span role="img" aria-label="emoji">
                    p
                  </span>
                  <span role="img" aria-label="emoji">
                    a
                  </span>
                  <span role="img" aria-label="emoji">
                    r
                  </span>
                  <span role="img" aria-label="emoji">
                    t
                  </span>
                  <span role="img" aria-label="emoji">
                    i
                  </span>
                  <span role="img" aria-label="emoji">
                    e
                  </span>
                  <span role="img" aria-label="emoji">
                    s
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
                    p
                  </span>
                  <span role="img" aria-label="emoji">
                    l
                  </span>
                  <span role="img" aria-label="emoji">
                    a
                  </span>
                  <span role="img" aria-label="emoji">
                    y
                  </span>
                  ' '
                  <span role="img" aria-label="emoji">
                    m
                  </span>
                  <span role="img" aria-label="emoji">
                    i
                  </span>
                  <span role="img" aria-label="emoji">
                    n
                  </span>
                  <span role="img" aria-label="emoji">
                    i
                  </span>
                  -
                  <span role="img" aria-label="emoji">
                    g
                  </span>
                  <span role="img" aria-label="emoji">
                    a
                  </span>
                  <span role="img" aria-label="emoji">
                    m
                  </span>
                  <span role="img" aria-label="emoji">
                    e
                  </span>
                  <span role="img" aria-label="emoji">
                    s
                  </span>
                  ' '
                  <span role="img" aria-label="emoji">
                    t
                  </span>
                  <span role="img" aria-label="emoji">
                    o
                  </span>
                  <span role="img" aria-label="emoji">
                    g
                  </span>
                  <span role="img" aria-label="emoji">
                    e
                  </span>
                  <span role="img" aria-label="emoji">
                    t
                  </span>
                  <span role="img" aria-label="emoji">
                    h
                  </span>
                  <span role="img" aria-label="emoji">
                    e
                  </span>
                  <span role="img" aria-label="emoji">
                    r
                  </span>
                  .' '
                  <span role="img" aria-label="emoji">
                    T
                  </span>
                  <span role="img" aria-label="emoji">
                    e
                  </span>
                  <span role="img" aria-label="emoji">
                    a
                  </span>
                  <span role="img" aria-label="emoji">
                    m
                  </span>
                  ' '
                  <span role="img" aria-label="emoji">
                    u
                  </span>
                  <span role="img" aria-label="emoji">
                    p
                  </span>
                  ' '
                  <span role="img" aria-label="emoji">
                    w
                  </span>
                  <span role="img" aria-label="emoji">
                    i
                  </span>
                  <span role="img" aria-label="emoji">
                    t
                  </span>
                  <span role="img" aria-label="emoji">
                    h
                  </span>
                  ' '
                  <span role="img" aria-label="emoji">
                    f
                  </span>
                  <span role="img" aria-label="emoji">
                    r
                  </span>
                  <span role="img" aria-label="emoji">
                    i
                  </span>
                  <span role="img" aria-label="emoji">
                    e
                  </span>
                  <span role="img" aria-label="emoji">
                    n
                  </span>
                  <span role="img" aria-label="emoji">
                    d
                  </span>
                  <span role="img" aria-label="emoji">
                    s
                  </span>
                  ' '
                  <span role="img" aria-label="emoji">
                    f
                  </span>
                  <span role="img" aria-label="emoji">
                    o
                  </span>
                  <span role="img" aria-label="emoji">
                    r
                  </span>
                  <span role="img" aria-label="emoji">
                    c
                  </span>
                  <span role="img" aria-label="emoji">
                    o
                  </span>
                  <span role="img" aria-label="emoji">
                    o
                  </span>
                  <span role="img" aria-label="emoji">
                    p
                  </span>
                  <span role="img" aria-label="emoji">
                    e
                  </span>
                  <span role="img" aria-label="emoji">
                    r
                  </span>
                  <span role="img" aria-label="emoji">
                    a
                  </span>
                  <span role="img" aria-label="emoji">
                    t
                  </span>
                  <span role="img" aria-label="emoji">
                    i
                  </span>
                  <span role="img" aria-label="emoji">
                    v
                  </span>
                  <span role="img" aria-label="emoji">
                    e
                  </span>
                  ' '
                  <span role="img" aria-label="emoji">
                    a
                  </span>
                  <span role="img" aria-label="emoji">
                    d
                  </span>
                  <span role="img" aria-label="emoji">
                    v
                  </span>
                  <span role="img" aria-label="emoji">
                    e
                  </span>
                  <span role="img" aria-label="emoji">
                    n
                  </span>
                  <span role="img" aria-label="emoji">
                    t
                  </span>
                  <span role="img" aria-label="emoji">
                    u
                  </span>
                  <span role="img" aria-label="emoji">
                    r
                  </span>
                  <span role="img" aria-label="emoji">
                    e
                  </span>
                  <span role="img" aria-label="emoji">
                    s
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
                    i
                  </span>
                  <span role="img" aria-label="emoji">
                    t
                  </span>
                  <span role="img" aria-label="emoji">
                    i
                  </span>
                  <span role="img" aria-label="emoji">
                    v
                  </span>
                  <span role="img" aria-label="emoji">
                    e
                  </span>
                  ' '
                  <span role="img" aria-label="emoji">
                    c
                  </span>
                  <span role="img" aria-label="emoji">
                    h
                  </span>
                  <span role="img" aria-label="emoji">
                    a
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
                    n
                  </span>
                  <span role="img" aria-label="emoji">
                    g
                  </span>
                  <span role="img" aria-label="emoji">
                    e
                  </span>
                  <span role="img" aria-label="emoji">
                    s
                  </span>
                  . ''
                </>
              }
            </p>
          </motion.div>

          <Suspense
            fallback={
              <GlassCard className="p-8 text-center">
                <div className="animate-pulse">
                  <div className="h-6 bg-white/10 rounded mb-4"></div>
                  <div className="h-4 bg-white/5 rounded mb-2"></div>
                  <div className="h-4 bg-white/5 rounded w-3/4 mx-auto"></div>
                </div>
              </GlassCard>
            }
          >
            <PartyHub />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
