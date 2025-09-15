// DEPRECATED: This component is a duplicate. Use app\sign-in\[[...sign-in]]\page.tsx instead.
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Wishlist | Otaku-mori',
  description: 'Your wishlist of favorite items',
};

export default async function WishlistPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-semibold mb-6">
        {
          <>
            <span role="img" aria-label="emoji">
              M
            </span>
            <span role="img" aria-label="emoji">
              y
            </span>
            ' '
            <span role="img" aria-label="emoji">
              W
            </span>
            <span role="img" aria-label="emoji">
              i
            </span>
            <span role="img" aria-label="emoji">
              s
            </span>
            <span role="img" aria-label="emoji">
              h
            </span>
            <span role="img" aria-label="emoji">
              l
            </span>
            <span role="img" aria-label="emoji">
              i
            </span>
            <span role="img" aria-label="emoji">
              s
            </span>
            <span role="img" aria-label="emoji">
              t
            </span>
          </>
        }
      </h1>
      <div className="bg-gray-900/50 rounded-lg p-8 text-center">
        <p className="text-gray-400 mb-4">
          {
            <>
              <span role="img" aria-label="emoji">
                Y
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
                w
              </span>
              <span role="img" aria-label="emoji">
                i
              </span>
              <span role="img" aria-label="emoji">
                s
              </span>
              <span role="img" aria-label="emoji">
                h
              </span>
              <span role="img" aria-label="emoji">
                l
              </span>
              <span role="img" aria-label="emoji">
                i
              </span>
              <span role="img" aria-label="emoji">
                s
              </span>
              <span role="img" aria-label="emoji">
                t
              </span>
              ' '
              <span role="img" aria-label="emoji">
                i
              </span>
              <span role="img" aria-label="emoji">
                s
              </span>
              ' '
              <span role="img" aria-label="emoji">
                c
              </span>
              <span role="img" aria-label="emoji">
                u
              </span>
              <span role="img" aria-label="emoji">
                r
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
                t
              </span>
              <span role="img" aria-label="emoji">
                l
              </span>
              <span role="img" aria-label="emoji">
                y
              </span>
              ' '
              <span role="img" aria-label="emoji">
                e
              </span>
              <span role="img" aria-label="emoji">
                m
              </span>
              <span role="img" aria-label="emoji">
                p
              </span>
              <span role="img" aria-label="emoji">
                t
              </span>
              <span role="img" aria-label="emoji">
                y
              </span>
            </>
          }
        </p>
        <p className="text-sm text-gray-500">
          {
            <>
              <span role="img" aria-label="emoji">
                A
              </span>
              <span role="img" aria-label="emoji">
                d
              </span>
              <span role="img" aria-label="emoji">
                d
              </span>
              ' '
              <span role="img" aria-label="emoji">
                i
              </span>
              <span role="img" aria-label="emoji">
                t
              </span>
              <span role="img" aria-label="emoji">
                e
              </span>
              <span role="img" aria-label="emoji">
                m
              </span>
              <span role="img" aria-label="emoji">
                s
              </span>
              ' '
              <span role="img" aria-label="emoji">
                f
              </span>
              <span role="img" aria-label="emoji">
                r
              </span>
              <span role="img" aria-label="emoji">
                o
              </span>
              <span role="img" aria-label="emoji">
                m
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
                h
              </span>
              <span role="img" aria-label="emoji">
                o
              </span>
              <span role="img" aria-label="emoji">
                p
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
                s
              </span>
              <span role="img" aria-label="emoji">
                e
              </span>
              <span role="img" aria-label="emoji">
                e
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
              <span role="img" aria-label="emoji">
                m
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
            </>
          }
        </p>
      </div>
    </main>
  );
}
