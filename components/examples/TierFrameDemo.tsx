'use client';

import React from 'react';
import FramedBadge from '@/components/graphics/FramedBadge';
import SoapstoneMessageCard from '@/components/soapstone/SoapstoneMessageCard';
import CategoryBanner from '@/components/graphics/CategoryBanner';

export default function TierFrameDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-purple-800 p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Category Banner Demo */}
        <section>
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            {
              <>
                ''
                <span role="img" aria-label="emoji">
                  A
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
                  a
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
                ' '
                <span role="img" aria-label="emoji">
                  C
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
                <span role="img" aria-label="emoji">
                  g
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
                  B
                </span>
                <span role="img" aria-label="emoji">
                  a
                </span>
                <span role="img" aria-label="emoji">
                  n
                </span>
                <span role="img" aria-label="emoji">
                  n
                </span>
                <span role="img" aria-label="emoji">
                  e
                </span>
                <span role="img" aria-label="emoji">
                  r
                </span>
                ''
              </>
            }
          </h2>
          <CategoryBanner
            title="T-Shirts"
            subtitle="Premium anime and gaming apparel • 24 products"
            animate={true}
          />
        </section>

        {/* Tier Frame Progression Demo */}
        <section>
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            {
              <>
                ''
                <span role="img" aria-label="emoji">
                  T
                </span>
                <span role="img" aria-label="emoji">
                  i
                </span>
                <span role="img" aria-label="emoji">
                  e
                </span>
                <span role="img" aria-label="emoji">
                  r
                </span>
                ' '
                <span role="img" aria-label="emoji">
                  F
                </span>
                <span role="img" aria-label="emoji">
                  r
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
                  g
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
                <span role="img" aria-label="emoji">
                  s
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
                ' '(
                <span role="img" aria-label="emoji">
                  1
                </span>
                -
                <span role="img" aria-label="emoji">
                  1
                </span>
                <span role="img" aria-label="emoji">
                  0
                </span>
                ) ''
              </>
            }
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 justify-items-center">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((tier) => (
              <div key={tier} className="text-center">
                <FramedBadge
                  tier={tier}
                  badgeKey="tier:demo"
                  label={`Tier ${tier}`}
                  size={80}
                  animate={true}
                  ariaLabel={`Tier ${tier} achievement badge`}
                />
                <p className="text-white/80 text-sm mt-2">
                  {
                    <>
                      <span role="img" aria-label="emoji">
                        T
                      </span>
                      <span role="img" aria-label="emoji">
                        i
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
                  {tier}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Soapstone Messages Demo */}
        <section>
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            {
              <>
                ''
                <span role="img" aria-label="emoji">
                  D
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
                ' '
                <span role="img" aria-label="emoji">
                  S
                </span>
                <span role="img" aria-label="emoji">
                  o
                </span>
                <span role="img" aria-label="emoji">
                  u
                </span>
                <span role="img" aria-label="emoji">
                  l
                </span>
                <span role="img" aria-label="emoji">
                  s
                </span>
                ' '
                <span role="img" aria-label="emoji">
                  S
                </span>
                <span role="img" aria-label="emoji">
                  o
                </span>
                <span role="img" aria-label="emoji">
                  a
                </span>
                <span role="img" aria-label="emoji">
                  p
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
                  n
                </span>
                <span role="img" aria-label="emoji">
                  e
                </span>
                ' '
                <span role="img" aria-label="emoji">
                  M
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
                <span role="img" aria-label="emoji">
                  a
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
                ''
              </>
            }
          </h2>
          <div className="space-y-4 max-w-2xl mx-auto">
            <SoapstoneMessageCard emphasis={0.9}>
              <p className="text-sm leading-relaxed text-white">
                {
                  <>
                    "
                    <span role="img" aria-label="emoji">
                      P
                    </span>
                    <span role="img" aria-label="emoji">
                      r
                    </span>
                    <span role="img" aria-label="emoji">
                      a
                    </span>
                    <span role="img" aria-label="emoji">
                      i
                    </span>
                    <span role="img" aria-label="emoji">
                      s
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
                    ' '
                    <span role="img" aria-label="emoji">
                      s
                    </span>
                    <span role="img" aria-label="emoji">
                      u
                    </span>
                    <span role="img" aria-label="emoji">
                      n
                    </span>
                    !' '
                    <span role="img" aria-label="emoji">
                      \
                    </span>
                    <span role="img" aria-label="emoji">
                      \
                    </span>
                    <span role="img" aria-label="emoji">
                      [
                    </span>
                    <span role="img" aria-label="emoji">
                      T
                    </span>
                    <span role="img" aria-label="emoji">
                      ]
                    </span>
                    /"
                  </>
                }
              </p>
            </SoapstoneMessageCard>

            <SoapstoneMessageCard emphasis={0.7}>
              <p className="text-sm leading-relaxed text-white">
                {
                  <>
                    "
                    <span role="img" aria-label="emoji">
                      T
                    </span>
                    <span role="img" aria-label="emoji">
                      r
                    </span>
                    <span role="img" aria-label="emoji">
                      y
                    </span>
                    ' '
                    <span role="img" aria-label="emoji">
                      j
                    </span>
                    <span role="img" aria-label="emoji">
                      u
                    </span>
                    <span role="img" aria-label="emoji">
                      m
                    </span>
                    <span role="img" aria-label="emoji">
                      p
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
                      f
                    </span>
                    <span role="img" aria-label="emoji">
                      f
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
                      c
                    </span>
                    <span role="img" aria-label="emoji">
                      l
                    </span>
                    <span role="img" aria-label="emoji">
                      i
                    </span>
                    <span role="img" aria-label="emoji">
                      f
                    </span>
                    <span role="img" aria-label="emoji">
                      f
                    </span>
                    "
                  </>
                }
              </p>
            </SoapstoneMessageCard>

            <SoapstoneMessageCard emphasis={0.8}>
              <p className="text-sm leading-relaxed text-white">
                {
                  <>
                    "
                    <span role="img" aria-label="emoji">
                      A
                    </span>
                    <span role="img" aria-label="emoji">
                      m
                    </span>
                    <span role="img" aria-label="emoji">
                      a
                    </span>
                    <span role="img" aria-label="emoji">
                      z
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
                      c
                    </span>
                    <span role="img" aria-label="emoji">
                      h
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
                    "
                  </>
                }
              </p>
            </SoapstoneMessageCard>

            <SoapstoneMessageCard emphasis={0.6}>
              <p className="text-sm leading-relaxed text-white">
                {
                  <>
                    "
                    <span role="img" aria-label="emoji">
                      B
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
                      r
                    </span>
                    <span role="img" aria-label="emoji">
                      y
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
                      a
                    </span>
                    <span role="img" aria-label="emoji">
                      m
                    </span>
                    <span role="img" aria-label="emoji">
                      b
                    </span>
                    <span role="img" aria-label="emoji">
                      u
                    </span>
                    <span role="img" aria-label="emoji">
                      s
                    </span>
                    <span role="img" aria-label="emoji">
                      h
                    </span>
                    "
                  </>
                }
              </p>
            </SoapstoneMessageCard>
          </div>
        </section>

        {/* Achievement Badges Demo */}
        <section>
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            {
              <>
                ''
                <span role="img" aria-label="emoji">
                  S
                </span>
                <span role="img" aria-label="emoji">
                  a
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
                ' '
                <span role="img" aria-label="emoji">
                  A
                </span>
                <span role="img" aria-label="emoji">
                  c
                </span>
                <span role="img" aria-label="emoji">
                  h
                </span>
                <span role="img" aria-label="emoji">
                  i
                </span>
                <span role="img" aria-label="emoji">
                  e
                </span>
                <span role="img" aria-label="emoji">
                  v
                </span>
                <span role="img" aria-label="emoji">
                  e
                </span>
                <span role="img" aria-label="emoji">
                  m
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
                ' '
                <span role="img" aria-label="emoji">
                  B
                </span>
                <span role="img" aria-label="emoji">
                  a
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
                <span role="img" aria-label="emoji">
                  s
                </span>
                ''
              </>
            }
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 justify-items-center">
            <FramedBadge
              badgeKey="shop:first_purchase"
              label="First Purchase"
              size={96}
              animate={true}
            />
            <FramedBadge badgeKey="lore:explorer" label="Lore Explorer" size={96} animate={true} />
            <FramedBadge
              badgeKey="puzzle_reveal:loreseeker"
              label="Puzzle Reveal Loreseeker"
              size={96}
              animate={true}
            />
            <FramedBadge
              badgeKey="bubble_girl:popthat"
              label="Bubble Girl Pop That"
              size={96}
              animate={true}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
