'use client';

import { useEffect, useState } from 'react';

const DESKTOP_PLACEHOLDER = "What are ya eyein'?";
const MOBILE_PLACEHOLDER = "What are ya buyin'?";

function useMobileSearchCopy() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (!window.matchMedia) return;

    const query = window.matchMedia('(max-width: 639px)');
    const update = () => setIsMobile(query.matches);

    update();
    query.addEventListener('change', update);

    return () => query.removeEventListener('change', update);
  }, []);

  return isMobile;
}

export default function HeroSearch() {
  const isMobile = useMobileSearchCopy();

  return (
    <form
      action="/search"
      className="mt-4 w-full max-w-[31rem]"
      role="search"
    >
      <label htmlFor="home-world-search" className="sr-only">
        Search Otaku-mori products, games, and stories
      </label>
      <div className="relative">
        <input
          id="home-world-search"
          name="q"
          type="search"
          placeholder={isMobile ? MOBILE_PLACEHOLDER : DESKTOP_PLACEHOLDER}
          className="min-h-[50px] w-full rounded-full border border-[#ffe2d0]/26 bg-[#09060b]/50 py-3 pl-5 pr-14 text-sm text-[#fff7ef] shadow-[0_16px_38px_rgba(0,0,0,0.35)] outline-none backdrop-blur-md transition placeholder:text-[#fff0f4]/62 focus:border-[#f3b3c8]/70 focus:ring-2 focus:ring-[#f3b3c8]/28"
        />
        <button
          type="submit"
          aria-label="Search"
          className="absolute right-1 top-1/2 inline-flex min-h-[44px] min-w-[44px] -translate-y-1/2 items-center justify-center rounded-full border border-[#ffe3ca]/18 bg-[#120b0e]/34 text-[#fff4e8] backdrop-blur-sm transition hover:border-[#fff0d9]/54 hover:bg-[#f0b2bf]/16 focus:outline-none focus:ring-2 focus:ring-[#f3b3c8]/35"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.6"
          >
            <circle cx="10.75" cy="10.75" r="5.75" />
            <path d="m15.25 15.25 4 4" />
          </svg>
        </button>
      </div>
    </form>
  );
}
