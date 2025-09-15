// DEPRECATED: This component is a duplicate. Use app\sign-in\[[...sign-in]]\page.tsx instead.
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import LoadingBonfire from '../../components/ui/LoadingBonfire';

export default function BonfirePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-900 via-black to-gray-900 p-4">
      <h1 className="mb-8 text-4xl font-bold text-pink-400">
        {
          <>
            <span role="img" aria-label="emoji">
              B
            </span>
            <span role="img" aria-label="emoji">
              o
            </span>
            <span role="img" aria-label="emoji">
              n
            </span>
            <span role="img" aria-label="emoji">
              f
            </span>
            <span role="img" aria-label="emoji">
              i
            </span>
            <span role="img" aria-label="emoji">
              r
            </span>
            <span role="img" aria-label="emoji">
              e
            </span>
          </>
        }
      </h1>
      <p className="mb-8 max-w-md text-center text-white/70">
        {
          <>
            '' "
            <span role="img" aria-label="emoji">
              I
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
              d
            </span>
            <span role="img" aria-label="emoji">
              e
            </span>
            <span role="img" aria-label="emoji">
              p
            </span>
            <span role="img" aria-label="emoji">
              t
            </span>
            <span role="img" aria-label="emoji">
              h
            </span>
            <span role="img" aria-label="emoji">
              s
            </span>
            ' '
            <span role="img" aria-label="emoji">
              o
            </span>
            <span role="img" aria-label="emoji">
              f
            </span>
            ' '
            <span role="img" aria-label="emoji">
              d
            </span>
            <span role="img" aria-label="emoji">
              a
            </span>
            <span role="img" aria-label="emoji">
              r
            </span>
            <span role="img" aria-label="emoji">
              k
            </span>
            <span role="img" aria-label="emoji">
              n
            </span>
            <span role="img" aria-label="emoji">
              e
            </span>
            <span role="img" aria-label="emoji">
              s
            </span>
            <span role="img" aria-label="emoji">
              s
            </span>
            ,' '
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
              b
            </span>
            <span role="img" aria-label="emoji">
              o
            </span>
            <span role="img" aria-label="emoji">
              n
            </span>
            <span role="img" aria-label="emoji">
              f
            </span>
            <span role="img" aria-label="emoji">
              i
            </span>
            <span role="img" aria-label="emoji">
              r
            </span>
            <span role="img" aria-label="emoji">
              e
            </span>
            ' '
            <span role="img" aria-label="emoji">
              s
            </span>
            <span role="img" aria-label="emoji">
              t
            </span>
            <span role="img" aria-label="emoji">
              a
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
              a
            </span>
            <span role="img" aria-label="emoji">
              s
            </span>
            ' '
            <span role="img" aria-label="emoji">
              a
            </span>
            ' '
            <span role="img" aria-label="emoji">
              b
            </span>
            <span role="img" aria-label="emoji">
              e
            </span>
            <span role="img" aria-label="emoji">
              a
            </span>
            <span role="img" aria-label="emoji">
              c
            </span>
            <span role="img" aria-label="emoji">
              o
            </span>
            <span role="img" aria-label="emoji">
              n
            </span>
            ' '
            <span role="img" aria-label="emoji">
              o
            </span>
            <span role="img" aria-label="emoji">
              f
            </span>
            ' '
            <span role="img" aria-label="emoji">
              h
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
            .' '
            <span role="img" aria-label="emoji">
              R
            </span>
            <span role="img" aria-label="emoji">
              e
            </span>
            <span role="img" aria-label="emoji">
              s
            </span>
            <span role="img" aria-label="emoji">
              t
            </span>
            ' '
            <span role="img" aria-label="emoji">
              h
            </span>
            <span role="img" aria-label="emoji">
              e
            </span>
            <span role="img" aria-label="emoji">
              r
            </span>
            <span role="img" aria-label="emoji">
              e
            </span>
            ,' '
            <span role="img" aria-label="emoji">
              g
            </span>
            <span role="img" aria-label="emoji">
              a
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
            ' '
            <span role="img" aria-label="emoji">
              y
            </span>
            <span role="img" aria-label="emoji">
              o
            </span>
            <span role="img" aria-label="emoji">
              u
            </span>
            <span role="img" aria-label="emoji">
              r
            </span>
            <span role="img" aria-label="emoji">
              s
            </span>
            <span role="img" aria-label="emoji">
              t
            </span>
            <span role="img" aria-label="emoji">
              r
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
              t
            </span>
            <span role="img" aria-label="emoji">
              h
            </span>
            ,' '
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
              p
            </span>
            <span role="img" aria-label="emoji">
              r
            </span>
            <span role="img" aria-label="emoji">
              e
            </span>
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
              e
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
              j
            </span>
            <span role="img" aria-label="emoji">
              o
            </span>
            <span role="img" aria-label="emoji">
              u
            </span>
            <span role="img" aria-label="emoji">
              r
            </span>
            <span role="img" aria-label="emoji">
              n
            </span>
            <span role="img" aria-label="emoji">
              e
            </span>
            <span role="img" aria-label="emoji">
              y
            </span>
            ' '
            <span role="img" aria-label="emoji">
              a
            </span>
            <span role="img" aria-label="emoji">
              h
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
            ." ''
          </>
        }
      </p>
      <LoadingBonfire />
    </div>
  );
}
