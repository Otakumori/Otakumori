
'use client';

import { generateSEO } from '@/app/lib/seo';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

export function generateMetadata() {
  return generateSEO({
    title: 'Page',
    description: 'Anime x gaming shop + play — petals, runes, rewards.',
    url: '/login',
  });
}
export default function LoginPage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn) {
        // User is already signed in, redirect to home
        router.push('/');
      } else {
        // User is not signed in, redirect to Clerk's sign-in
        window.location.href = '/sign-in';
      }
    }
  }, [isLoaded, isSignedIn, router]);

  // Show loading while redirecting
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">
          {
            <>
              <span role="img" aria-label="emoji">
                R
              </span>
              <span role="img" aria-label="emoji">
                e
              </span>
              <span role="img" aria-label="emoji">
                d
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
                n
              </span>
              <span role="img" aria-label="emoji">
                g
              </span>
              ...
            </>
          }
        </h1>
        <p className="text-gray-600">
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
                w
              </span>
              <span role="img" aria-label="emoji">
                a
              </span>
              <span role="img" aria-label="emoji">
                i
              </span>
              <span role="img" aria-label="emoji">
                t
              </span>
              ' '
              <span role="img" aria-label="emoji">
                w
              </span>
              <span role="img" aria-label="emoji">
                h
              </span>
              <span role="img" aria-label="emoji">
                i
              </span>
              <span role="img" aria-label="emoji">
                l
              </span>
              <span role="img" aria-label="emoji">
                e
              </span>
              ' '
              <span role="img" aria-label="emoji">
                w
              </span>
              <span role="img" aria-label="emoji">
                e
              </span>
              ' '
              <span role="img" aria-label="emoji">
                r
              </span>
              <span role="img" aria-label="emoji">
                e
              </span>
              <span role="img" aria-label="emoji">
                d
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
              <span role="img" aria-label="emoji">
                c
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
              ' '
              <span role="img" aria-label="emoji">
                t
              </span>
              <span role="img" aria-label="emoji">
                o
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
              -
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
                g
              </span>
              <span role="img" aria-label="emoji">
                e
              </span>
              .
            </>
          }
        </p>
      </div>
    </main>
  );
}
