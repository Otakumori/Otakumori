'use client';

import { useState } from 'react';

export default function OtakuMemo() {
  const [score, setScore] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-4xl font-bold mb-4">
          {
            <>
              <span role="img" aria-label="emoji">
                O
              </span>
              <span role="img" aria-label="emoji">
                t
              </span>
              <span role="img" aria-label="emoji">
                a
              </span>
              <span role="img" aria-label="emoji">
                k
              </span>
              <span role="img" aria-label="emoji">
                u
              </span>
              ' '
              <span role="img" aria-label="emoji">
                M
              </span>
              <span role="img" aria-label="emoji">
                e
              </span>
              <span role="img" aria-label="emoji">
                m
              </span>
              <span role="img" aria-label="emoji">
                o
              </span>
            </>
          }
        </h1>
        <p className="text-xl mb-8">
          {
            <>
              <span role="img" aria-label="emoji">
                T
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
              ' '
              <span role="img" aria-label="emoji">
                a
              </span>
              <span role="img" aria-label="emoji">
                n
              </span>
              <span role="img" aria-label="emoji">
                i
              </span>
              <span role="img" aria-label="emoji">
                m
              </span>
              <span role="img" aria-label="emoji">
                e
              </span>
              ' '
              <span role="img" aria-label="emoji">
                k
              </span>
              <span role="img" aria-label="emoji">
                n
              </span>
              <span role="img" aria-label="emoji">
                o
              </span>
              <span role="img" aria-label="emoji">
                w
              </span>
              <span role="img" aria-label="emoji">
                l
              </span>
              <span role="img" aria-label="emoji">
                e
              </span>
              <span role="img" aria-label="emoji">
                d
              </span>
              <span role="img" aria-label="emoji">
                g
              </span>
              <span role="img" aria-label="emoji">
                e
              </span>
              .
            </>
          }
        </p>
        <div className="text-2xl mb-4">
          {
            <>
              <span role="img" aria-label="emoji">
                S
              </span>
              <span role="img" aria-label="emoji">
                c
              </span>
              <span role="img" aria-label="emoji">
                o
              </span>
              <span role="img" aria-label="emoji">
                r
              </span>
              <span role="img" aria-label="emoji">
                e
              </span>
              <span role="img" aria-label="emoji">
                :
              </span>
              ' '''
            </>
          }
          {score}
        </div>
        <button
          className="bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-lg font-bold"
          onClick={() => setScore(score + 1)}
        >
          {
            <>
              ''
              <span role="img" aria-label="emoji">
                M
              </span>
              <span role="img" aria-label="emoji">
                e
              </span>
              <span role="img" aria-label="emoji">
                m
              </span>
              <span role="img" aria-label="emoji">
                o
              </span>
              ! ''
            </>
          }
        </button>
      </div>
    </div>
  );
}
