import Layout from '../components/Layout';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';

export default function Profile() {
  const [_user, setUser] = useState(null);
  const [avatar, setAvatar] = useState('/assets/default-avatar.png');
  const [petals, setPetals] = useState(0);
  const { user: clerkUser, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && clerkUser) {
      setUser(clerkUser);
      // TODO: Replace with Prisma API call when migration is complete
      // For now, use placeholder data
      setAvatar('/assets/default-avatar.png');
      setPetals(0);
    }
  }, [clerkUser, isLoaded]);

  if (!isLoaded) {
    return (
      <Layout>
        <div className="rounded-xl bg-gray-800 p-8 text-center text-white">
          <div className="animate-pulse">
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
        </div>
      </Layout>
    );
  }

  if (!clerkUser) {
    return (
      <Layout>
        <div className="rounded-xl bg-gray-800 p-8 text-center text-white">
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
                  r
                </span>
                <span role="img" aria-label="emoji">
                  o
                </span>
                <span role="img" aria-label="emoji">
                  f
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
              </>
            }
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="rounded-xl bg-gray-800 p-8 text-center text-white">
        <Image
          src={avatar}
          alt="Profile Avatar"
          width={160}
          height={160}
          className="mx-auto rounded-full"
        />
        <h2 className="mt-4 text-4xl">
          {
            <>
              ''
              <span role="img" aria-label="emoji">
                C
              </span>
              <span role="img" aria-label="emoji">
                o
              </span>
              <span role="img" aria-label="emoji">
                m
              </span>
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
                d
              </span>
              <span role="img" aria-label="emoji">
                e
              </span>
              <span role="img" aria-label="emoji">
                r
              </span>
              ' '''
            </>
          }
          {clerkUser.emailAddresses[0]?.emailAddress || 'Loading...'}
        </h2>
        <p className="mt-2">
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
              <span role="img" aria-label="emoji">
                s
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
                e
              </span>
              <span role="img" aria-label="emoji">
                d
              </span>
              <span role="img" aria-label="emoji">
                :
              </span>
              ' '''
            </>
          }
          <span role="img" aria-label="cherry blossom">
            
          </span>{' '}
          {petals}
        </p>
        <button className="mt-4 rounded-lg bg-pink-500 px-4 py-2 transition hover:bg-pink-600">
          {
            <>
              ''
              <span role="img" aria-label="emoji">
                E
              </span>
              <span role="img" aria-label="emoji">
                d
              </span>
              <span role="img" aria-label="emoji">
                i
              </span>
              <span role="img" aria-label="emoji">
                t
              </span>
              ' '
              <span role="img" aria-label="emoji">
                P
              </span>
              <span role="img" aria-label="emoji">
                r
              </span>
              <span role="img" aria-label="emoji">
                o
              </span>
              <span role="img" aria-label="emoji">
                f
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
              ''
            </>
          }
        </button>
      </div>
    </Layout>
  );
}
