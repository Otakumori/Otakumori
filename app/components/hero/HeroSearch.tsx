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
      className="mt-5 flex w-full max-w-[31rem] flex-col gap-2 sm:flex-row"
      role="search"
    >
      <label htmlFor="home-world-search" className="sr-only">
        Search Otaku-mori products, games, and stories
      </label>
      <input
        id="home-world-search"
        name="q"
        type="search"
        placeholder={isMobile ? MOBILE_PLACEHOLDER : DESKTOP_PLACEHOLDER}
        className="min-h-[48px] flex-1 rounded-full border border-[#ffe2d0]/26 bg-[#09060b]/50 px-5 text-sm text-[#fff7ef] shadow-[0_16px_38px_rgba(0,0,0,0.35)] outline-none backdrop-blur-md transition placeholder:text-[#fff0f4]/62 focus:border-[#f3b3c8]/70 focus:ring-2 focus:ring-[#f3b3c8]/28"
      />
      <button
        type="submit"
        className="min-h-[48px] rounded-full border border-[#ffe3ca]/42 bg-[#120b0e]/46 px-5 text-sm font-semibold text-[#fff4e8] shadow-[0_16px_38px_rgba(0,0,0,0.32)] backdrop-blur-md transition hover:border-[#fff0d9]/70 hover:bg-[#f0b2bf]/18 focus:outline-none focus:ring-2 focus:ring-[#f3b3c8]/35"
      >
        Search
      </button>
    </form>
  );
}
