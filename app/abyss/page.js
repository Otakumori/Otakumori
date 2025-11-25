
'use client';

import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePetalContext, useOverlordContext } from '../../providers';

const features = [
  {
    title: 'Games',
    description: 'Play games to earn petals and experience',
    icon: '',
    path: '/abyss/games',
    color: 'from-purple-500 to-pink-500',
  },
  {
    title: 'Gallery',
    description: 'Browse and collect artwork',
    icon: '',
    path: '/abyss/gallery',
    color: 'from-blue-500 to-purple-500',
  },
  {
    title: 'Shop',
    description: 'Spend your petals on special items',
    icon: '',
    path: '/abyss/shop',
    color: 'from-green-500 to-blue-500',
  },
  {
    title: 'Community',
    description: 'Connect with other users',
    icon: '',
    path: '/abyss/community',
    color: 'from-yellow-500 to-orange-500',
  },
];

const sampleQuests = [
  {
    id: '1',
    title: 'First Steps',
    description: 'Complete your first game in the Abyss',
    reward: 50,
  },
  {
    id: '2',
    title: 'Art Collector',
    description: 'Visit the gallery and view 5 artworks',
    reward: 30,
  },
  {
    id: '3',
    title: 'Social Butterfly',
    description: 'Make your first post in the community',
    reward: 25,
  },
];

export default function AbyssPage() {
  const { user, isLoaded } = useUser();
  const [_currentSection, _setCurrentSection] = useState('main');
  const [isLoading, setIsLoading] = useState(true);
  const { petals: _petals, addPetals } = usePetalContext();
  const { quests, addQuest } = useOverlordContext();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    // Add sample quests
    sampleQuests.forEach((quest) => {
      if (!quests.find((q) => q.id === quest.id)) {
        addQuest(quest);
      }
    });

    return () => clearTimeout(timer);
  }, [quests, addQuest]);

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
          </>
        }
      </div>
    );
  }

  const handleStartQuest = (quest) => {
    // Simulate quest completion
    setTimeout(() => {
      addPetals(quest.reward);
      // Remove quest from list
      const _updatedQuests = quests.filter((q) => q.id !== quest.id);
      // Update quests in store - this would need to be handled differently
      // For now, we'll just remove the quest from the local state
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="mb-4 text-4xl font-bold text-white">
          {
            <>
              ''
              <span role="img" aria-label="emoji">
                W
              </span>
              <span role="img" aria-label="emoji">
                e
              </span>
              <span role="img" aria-label="emoji">
                l
              </span>
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
                e
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
              ,' '''
            </>
          }
          {user?.firstName}
        </h1>
        <p className="text-gray-400">
          {
            <>
              ''
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
                i
              </span>
              <span role="img" aria-label="emoji">
                n
              </span>
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
                b
              </span>
              <span role="img" aria-label="emoji">
                e
              </span>
              <span role="img" aria-label="emoji">
                g
              </span>
              <span role="img" aria-label="emoji">
                i
              </span>
              <span role="img" aria-label="emoji">
                n
              </span>
              <span role="img" aria-label="emoji">
                s
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
              .' '
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
              ,' '
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
                e
              </span>
              ' '
              <span role="img" aria-label="emoji">
                q
              </span>
              <span role="img" aria-label="emoji">
                u
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
              <span role="img" aria-label="emoji">
                s
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
                e
              </span>
              <span role="img" aria-label="emoji">
                x
              </span>
              <span role="img" aria-label="emoji">
                p
              </span>
              <span role="img" aria-label="emoji">
                l
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
              <span role="img" aria-label="emoji">
                y
              </span>
              <span role="img" aria-label="emoji">
                s
              </span>
              <span role="img" aria-label="emoji">
                t
              </span>
              <span role="img" aria-label="emoji">
                e
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
                a
              </span>
              <span role="img" aria-label="emoji">
                t
              </span>
              ' '
              <span role="img" aria-label="emoji">
                a
              </span>
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
              . ''
            </>
          }
        </p>
      </motion.div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative overflow-hidden rounded-lg bg-gradient-to-br ${feature.color} p-6`}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <div className="relative z-10">
              <span className="mb-4 block text-4xl">{feature.icon}</span>
              <h3 className="mb-2 text-xl font-bold text-white">{feature.title}</h3>
              <p className="mb-4 text-gray-200">{feature.description}</p>
              <a
                href={feature.path}
                className="inline-block rounded-lg bg-white/10 px-4 py-2 text-white transition-colors hover:bg-white/20"
              >
                {
                  <>
                    ''
                    <span role="img" aria-label="emoji">
                      E
                    </span>
                    <span role="img" aria-label="emoji">
                      x
                    </span>
                    <span role="img" aria-label="emoji">
                      p
                    </span>
                    <span role="img" aria-label="emoji">
                      l
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
                    ''
                  </>
                }
              </a>
            </div>
          </motion.div>
        ))}
      </div>
      {quests.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
          <h2 className="mb-4 text-2xl font-bold text-white">
            {
              <>
                <span role="img" aria-label="emoji">
                  A
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
                  v
                </span>
                <span role="img" aria-label="emoji">
                  e
                </span>
                ' '
                <span role="img" aria-label="emoji">
                  Q
                </span>
                <span role="img" aria-label="emoji">
                  u
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
                <span role="img" aria-label="emoji">
                  s
                </span>
              </>
            }
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {quests.map((quest) => (
              <div
                key={quest.id}
                className="rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
              >
                <h3 className="mb-2 text-lg font-semibold text-white">{quest.title}</h3>
                <p className="mb-2 text-gray-400">{quest.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-pink-500">
                    {
                      <>
                        <span role="img" aria-label="emoji">
                          R
                        </span>
                        <span role="img" aria-label="emoji">
                          e
                        </span>
                        <span role="img" aria-label="emoji">
                          w
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
                        <span role="img" aria-label="emoji">
                          :
                        </span>
                        ' '''
                      </>
                    }
                    {quest.reward}
                    {
                      <>
                        ''' '
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
                      </>
                    }
                  </span>
                  <button
                    onClick={() => handleStartQuest(quest)}
                    className="rounded bg-pink-500/20 px-3 py-1 text-white transition-colors hover:bg-pink-500/30"
                  >
                    {
                      <>
                        ''
                        <span role="img" aria-label="emoji">
                          S
                        </span>
                        <span role="img" aria-label="emoji">
                          t
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
                        ' '
                        <span role="img" aria-label="emoji">
                          Q
                        </span>
                        <span role="img" aria-label="emoji">
                          u
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
                        ''
                      </>
                    }
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
