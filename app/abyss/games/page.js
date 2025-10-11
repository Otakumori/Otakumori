// DEPRECATED: This component is a duplicate. Use app\sign-in\[[...sign-in]]\page.tsx instead.
'use client';

import { useUser } from '@clerk/nextjs';
import { useState } from 'react';
import Link from 'next/link';

export default function GamesPage() {
  const { user, isLoaded } = useUser();
  const [_selectedGame, _setSelectedGame] = useState(null);

  if (!isLoaded) {
    return (
      <div>
        {
          <>
            <span role="img" aria-label="emoji">
              L
            </span>
            <span role="img" aria-label="emoji">
              o
            </span>
            <span role="img" aria-label="emoji">
              a
            </span>
            <span role="img" aria-label="emoji">
              d
            </span>
            <span role="img" aria-label="emoji">
              i
            </span>
            <span role="img" aria-label="emoji">
              n
            </span>
            <span role="img" aria-label="emoji">
              g
            </span>
            ...
          </>
        }
      </div>
    );
  }

  if (!user) {
    return (
      <div>
        {
          <>
            <span role="img" aria-label="emoji">
              P
            </span>
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
              s
            </span>
            <span role="img" aria-label="emoji">
              e
            </span>
            ' '
            <span role="img" aria-label="emoji">
              s
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
              a
            </span>
            <span role="img" aria-label="emoji">
              c
            </span>
            <span role="img" aria-label="emoji">
              c
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
          </>
        }
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">
        {
          <>
            <span role="img" aria-label="emoji">
              G
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
          </>
        }
      </h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Link
          href="/abyss/games/mini-games"
          className="rounded-lg border p-6 transition-shadow hover:shadow-lg"
        >
          <h2 className="mb-2 text-2xl font-semibold">
            {
              <>
                <span role="img" aria-label="emoji">
                  M
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
                ' '
                <span role="img" aria-label="emoji">
                  G
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
              </>
            }
          </h2>
          <p>
            {
              <>
                <span role="img" aria-label="emoji">
                  P
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
                  q
                </span>
                <span role="img" aria-label="emoji">
                  u
                </span>
                <span role="img" aria-label="emoji">
                  i
                </span>
                <span role="img" aria-label="emoji">
                  c
                </span>
                <span role="img" aria-label="emoji">
                  k
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
                  f
                </span>
                <span role="img" aria-label="emoji">
                  u
                </span>
                <span role="img" aria-label="emoji">
                  n
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
                ' '
                <span role="img" aria-label="emoji">
                  e
                </span>
                <span role="img" aria-label="emoji">
                  a
                </span>
                <span role="img" aria-label="emoji">
                  r
                </span>
                <span role="img" aria-label="emoji">
                  n
                </span>
                ' '
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
                  a
                </span>
                <span role="img" aria-label="emoji">
                  l
                </span>
                <span role="img" aria-label="emoji">
                  s
                </span>
                !
              </>
            }
          </p>
        </Link>
        <Link
          href="/abyss/games/petal-collection"
          className="rounded-lg border p-6 transition-shadow hover:shadow-lg"
        >
          <h2 className="mb-2 text-2xl font-semibold">
            {
              <>
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
              </>
            }
          </h2>
          <p>
            {
              <>
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
                  m
                </span>
                <span role="img" aria-label="emoji">
                  a
                </span>
                <span role="img" aria-label="emoji">
                  n
                </span>
                <span role="img" aria-label="emoji">
                  a
                </span>
                <span role="img" aria-label="emoji">
                  g
                </span>
                <span role="img" aria-label="emoji">
                  e
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
                  p
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
                <span role="img" aria-label="emoji">
                  s
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
                  h
                </span>
                <span role="img" aria-label="emoji">
                  i
                </span>
                <span role="img" aria-label="emoji">
                  s
                </span>
                ' '
                <span role="img" aria-label="emoji">
                  s
                </span>
                <span role="img" aria-label="emoji">
                  p
                </span>
                <span role="img" aria-label="emoji">
                  e
                </span>
                <span role="img" aria-label="emoji">
                  c
                </span>
                <span role="img" aria-label="emoji">
                  i
                </span>
                <span role="img" aria-label="emoji">
                  a
                </span>
                <span role="img" aria-label="emoji">
                  l
                </span>
                ' '
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
                .
              </>
            }
          </p>
        </Link>
      </div>
    </div>
  );
}
