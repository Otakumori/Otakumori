import Link from 'next/link';
import Image from 'next/image';
import { paths } from '@/lib/paths';
import HeroSearch from './HeroSearch';
import layoutStyles from './HeroLayout.module.css';

export default function HeroContent() {
  return (
    <div className={`${layoutStyles.heroContent} relative z-20 flex text-[#fff4e8]`}>
      <div
        className={`${layoutStyles.surfaceContent} mx-auto flex w-full max-w-7xl items-end px-4 pb-[7svh] pt-24 sm:px-6 md:items-center md:justify-end md:px-10 md:pb-0 md:pt-[12svh]`}
      >
        <div className={`${layoutStyles.heroCopy} w-full max-w-[31rem] text-left md:mr-[5vw] lg:mr-[8vw]`}>
          <h1
            id="home-hero-title"
            className={`${layoutStyles.title} font-display max-w-[24rem] text-balance text-xl font-semibold leading-[1.15] tracking-[-0.018em] text-[#fff1e4] sm:text-[1.35rem] md:text-[1.65rem]`}
          >
            You found Otaku-mori.
          </h1>

          <HeroSearch />

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link
              href={paths.shop()}
              className={`${layoutStyles.primaryAction} inline-flex min-h-[48px] items-center justify-center rounded-full px-6 text-sm font-semibold text-[#fff3e6] focus:outline-none`}
            >
              <span>Gear up</span>
              <Image
                src="/assets/home/ui/arrow-forward.png"
                alt=""
                width={32}
                height={22}
                sizes="32px"
                className="ml-2 h-[18px] w-[27px] object-contain"
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
