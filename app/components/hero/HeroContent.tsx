import Link from 'next/link';
import { paths } from '@/lib/paths';
import HeroSearch from './HeroSearch';
import RootFooter from './RootFooter';

export default function HeroContent() {
  return (
    <div className="relative z-20 flex flex-col text-[#fff4e8]">
      <div className="mx-auto flex min-h-[100svh] w-full max-w-7xl items-end px-4 pb-[7svh] pt-24 sm:px-6 md:items-center md:justify-end md:px-10 md:pb-0 md:pt-[12svh]">
        <div className="w-full max-w-[31rem] text-left md:mr-[5vw] lg:mr-[8vw]">
          <h1
            id="home-hero-title"
            className="font-display max-w-[24rem] text-balance text-lg font-semibold leading-tight tracking-tight text-[#fff1e4] drop-shadow-[0_3px_18px_rgba(0,0,0,0.72)] sm:text-xl md:text-2xl"
          >
            You found Otaku-mori.
          </h1>

          <HeroSearch />

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link
              href={paths.shop()}
              className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-[#ffe3ca]/52 bg-[#f7c2bf]/18 px-6 text-sm font-semibold text-[#fff3e6] shadow-[0_16px_44px_rgba(0,0,0,0.36)] backdrop-blur-md transition hover:border-[#fff1df]/78 hover:bg-[#f8bdc9]/25 focus:outline-none focus:ring-2 focus:ring-[#f3b3c8]/35"
            >
              Gear up &rarr;
            </Link>
          </div>
        </div>
      </div>

      <RootFooter />
    </div>
  );
}
