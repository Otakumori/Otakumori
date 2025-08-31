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
            Animated Category Banner
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
            Tier Frame Progression (1-10)
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
                <p className="text-white/80 text-sm mt-2">Tier {tier}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Soapstone Messages Demo */}
        <section>
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            Dark Souls Soapstone Messages
          </h2>
          <div className="space-y-4 max-w-2xl mx-auto">
            <SoapstoneMessageCard emphasis={0.9}>
              <p className="text-sm leading-relaxed text-white">"Praise the sun! \\[T]/"</p>
            </SoapstoneMessageCard>

            <SoapstoneMessageCard emphasis={0.7}>
              <p className="text-sm leading-relaxed text-white">"Try jumping off the cliff"</p>
            </SoapstoneMessageCard>

            <SoapstoneMessageCard emphasis={0.8}>
              <p className="text-sm leading-relaxed text-white">"Amazing chest ahead"</p>
            </SoapstoneMessageCard>

            <SoapstoneMessageCard emphasis={0.6}>
              <p className="text-sm leading-relaxed text-white">"Be wary of ambush"</p>
            </SoapstoneMessageCard>
          </div>
        </section>

        {/* Achievement Badges Demo */}
        <section>
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            Sample Achievement Badges
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
