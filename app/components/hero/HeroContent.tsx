'use client';

import {
  MoriBody,
  MoriDisplayHeading,
  MoriEyebrow,
  MoriLink,
  MoriPanel,
} from '@/app/components/mori';

export default function HeroContent() {
  return (
    <div className="relative z-20 flex min-h-[100svh] items-center justify-center px-4 text-center">
      <MoriPanel className="max-w-3xl px-5 py-8 shadow-[0_30px_100px_rgba(0,0,0,0.45)] backdrop-blur-sm sm:px-10">
        <MoriEyebrow>Welcome, traveler</MoriEyebrow>
        <MoriDisplayHeading className="mt-4 md:text-7xl">
          Rest beneath the sakura tree
        </MoriDisplayHeading>
        <MoriBody className="mx-auto mt-5 max-w-2xl md:text-lg">
          Shop, play, and build your traveler identity inside a dark sakura storybook made for
          anime, games, and careful little rituals.
        </MoriBody>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <MoriLink href="/shop">Visit the Shop</MoriLink>
          <MoriLink href="/mini-games" variant="secondary">
            Play Mini-Games
          </MoriLink>
          <MoriLink href="/community" variant="secondary">
            Join the Community
          </MoriLink>
        </div>
      </MoriPanel>
    </div>
  );
}
