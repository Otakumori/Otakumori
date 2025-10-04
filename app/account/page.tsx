// DEPRECATED: This component is a duplicate. Use app\sign-in\[[...sign-in]]\page.tsx instead.
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { UsernameSuggestion } from '@/components/UsernameSuggestion';

export default async function AccountPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">
            {
              <>
                <span role="img" aria-label="emoji">
                  A
                </span>
                <span role="img" aria-label="emoji">
                  c
                </span>
                <span role="img" aria-label="emoji">
                  c
                </span>
                <span role="img" aria-label="emoji">
                  o
                </span>
                <span role="img" aria-label="emoji">
                  u
                </span>
                <span role="img" aria-label="emoji">
                  n
                </span>
                <span role="img" aria-label="emoji">
                  t
                </span>
              </>
            }
          </h1>
          <UserButton afterSignOutUrl="/" />
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Profile Section */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              {
                <>
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
                </>
              }
            </h2>
            <UsernameSuggestion
              onUsernameSelect={(username) => {
                // Username selected
                // TODO: Implement username update logic
              }}
            />
          </div>

          {/* Settings Section */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              {
                <>
                  <span role="img" aria-label="emoji">
                    S
                  </span>
                  <span role="img" aria-label="emoji">
                    e
                  </span>
                  <span role="img" aria-label="emoji">
                    t
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
                  <span role="img" aria-label="emoji">
                    s
                  </span>
                </>
              }
            </h2>
            <p className="text-gray-600">
              {
                <>
                  ''
                  <span role="img" aria-label="emoji">
                    A
                  </span>
                  <span role="img" aria-label="emoji">
                    c
                  </span>
                  <span role="img" aria-label="emoji">
                    c
                  </span>
                  <span role="img" aria-label="emoji">
                    o
                  </span>
                  <span role="img" aria-label="emoji">
                    u
                  </span>
                  <span role="img" aria-label="emoji">
                    n
                  </span>
                  <span role="img" aria-label="emoji">
                    t
                  </span>
                  ' '
                  <span role="img" aria-label="emoji">
                    s
                  </span>
                  <span role="img" aria-label="emoji">
                    e
                  </span>
                  <span role="img" aria-label="emoji">
                    t
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
                    p
                  </span>
                  <span role="img" aria-label="emoji">
                    r
                  </span>
                  <span role="img" aria-label="emoji">
                    e
                  </span>
                  <span role="img" aria-label="emoji">
                    f
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
                  <span role="img" aria-label="emoji">
                    n
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
                  ' '
                  <span role="img" aria-label="emoji">
                    w
                  </span>
                  <span role="img" aria-label="emoji">
                    i
                  </span>
                  <span role="img" aria-label="emoji">
                    l
                  </span>
                  <span role="img" aria-label="emoji">
                    l
                  </span>
                  ' '
                  <span role="img" aria-label="emoji">
                    b
                  </span>
                  <span role="img" aria-label="emoji">
                    e
                  </span>
                  ' '
                  <span role="img" aria-label="emoji">
                    a
                  </span>
                  <span role="img" aria-label="emoji">
                    v
                  </span>
                  <span role="img" aria-label="emoji">
                    a
                  </span>
                  <span role="img" aria-label="emoji">
                    i
                  </span>
                  <span role="img" aria-label="emoji">
                    l
                  </span>
                  <span role="img" aria-label="emoji">
                    a
                  </span>
                  <span role="img" aria-label="emoji">
                    b
                  </span>
                  <span role="img" aria-label="emoji">
                    l
                  </span>
                  <span role="img" aria-label="emoji">
                    e
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
                  . ''
                </>
              }
            </p>
          </div>

          {/* Orders Section */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              {
                <>
                  <span role="img" aria-label="emoji">
                    O
                  </span>
                  <span role="img" aria-label="emoji">
                    r
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
                    s
                  </span>
                </>
              }
            </h2>
            <p className="text-gray-600">
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
                    o
                  </span>
                  <span role="img" aria-label="emoji">
                    r
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
                  ' '
                  <span role="img" aria-label="emoji">
                    h
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
                  <span role="img" aria-label="emoji">
                    o
                  </span>
                  <span role="img" aria-label="emoji">
                    r
                  </span>
                  <span role="img" aria-label="emoji">
                    y
                  </span>
                  ' '
                  <span role="img" aria-label="emoji">
                    w
                  </span>
                  <span role="img" aria-label="emoji">
                    i
                  </span>
                  <span role="img" aria-label="emoji">
                    l
                  </span>
                  <span role="img" aria-label="emoji">
                    l
                  </span>
                  ' '
                  <span role="img" aria-label="emoji">
                    a
                  </span>
                  <span role="img" aria-label="emoji">
                    p
                  </span>
                  <span role="img" aria-label="emoji">
                    p
                  </span>
                  <span role="img" aria-label="emoji">
                    e
                  </span>
                  <span role="img" aria-label="emoji">
                    a
                  </span>
                  <span role="img" aria-label="emoji">
                    r
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
                  .
                </>
              }
            </p>
          </div>

          {/* Petals Section */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
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
                    B
                  </span>
                  <span role="img" aria-label="emoji">
                    a
                  </span>
                  <span role="img" aria-label="emoji">
                    l
                  </span>
                  <span role="img" aria-label="emoji">
                    a
                  </span>
                  <span role="img" aria-label="emoji">
                    n
                  </span>
                  <span role="img" aria-label="emoji">
                    c
                  </span>
                  <span role="img" aria-label="emoji">
                    e
                  </span>
                </>
              }
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-2xl"></span>
              <span className="text-lg font-medium text-gray-900">
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
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-600">
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
                    b
                  </span>
                  <span role="img" aria-label="emoji">
                    y
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
                    l
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
                    n
                  </span>
                  <span role="img" aria-label="emoji">
                    g
                  </span>
                  ' '
                  <span role="img" aria-label="emoji">
                    o
                  </span>
                  <span role="img" aria-label="emoji">
                    r
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
                  <span role="img" aria-label="emoji">
                    i
                  </span>
                  <span role="img" aria-label="emoji">
                    n
                  </span>
                  <span role="img" aria-label="emoji">
                    g
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
                  . ''
                </>
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
